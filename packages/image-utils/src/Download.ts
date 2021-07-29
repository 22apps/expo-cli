import crypto from 'crypto';
import fs from 'fs';
import { move } from 'fs-extra';
// @ts-ignore
import Jimp from 'jimp-compact';
import fetch from 'node-fetch';
import os from 'os';
import path from 'path';
import stream from 'stream';
import util from 'util';

const tempDir = () => {
  const folder = crypto.randomBytes(16).toString('hex').slice(0, 32);
  const directory = path.join(fs.realpathSync(os.tmpdir()), folder);
  fs.mkdirSync(directory);
  return directory;
};

// cache downloaded images into memory
const cacheDownloadedKeys: Record<string, string> = {};

function stripQueryParams(url: string): string {
  return url.split('?')[0].split('#')[0];
}

export async function downloadOrUseCachedImage(url: string): Promise<string> {
  if (url in cacheDownloadedKeys) {
    return cacheDownloadedKeys[url];
  }
  if (url.startsWith('http')) {
    cacheDownloadedKeys[url] = await downloadImage(url);
  } else {
    cacheDownloadedKeys[url] = url;
  }
  return cacheDownloadedKeys[url];
}

export async function downloadImage(url: string): Promise<string> {
  const outputPath = tempDir();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`It was not possible to download image from '${url}'`);
  }

  // Download to local file
  const streamPipeline = util.promisify(stream.pipeline);
  const localPath = path.join(outputPath, path.basename(stripQueryParams(url)));
  await streamPipeline(response.body, fs.createWriteStream(localPath));

  // If an image URL doesn't have a name, get the mime type and move the file.
  const img = await Jimp.read(localPath);
  const mime = img.getMIME().split('/').pop()!;
  if (!localPath.endsWith(mime)) {
    const newPath = path.join(outputPath, `image.${mime}`);
    await move(localPath, newPath);
    return newPath;
  }

  return localPath;
}
