"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.actionAsync = actionAsync;

function _clearNativeFolder() {
  const data = require("./eject/clearNativeFolder");

  _clearNativeFolder = function () {
    return data;
  };

  return data;
}

function _platformOptions() {
  const data = require("./eject/platformOptions");

  _platformOptions = function () {
    return data;
  };

  return data;
}

function _prebuildAsync() {
  const data = require("./eject/prebuildAsync");

  _prebuildAsync = function () {
    return data;
  };

  return data;
}

function _maybeBailOnGitStatusAsync() {
  const data = _interopRequireDefault(require("./utils/maybeBailOnGitStatusAsync"));

  _maybeBailOnGitStatusAsync = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function actionAsync(projectRoot, {
  platform,
  clean,
  skipDependencyUpdate,
  ...options
}) {
  if (options.npm) {
    options.packageManager = 'npm';
  }

  const platforms = (0, _platformOptions().platformsFromPlatform)(platform);

  if (clean) {
    if (await (0, _maybeBailOnGitStatusAsync().default)()) return; // Clear the native folders before syncing

    await (0, _clearNativeFolder().clearNativeFolder)(projectRoot, platforms);
  } else {
    await (0, _clearNativeFolder().promptToClearMalformedNativeProjectsAsync)(projectRoot, platforms);
  }

  await (0, _prebuildAsync().prebuildAsync)(projectRoot, { ...options,
    skipDependencyUpdate: skipDependencyUpdate ? skipDependencyUpdate.split(',') : [],
    platforms
  });
}
//# sourceMappingURL=prebuildAsync.js.map