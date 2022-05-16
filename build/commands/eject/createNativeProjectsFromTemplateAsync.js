"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNativeProjectsFromTemplateAsync = createNativeProjectsFromTemplateAsync;
exports.resolveBareEntryFile = resolveBareEntryFile;

function _paths() {
  const data = require("@expo/config/paths");

  _paths = function () {
    return data;
  };

  return data;
}

function _chalk() {
  const data = _interopRequireDefault(require("chalk"));

  _chalk = function () {
    return data;
  };

  return data;
}

function _fsExtra() {
  const data = _interopRequireDefault(require("fs-extra"));

  _fsExtra = function () {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
    return data;
  };

  return data;
}

function _semver() {
  const data = _interopRequireDefault(require("semver"));

  _semver = function () {
    return data;
  };

  return data;
}

function _CommandError() {
  const data = require("../../CommandError");

  _CommandError = function () {
    return data;
  };

  return data;
}

function _log() {
  const data = _interopRequireDefault(require("../../log"));

  _log = function () {
    return data;
  };

  return data;
}

function _ora() {
  const data = require("../../utils/ora");

  _ora = function () {
    return data;
  };

  return data;
}

function GitIgnore() {
  const data = _interopRequireWildcard(require("../utils/GitIgnore"));

  GitIgnore = function () {
    return data;
  };

  return data;
}

function _npm() {
  const data = require("../utils/npm");

  _npm = function () {
    return data;
  };

  return data;
}

function _Github() {
  const data = require("./Github");

  _Github = function () {
    return data;
  };

  return data;
}

function _updatePackageJson() {
  const data = require("./updatePackageJson");

  _updatePackageJson = function () {
    return data;
  };

  return data;
}

