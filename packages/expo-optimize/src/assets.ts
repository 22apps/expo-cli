import { getConfig, getWebOutputPath } from '@expo/config';
import { isAvailableAsync, sharpAsync } from '@expo/image-utils';
import JsonFile from '@expo/json-file';
import chalk from 'chalk';
import crypto from 'crypto';
import {
  ensureDirSync,
  existsSync,
  move,
  readFile,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs-extra';
import { sync as globSync } from 'glob';
import { cpus } from 'os';
import pLimit from 'p-limit';
import { basename, join, parse, relative } from 'path';
import prettyBytes from 'pretty-bytes';
import temporary from 'tempy';

export type AssetOptimizationState = Record<string, boolean>;

// Read the contents of assets.json under .expo-shared folder. Create the file/directory if they don't exist.
async function readAssetJsonAsync(
  projectRoot: string
): Promise<{ assetJson: JsonFile<AssetOptimizationState>; assetInfo: AssetOptimizationState }> {
  const dirPath = join(projectRoot, '.expo-shared');

  ensureDirSync(dirPath);

  const readmeFilePath = join(dirPath, 'README.md');
  if (!existsSync(readmeFilePath)) {
    writeFileSync(
      readmeFilePath,
      `> Why do I have a folder named ".expo-shared" in my project?

The ".expo-shared" folder is created when running commands that produce state that is intended to be shared with all developers on the project. For example, "npx expo-optimize".

> What does the "assets.json" file contain?

The "assets.json" file describes the assets that have been optimized through "expo-optimize" and do not need to be processed again.

> Should I commit the ".expo-shared" folder?

Yes, you should share the ".expo-shared" folder with your collaborators.
`
    );
  }

  const assetJson = new JsonFile<AssetOptimizationState>(join(dirPath, 'assets.json'));
  if (!existsSync(assetJson.file)) {
    console.log();
    console.log(
      chalk.magenta(
        `\u203A Creating ${chalk.bold('.expo-shared/assets.json')} in the project's root directory.`
      )
    );
    console.log(
      chalk.magenta`\u203A This file is autogenerated and should not be edited directly.`
    );
    console.log(
      chalk.magenta`\u203A You should commit this to git so that asset state is shared between collaborators.`
    );
    console.log();

    await assetJson.writeAsync({});
  }
  const assetInfo = await assetJson.readAsync();
  return { assetJson, assetInfo };
}

// Compress an inputted jpg or png
async function optimizeImageAsync(inputPath: string, quality: number): Promise<string> {
  const outputPath = temporary.directory();
  await sharpAsync({
    input: inputPath,
    output: outputPath,
    quality,
    // https://sharp.pixelplumbing.com/en/stable/api-output/#parameters_4
    adaptiveFiltering: true,
  });
  return join(outputPath, basename(inputPath));
}

// Add .orig extension to a filename in a path string
function createNewFilename(imagePath: string): string {
  const { dir, name, ext } = parse(imagePath);
  return join(dir, `${name}.orig${ext}`);
}

// Find all project assets under assetBundlePatterns in app.json excluding node_modules.
// If --include of --exclude flags were passed in those results are filtered out.
async function getAssetFilesAsync(
  projectRoot: string,
  options: OptimizationOptions
): Promise<{ allFiles: string[]; selectedFiles: string[] }> {
  const { exp } = getConfig(projectRoot, {
    skipSDKVersionRequirement: true,
  });
  const webOutputPath = await getWebOutputPath(exp);
  const { assetBundlePatterns } = exp;
  const globOptions = {
    cwd: projectRoot,
    ignore: ['**/node_modules/**', '**/ios/**', '**/android/**', `**/${webOutputPath}/**`],
  };

  // All files must be returned even if flags are passed in to properly update assets.json
  const allFiles: string[] = [];
  const patterns = assetBundlePatterns || ['**/*'];
  patterns.forEach((pattern: string) => {
    allFiles.push(...globSync(pattern, globOptions));
  });
  // If --include is passed in, only return files matching that pattern
  const included =
    options && options.include ? [...globSync(options.include, globOptions)] : allFiles;
  const toExclude = new Set();
  if (options && options.exclude) {
    globSync(options.exclude, globOptions).forEach(file => toExclude.add(file));
  }
  // If --exclude is passed in, filter out files matching that pattern
  const excluded = included.filter(file => !toExclude.has(file));
  const filtered = options && options.exclude ? excluded : included;
  return {
    allFiles: filterImages(allFiles, projectRoot),
    selectedFiles: filterImages(filtered, projectRoot),
  };
}

// Formats an array of files to include the project directory and filters out PNGs and JPGs.
function filterImages(files: string[], projectRoot: string) {
  const regex = /\.(png|jpg|jpeg)$/;
  const withDirectory = files.map(file => `${projectRoot}/${file}`.replace('//', '/'));
  const allImages = withDirectory.filter(file => regex.test(file.toLowerCase()));
  return allImages;
}

// Calculate SHA256 Checksum value of a file based on its contents
async function calculateHash(filePath: string): Promise<string> {
  const contents = await new Promise<Buffer>((resolve, reject) =>
    readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    })
  );

  return crypto.createHash('sha256').update(contents).digest('hex');
}
export type OptimizationOptions = {
  quality?: number;
  include?: string;
  exclude?: string;
  save?: boolean;
};

