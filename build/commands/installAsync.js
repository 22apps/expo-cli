"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.actionAsync = actionAsync;

function _config() {
  const data = require("@expo/config");

  _config = function () {
    return data;
  };

  return data;
}

function PackageManager() {
  const data = _interopRequireWildcard(require("@expo/package-manager"));

  PackageManager = function () {
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

function _npmPackageArg() {
  const data = _interopRequireDefault(require("npm-package-arg"));

  _npmPackageArg = function () {
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

function _xdl() {
  const data = require("xdl");

  _xdl = function () {
    return data;
  };

  return data;
}

function _CommandError() {
  const data = _interopRequireWildcard(require("../CommandError"));

  _CommandError = function () {
    return data;
  };

  return data;
}

function _log() {
  const data = _interopRequireDefault(require("../log"));

  _log = function () {
    return data;
  };

  return data;
}

function _getRemoteVersionsForSdk() {
  const data = require("../utils/getRemoteVersionsForSdk");

  _getRemoteVersionsForSdk = function () {
    return data;
  };

  return data;
}

function _ProjectUtils() {
  const data = require("./utils/ProjectUtils");

  _ProjectUtils = function () {
    return data;
  };

  return data;
}

function _autoAddConfigPluginsAsync() {
  const data = require("./utils/autoAddConfigPluginsAsync");

  _autoAddConfigPluginsAsync = function () {
    return data;
  };

  return data;
}

function _bundledNativeModules() {
  const data = require("./utils/bundledNativeModules");

  _bundledNativeModules = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function resolveExpoProjectRootAsync() {
  try {
    const info = await (0, _ProjectUtils().findProjectRootAsync)(process.cwd());
    return info.projectRoot;
  } catch (error) {
    if (error.code !== 'NO_PROJECT') {
      // An unknown error occurred.
      throw error;
    } // This happens when an app.config exists but a package.json is not present.


    _log().default.addNewLineIfNone();

    _log().default.error(error.message);

    _log().default.newLine();

    _log().default.log(_chalk().default.cyan(`You can create a new project with ${_chalk().default.bold(`expo init`)}`));

    _log().default.newLine();

    throw new (_CommandError().SilentError)(error);
  }
}

async function actionAsync(packages, options) {
  var _pkg$dependencies;

  const projectRoot = await resolveExpoProjectRootAsync();
  const packageManager = PackageManager().createForProject(projectRoot, {
    npm: options.npm,
    yarn: options.yarn,
    log: _log().default.log
  });
  let {
    exp,
    pkg
  } = (0, _config().getConfig)(projectRoot, {
    skipSDKVersionRequirement: true,
    // Sometimes users will add a plugin to the config before installing the library,
    // this wouldn't work unless we dangerously disable plugin serialization.
    skipPlugins: true
  }); // If using `expo install` in a project without the expo package even listed
  // in package.json, just fall through to npm/yarn.
  //

  if (!((_pkg$dependencies = pkg.dependencies) !== null && _pkg$dependencies !== void 0 && _pkg$dependencies['expo'])) {
    return await packageManager.addAsync(...packages);
  }

  if (!exp.sdkVersion) {
    _log().default.addNewLineIfNone();

    throw new (_CommandError().default)(`The ${_chalk().default.bold(`expo`)} package was found in your ${_chalk().default.bold(`package.json`)} but we couldn't resolve the Expo SDK version. Run ${_chalk().default.bold(`${packageManager.name.toLowerCase()} install`)} and then try this command again.\n`);
  }

  if (!_xdl().Versions.gteSdkVersion(exp, '33.0.0')) {
    const message = `${_chalk().default.bold(`expo install`)} is only available for Expo SDK version 33 or higher.`;

    _log().default.addNewLineIfNone();

    _log().default.error(message);

    _log().default.newLine();

    _log().default.log(_chalk().default.cyan(`Current version: ${_chalk().default.bold(exp.sdkVersion)}`));

    _log().default.newLine();

    throw new (_CommandError().SilentError)(message);
  } // This shouldn't be invoked because `findProjectRootAsync` will throw if node_modules are missing.
  // Every React project should have react installed...


  if (!_resolveFrom().default.silent(projectRoot, 'react')) {
    _log().default.addNewLineIfNone();

    _log().default.log(_chalk().default.cyan(`node_modules not found, running ${packageManager.name} install command.`));

    _log().default.newLine();

    await packageManager.installAsync();
  }

  const bundledNativeModules = await (0, _bundledNativeModules().getBundledNativeModulesAsync)(projectRoot, exp.sdkVersion);
  const versionsForSdk = await (0, _getRemoteVersionsForSdk().getRemoteVersionsForSdk)(exp.sdkVersion);
  let nativeModulesCount = 0;
  let othersCount = 0;
  const versionedPackages = packages.map(arg => {
    const {
      name,
      type,
      raw
    } = (0, _npmPackageArg().default)(arg);

    if (['tag', 'version', 'range'].includes(type) && name && bundledNativeModules[name]) {
      // Unimodule packages from npm registry are modified to use the bundled version.
      nativeModulesCount++;
      return `${name}@${bundledNativeModules[name]}`;
    } else if (name && versionsForSdk[name]) {
      // Some packages have the recommended version listed in https://exp.host/--/api/v2/versions.
      othersCount++;
      return `${name}@${versionsForSdk[name]}`;
    } else {
      // Other packages are passed through unmodified.
      othersCount++;
      return raw;
    }
  });
  const messages = [nativeModulesCount > 0 && `${nativeModulesCount} SDK ${exp.sdkVersion} compatible native ${nativeModulesCount === 1 ? 'module' : 'modules'}`, othersCount > 0 && `${othersCount} other ${othersCount === 1 ? 'package' : 'packages'}`].filter(Boolean);

  _log().default.log(`Installing ${messages.join(' and ')} using ${packageManager.name}.`);

  await packageManager.addAsync(...versionedPackages);

  try {
    exp = (0, _config().getConfig)(projectRoot, {
      skipSDKVersionRequirement: true,
      skipPlugins: true
    }).exp; // Only auto add plugins if the plugins array is defined or if the project is using SDK +42.

    await (0, _autoAddConfigPluginsAsync().autoAddConfigPluginsAsync)(projectRoot, exp, versionedPackages.map(pkg => pkg.split('@')[0]).filter(Boolean));
  } catch (error) {
    if (error.isPluginError) {
      _log().default.warn(`Skipping config plugin check: ` + error.message);

      return;
    }

    throw error;
  }
}
//# sourceMappingURL=installAsync.js.map