function _writeMetroConfig() {
  const data = require("./writeMetroConfig");

  _writeMetroConfig = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function directoryExistsAsync(file) {
  var _await$fs$stat$catch$, _await$fs$stat$catch;

  return (_await$fs$stat$catch$ = (_await$fs$stat$catch = await _fsExtra().default.stat(file).catch(() => null)) === null || _await$fs$stat$catch === void 0 ? void 0 : _await$fs$stat$catch.isDirectory()) !== null && _await$fs$stat$catch$ !== void 0 ? _await$fs$stat$catch$ : false;
}
/**
 *
 * @param projectRoot
 * @param tempDir
 *
 * @return `true` if the project is ejecting, and `false` if it's syncing.
 */


async function createNativeProjectsFromTemplateAsync({
  projectRoot,
  exp,
  pkg,
  template,
  tempDir,
  platforms,
  skipDependencyUpdate
}) {
  const copiedPaths = await cloneNativeDirectoriesAsync({
    projectRoot,
    template,
    tempDir,
    exp,
    pkg,
    platforms
  });
  (0, _writeMetroConfig().writeMetroConfig)({
    projectRoot,
    pkg,
    tempDir
  });
  const depsResults = await (0, _updatePackageJson().updatePackageJSONAsync)({
    projectRoot,
    tempDir,
    pkg,
    skipDependencyUpdate
  });
  return {
    hasNewProjectFiles: !!copiedPaths.length,
    // If the iOS folder changes or new packages are added, we should rerun pod install.
    needsPodInstall: copiedPaths.includes('ios') || depsResults.hasNewDependencies || depsResults.hasNewDevDependencies,
    ...depsResults
  };
}
/**
 * Extract the template and copy the ios and android directories over to the project directory.
 *
 * @param force should create native projects even if they already exist.
 * @return `true` if any project files were created.
 */


async function cloneNativeDirectoriesAsync({
  projectRoot,
  tempDir,
  template,
  exp,
  pkg,
  platforms
}) {
  // NOTE(brentvatne): Removing spaces between steps for now, add back when
  // there is some additional context for steps
  const creatingNativeProjectStep = (0, _ora().logNewSection)('Creating native project directories (./ios and ./android) and updating .gitignore');
  const targetPaths = getTargetPaths(projectRoot, pkg, platforms);
  let copiedPaths = [];
  let skippedPaths = [];

  try {
    if (template) {
      await (0, _Github().resolveTemplateArgAsync)(tempDir, creatingNativeProjectStep, exp.name, template);
    } else {
      const templatePackageName = await getTemplateNpmPackageName(exp.sdkVersion);
      await (0, _npm().getNpmUrlAsync)(templatePackageName);
      await (0, _npm().downloadAndExtractNpmModuleAsync)(templatePackageName, {
        cwd: tempDir,
        name: exp.name
      });
    }

    [copiedPaths, skippedPaths] = await copyPathsFromTemplateAsync(projectRoot, tempDir, targetPaths);
    const results = GitIgnore().mergeGitIgnorePaths(_path().default.join(projectRoot, '.gitignore'), _path().default.join(tempDir, '.gitignore'));
    let message = `Created native project${platforms.length > 1 ? 's' : ''}`;

    if (skippedPaths.length) {
      message += _chalk().default.dim(` | ${skippedPaths.map(path => _chalk().default.bold(`/${path}`)).join(', ')} already created`);
    }

    if (!(results !== null && results !== void 0 && results.didMerge)) {
      message += _chalk().default.dim(` | gitignore already synced`);
    } else if (results.didMerge && results.didClear) {
      message += _chalk().default.dim(` | synced gitignore`);
    }

    creatingNativeProjectStep.succeed(message);
  } catch (e) {
    if (!(e instanceof _CommandError().AbortCommandError)) {
      _log().default.error(e.message);
    }

    creatingNativeProjectStep.fail('Failed to create the native project.');

    _log().default.log(_chalk().default.yellow('You may want to delete the `./ios` and/or `./android` directories before trying again.'));

    throw new (_CommandError().SilentError)(e);
  }

  return copiedPaths;
}
/** Given an `sdkVersion` like `44.0.0` return a fully qualified NPM package name like: `expo-template-bare-minimum@sdk-44` */


function getTemplateNpmPackageName(sdkVersion) {
  // When undefined or UNVERSIONED, we use the latest version.
  if (!sdkVersion || sdkVersion === 'UNVERSIONED') {
    _log().default.log('Using an unspecified Expo SDK version. The latest template will be used.');

    return `expo-template-bare-minimum@latest`;
  }

  return `expo-template-bare-minimum@sdk-${_semver().default.major(sdkVersion)}`;
}

async function copyPathsFromTemplateAsync(projectRoot, templatePath, paths) {
  const copiedPaths = [];
  const skippedPaths = [];

  for (const targetPath of paths) {
    const projectPath = _path().default.join(projectRoot, targetPath);

    if (!(await directoryExistsAsync(projectPath))) {
      copiedPaths.push(targetPath);

      _fsExtra().default.copySync(_path().default.join(templatePath, targetPath), projectPath);
    } else {
      skippedPaths.push(targetPath);
    }
  }

  return [copiedPaths, skippedPaths];
}

function getTargetPaths(projectRoot, pkg, platforms) {
  const targetPaths = [...platforms];
  const bareEntryFile = resolveBareEntryFile(projectRoot, pkg.main); // Only create index.js if we cannot resolve the existing entry point (after replacing the expo entry).

  if (!bareEntryFile) {
    targetPaths.push('index.js');
  }

  return targetPaths;
}

function resolveBareEntryFile(projectRoot, main) {
  // expo app entry is not needed for bare projects.
  if ((0, _updatePackageJson().isPkgMainExpoAppEntry)(main)) return null; // Look at the `package.json`s `main` field for the main file.

  const resolvedMainField = main !== null && main !== void 0 ? main : './index'; // Get a list of possible extensions for the main file.

  const extensions = (0, _paths().getBareExtensions)(['ios', 'android']); // Testing the main field against all of the provided extensions - for legacy reasons we can't use node module resolution as the package.json allows you to pass in a file without a relative path and expect it as a relative path.

  return (0, _paths().getFileWithExtensions)(projectRoot, resolvedMainField, extensions);
}
//# sourceMappingURL=createNativeProjectsFromTemplateAsync.js.map