async function pool<T, R>(items: T[], process: (item: T) => Promise<R>): Promise<R[]> {
  const parallelism = Math.max(1, cpus().length - 1);
  const limit = pLimit(parallelism);
  return Promise.all(items.map(item => limit(() => process(item))));
}

// Returns a boolean indicating whether or not there are assets to optimize
export async function isProjectOptimized(
  projectRoot: string,
  options: OptimizationOptions
): Promise<boolean> {
  if (!existsSync(join(projectRoot, '.expo-shared/assets.json'))) {
    return false;
  }
  const { selectedFiles } = await getAssetFilesAsync(projectRoot, options);
  const { assetInfo } = await readAssetJsonAsync(projectRoot);
  let optimized = true;
  const result = await pool(selectedFiles, async file => {
    // no need to keep hashing once we've found out we're unoptimized
    optimized &&= assetInfo[await calculateHash(file)];
    return optimized;
  });

  return result.every(Boolean);
}

export async function optimizeAsync(
  projectRoot: string = './',
  options: OptimizationOptions = {}
): Promise<void> {
  console.log();
  console.log(chalk.bold`\u203A Optimizing assets...`);

  const { assetJson, assetInfo } = await readAssetJsonAsync(projectRoot);
  // Keep track of which hash values in assets.json are no longer in use
  const outdated = new Set<string>();
  for (const fileHash in assetInfo) outdated.add(fileHash);

  let totalSaved = 0;
  const { allFiles, selectedFiles } = await getAssetFilesAsync(projectRoot, options);

  const hashes: { [filePath: string]: string } = Object.fromEntries(
    await pool(allFiles, async filePath => {
      const hash = await calculateHash(filePath);
      if (assetInfo[hash]) {
        // Remove assets that have been deleted/modified from assets.json
        outdated.delete(hash);
      }
      return [filePath, hash];
    })
  );

  outdated.forEach(outdatedHash => {
    delete assetInfo[outdatedHash];
  });

  const { include, exclude, save } = options;
  const quality = options.quality == null ? 80 : options.quality;

  const images = include || exclude ? selectedFiles : allFiles;

  // Buffer output so we can display all the output for a single image
  // at once
  const poolResult = await pool(images, async image => {
    const logLines: string[] = [];
    const hash = hashes[image];
    if (assetInfo[hash]) {
      return logLines;
    }

    if (!(await isAvailableAsync())) {
      logLines.push(
        chalk.bold.red(
          `\u203A Cannot optimize images without sharp-cli.\n\u203A Run this command again after successfully installing sharp with \`${chalk.magenta`npm install -g sharp-cli`}\``
        )
      );
      return logLines;
    }

    const { size: prevSize } = statSync(image);

    const newName = createNewFilename(image);

    logLines.push(`\u203A Checking ${chalk.reset.bold(relative(projectRoot, image))}`);
    const optimizedImage = await optimizeImageAsync(image, quality);

    const { size: newSize } = statSync(optimizedImage);
    const amountSaved = prevSize - newSize;
    if (amountSaved > 0) {
      await move(image, newName);
      await move(optimizedImage, image);
    } else {
      assetInfo[hash] = true;
      logLines.push(
        chalk.dim(
          amountSaved === 0
            ? ` \u203A Skipping: Original was identical in size.`
            : ` \u203A Skipping: Original was ${prettyBytes(amountSaved * -1)} smaller.`
        )
      );
      return logLines;
    }
    // Recalculate hash since the image has changed
    const newHash = await calculateHash(image);
    assetInfo[newHash] = true;

    if (save) {
      if (hash === newHash) {
        logLines.push(
          chalk.gray(
            `\u203A Compressed asset ${image} is identical to the original. Using original instead.`
          )
        );
        unlinkSync(newName);
      } else {
        logLines.push(chalk.gray(`\u203A Saving original asset to ${newName}`));
        // Save the old hash to prevent reoptimizing
        assetInfo[hash] = true;
      }
    } else {
      // Delete the renamed original asset
      unlinkSync(newName);
    }
    if (amountSaved) {
      totalSaved += amountSaved;
      logLines.push(chalk.magenta(`\u203A Saved ${prettyBytes(amountSaved)}`));
    } else {
      logLines.push(chalk.gray(`\u203A Nothing to compress.`));
    }

    return logLines;
  });

  poolResult.forEach(logLines => logLines.forEach(line => console.log(line)));

  console.log();
  if (totalSaved === 0) {
    console.log(chalk.yellow`\u203A All assets were fully optimized already.`);
  } else {
    console.log(
      chalk.bold(
        `\u203A Finished compressing assets. ${chalk.green(prettyBytes(totalSaved))} saved.`
      )
    );
  }
  assetJson.writeAsync(assetInfo);
}
