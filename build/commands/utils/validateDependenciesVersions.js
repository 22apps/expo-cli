"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateDependenciesVersionsAsync = validateDependenciesVersionsAsync;

function _jsonFile() {
  const data = _interopRequireDefault(require("@expo/json-file"));

  _jsonFile = function () {
    return data;
  };

  return data;
}

function _assert() {
  const data = _interopRequireDefault(require("assert"));

  _assert = function () {
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

function _resolveFrom() {
  const data = _interopRequireDefault(require("resolve-from"));

  _resolveFrom = function () {
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

function _xdl() {
  const data = require("xdl");

  _xdl = function () {
    return data;
  };

  return data;
}

function _CommandError() {
  const data = _interopRequireDefault(require("../../CommandError"));

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

function _bundledNativeModules() {
  const data = require("./bundledNativeModules");

  _bundledNativeModules = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function validateDependenciesVersionsAsync(projectRoot, exp, pkg) {
  // expo package for SDK < 33.0.0 does not have bundledNativeModules.json
  if (!_xdl().Versions.gteSdkVersion(exp, '33.0.0')) {
    return false;
  }

  let bundledNativeModules = null;

  try {
    (0, _assert().default)(exp.sdkVersion);
    bundledNativeModules = await (0, _bundledNativeModules().getBundledNativeModulesAsync)(projectRoot, // sdkVersion is defined here because we ran the >= 33.0.0 check before
    exp.sdkVersion);
  } catch {
    _log().default.warn(`Your project uses Expo SDK version >= 33.0.0, but the ${_chalk().default.bold('expo')} package version seems to be older.`);

    return false;
  } // intersection of packages from package.json and bundled native modules


  const packagesToCheck = getPackagesToCheck(pkg.dependencies, bundledNativeModules); // read package versions from the file system (node_modules)

  const packageVersions = await resolvePackageVersionsAsync(projectRoot, packagesToCheck); // find incorrect dependencies by comparing the actual package versions with the bundled native module version ranges

  const incorrectDeps = findIncorrectDependencies(packageVersions, bundledNativeModules);

  if (incorrectDeps.length > 0) {
    _log().default.warn('Some dependencies are incompatible with the installed expo package version:');

    incorrectDeps.forEach(({
      packageName,
      expectedVersionOrRange,
      actualVersion
    }) => {
      _log().default.warn(` - ${_chalk().default.underline(packageName)} - expected version: ${_chalk().default.underline(expectedVersionOrRange)} - actual version installed: ${_chalk().default.underline(actualVersion)}`);
    });

    _log().default.warn('Your project may not work correctly until you install the correct versions of the packages.\n' + `To install the correct versions of these packages, please run: ${_chalk().default.inverse('expo install [package-name ...]')}`);

    return false;
  }

  return true;
}

function getPackagesToCheck(dependencies, bundledNativeModules) {
  const dependencyNames = Object.keys(dependencies !== null && dependencies !== void 0 ? dependencies : {});
  const result = [];

  for (const dependencyName of dependencyNames) {
    if (dependencyName in bundledNativeModules) {
      result.push(dependencyName);
    }
  }

  return result;
}

async function resolvePackageVersionsAsync(projectRoot, packages) {
  const packageVersionsFromPackageJSON = await Promise.all(packages.map(packageName => getPackageVersionAsync(projectRoot, packageName)));
  return packages.reduce((acc, packageName, idx) => {
    acc[packageName] = packageVersionsFromPackageJSON[idx];
    return acc;
  }, {});
}

async function getPackageVersionAsync(projectRoot, packageName) {
  let packageJsonPath;

  try {
    packageJsonPath = (0, _resolveFrom().default)(projectRoot, `${packageName}/package.json`);
  } catch (error) {
    // This is a workaround for packages using `exports`. If this doesn't
    // include `package.json`, we have to use the error message to get the location.
    if (error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      var _error$message$match;

      packageJsonPath = (_error$message$match = error.message.match(/("exports"|defined) in (.*)$/i)) === null || _error$message$match === void 0 ? void 0 : _error$message$match[2];
    }
  }

  if (!packageJsonPath) {
    throw new (_CommandError().default)(`"${packageName}" is added as a dependency in your project's package.json but it doesn't seem to be installed. Please run "yarn" or "npm install" to fix this issue.`);
  }

  const packageJson = await _jsonFile().default.readAsync(packageJsonPath);
  return packageJson.version;
}

function findIncorrectDependencies(packageVersions, bundledNativeModules) {
  const packages = Object.keys(packageVersions);
  const incorrectDeps = [];

  for (const packageName of packages) {
    const expectedVersionOrRange = bundledNativeModules[packageName];
    const actualVersion = packageVersions[packageName];

    if (typeof expectedVersionOrRange === 'string' && !_semver().default.intersects(expectedVersionOrRange, actualVersion)) {
      incorrectDeps.push({
        packageName,
        expectedVersionOrRange,
        actualVersion
      });
    }
  }

  return incorrectDeps;
}
//# sourceMappingURL=validateDependenciesVersions.js.map