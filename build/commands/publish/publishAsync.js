"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.actionAsync = actionAsync;
exports.isInvalidReleaseChannel = isInvalidReleaseChannel;
exports.logBareWorkflowWarnings = logBareWorkflowWarnings;
exports.logExpoUpdatesWarnings = logExpoUpdatesWarnings;
exports.logOptimizeWarnings = logOptimizeWarnings;

function _config() {
  const data = require("@expo/config");

  _config = function () {
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

function _fs() {
  const data = _interopRequireDefault(require("fs"));

  _fs = function () {
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

function _xdl() {
  const data = require("xdl");

  _xdl = function () {
    return data;
  };

  return data;
}

function _CommandError() {
  const data = _interopRequireWildcard(require("../../CommandError"));

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

function TerminalLink() {
  const data = _interopRequireWildcard(require("../utils/TerminalLink"));

  TerminalLink = function () {
    return data;
  };

  return data;
}

function _logConfigWarnings() {
  const data = require("../utils/logConfigWarnings");

  _logConfigWarnings = function () {
    return data;
  };

  return data;
}

function sendTo() {
  const data = _interopRequireWildcard(require("../utils/sendTo"));

  sendTo = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EAS_UPDATE_URL = 'https://u.expo.dev';

async function actionAsync(projectRoot, options = {}) {
  var _options$target;

  assertValidReleaseChannel(options.releaseChannel);
  const {
    exp,
    pkg
  } = (0, _config().getConfig)(projectRoot, {
    skipSDKVersionRequirement: true
  });
  assertUpdateURLCorrectlyConfigured(exp);
  const {
    sdkVersion,
    runtimeVersion
  } = exp; // TODO(@jkhales): remove this check when runtimeVersion policies are supported, if they are ever supported

  if (typeof runtimeVersion !== 'undefined' && typeof runtimeVersion !== 'string') {
    throw new (_CommandError().default)(_CommandError().ErrorCodes.INVALID_RUNTIME_VERSION, `Runtime version policies are not supported by the publish command.`);
  }

  const target = (_options$target = options.target) !== null && _options$target !== void 0 ? _options$target : (0, _config().getDefaultTarget)(projectRoot); // note: this validates the exp.owner when the user is a robot

  const user = await _xdl().UserManager.ensureLoggedInAsync();

  const owner = _xdl().UserManager.getProjectOwner(user, exp);

  _log().default.addNewLineIfNone(); // Log building info before building.
  // This gives the user sometime to bail out if the info is unexpected.


  if (runtimeVersion) {
    _log().default.log(`\u203A Runtime version: ${_chalk().default.bold(runtimeVersion)}`);
  } else if (sdkVersion) {
    _log().default.log(`\u203A Expo SDK: ${_chalk().default.bold(sdkVersion)}`);
  }

  _log().default.log(`\u203A Release channel: ${_chalk().default.bold(options.releaseChannel)}`);

  _log().default.log(`\u203A Workflow: ${_chalk().default.bold(target.replace(/\b\w/g, l => l.toUpperCase()))}`);

  if (user.kind === 'robot') {
    _log().default.log(`\u203A Owner: ${_chalk().default.bold(owner)}`);
  }

  _log().default.newLine(); // Log warnings.


  logExpoUpdatesWarnings(pkg);
  logOptimizeWarnings({
    projectRoot
  });

  if (!options.target && target === 'bare' && (0, _config().isLegacyImportsEnabled)(exp)) {
    logBareWorkflowWarnings(pkg);
  }

  _log().default.addNewLineIfNone(); // Build and publish the project.


  let spinner = null;

  if (options.quiet) {
    spinner = (0, _ora().logNewSection)(`Building optimized bundles and generating sourcemaps...`);
  } else {
    _log().default.log(`Building optimized bundles and generating sourcemaps...`);
  }

  const result = await _xdl().Project.publishAsync(projectRoot, {
    releaseChannel: options.releaseChannel,
    quiet: options.quiet,
    target,
    resetCache: options.clear
  });
  const url = result.url;
  const projectPageUrl = result.projectPageUrl;

  if (options.quiet && spinner) {
    spinner.succeed();
  }

  _log().default.log('Publish complete');

  _log().default.newLine();

  logManifestUrl({
    url,
    sdkVersion,
    runtimeVersion
  });

  if (target === 'managed' && projectPageUrl) {
    // note(brentvatne): disable copy to clipboard functionality for now, need to think more about
    // whether this is desirable.
    //
    // Attempt to copy the URL to the clipboard, if it succeeds then append a notice to the log.
    // const copiedToClipboard = copyToClipboard(websiteUrl);
    logProjectPageUrl({
      url: projectPageUrl,
      copiedToClipboard: false
    }); // Only send the link for managed projects.

    const recipient = await sendTo().getRecipient(options.sendTo);

    if (recipient) {
      await sendTo().sendUrlAsync(projectPageUrl, recipient);
    }
  }

  _log().default.newLine();

  return result;
}

function isInvalidReleaseChannel(releaseChannel) {
  const channelRe = new RegExp(/^[a-z\d][a-z\d._-]*$/);
  return !!releaseChannel && !channelRe.test(releaseChannel);
} // TODO(Bacon): should we prompt with a normalized value?


function assertValidReleaseChannel(releaseChannel) {
  if (isInvalidReleaseChannel(releaseChannel)) {
    throw new (_CommandError().default)('Release channel name can only contain lowercase letters, numbers and special characters . _ and -');
  }
}

function isMaybeAnEASUrl(url) {
  return url.includes(EAS_UPDATE_URL);
}

function assertUpdateURLCorrectlyConfigured(exp) {
  var _exp$updates;

  const configuredURL = (_exp$updates = exp.updates) === null || _exp$updates === void 0 ? void 0 : _exp$updates.url;

  if (!configuredURL) {
    // If no URL is configured, we generate a classic updates URL in the expo-updates config-plugin.
    return;
  }

  if (isMaybeAnEASUrl(configuredURL)) {
    throw new (_CommandError().default)(_CommandError().ErrorCodes.INVALID_UPDATE_URL, `It seems like your project is configured for EAS Update. Please use 'eas branch:publish' instead.`);
  }
}
/**
 * @example 📝  Manifest: https://exp.host/@bacon/my-app/index.exp?sdkVersion=38.0.0 Learn more: https://expo.fyi/manifest-url
 * @param options
 */


function logManifestUrl({
  url,
  sdkVersion,
  runtimeVersion
}) {
  var _getExampleManifestUr;

  const manifestUrl = (_getExampleManifestUr = getExampleManifestUrl(url, {
    sdkVersion,
    runtimeVersion
  })) !== null && _getExampleManifestUr !== void 0 ? _getExampleManifestUr : url;

  _log().default.log(`📝  Manifest: ${_chalk().default.bold(TerminalLink().fallbackToUrl(url, manifestUrl))} ${_chalk().default.dim(TerminalLink().learnMore('https://expo.fyi/manifest-url'))}`);
}
/**
 *
 * @example ⚙️   Project page: https://expo.dev/@bacon/projects/my-app [copied to clipboard] Learn more: https://expo.fyi/project-page
 * @param options
 */


function logProjectPageUrl({
  url,
  copiedToClipboard
}) {
  let productionMessage = `⚙️   Project page: ${_chalk().default.bold(TerminalLink().fallbackToUrl(url, url))}`;

  if (copiedToClipboard) {
    productionMessage += ` ${_chalk().default.gray(`[copied to clipboard]`)}`;
  }

  productionMessage += ` ${_chalk().default.dim(TerminalLink().learnMore('https://expo.fyi/project-page'))}`;

  _log().default.log(productionMessage);
}

function getExampleManifestUrl(url, {
  sdkVersion,
  runtimeVersion
}) {
  if (!(sdkVersion || runtimeVersion)) {
    return null;
  }

  if (url.includes('release-channel') && url.includes('?release-channel')) {
    const urlWithIndexSuffix = url.replace('?release-channel', '/index.exp?release-channel');
    return runtimeVersion ? urlWithIndexSuffix + `&runtimeVersion=${runtimeVersion}` : urlWithIndexSuffix + `&sdkVersion=${sdkVersion}`;
  } else if (url.includes('?') && !url.includes('release-channel')) {
    // This is the only relevant url query param we are aware of at the time of
    // writing this code, so if there is some other param included we don't know
    // how to deal with it and log nothing.
    return null;
  } else {
    return runtimeVersion ? `${url}/index.exp?runtimeVersion=${runtimeVersion}` : `${url}/index.exp?sdkVersion=${sdkVersion}`;
  }
}

function logExpoUpdatesWarnings(pkg) {
  var _pkg$dependencies, _pkg$dependencies2;

  const hasConflictingUpdatesPackages = ((_pkg$dependencies = pkg.dependencies) === null || _pkg$dependencies === void 0 ? void 0 : _pkg$dependencies['expo-updates']) && ((_pkg$dependencies2 = pkg.dependencies) === null || _pkg$dependencies2 === void 0 ? void 0 : _pkg$dependencies2['expokit']);

  if (!hasConflictingUpdatesPackages) {
    return;
  }

  _log().default.nestedWarn((0, _logConfigWarnings().formatNamedWarning)('Conflicting Updates', `You have both the ${_chalk().default.bold('expokit')} and ${_chalk().default.bold('expo-updates')} packages installed in package.json.\n  These two packages are incompatible and ${_chalk().default.bold('publishing updates with expo-updates will not work if expokit is installed')}.\n  If you intend to use ${_chalk().default.bold('expo-updates')}, please remove ${_chalk().default.bold('expokit')} from your dependencies.`));
}

function logOptimizeWarnings({
  projectRoot
}) {
  const hasOptimized = _fs().default.existsSync(_path().default.join(projectRoot, '/.expo-shared/assets.json'));

  if (hasOptimized) {
    return;
  }

  _log().default.nestedWarn((0, _logConfigWarnings().formatNamedWarning)('Optimization', `Project may contain uncompressed images. Optimizing image assets can improve app size and performance.\n  To fix this, run ${_chalk().default.bold(`npx expo-optimize`)}`, 'https://docs.expo.dev/distribution/optimizing-updates/#optimize-images'));
}
/**
 * Warn users if they attempt to publish in a bare project that may also be
 * using Expo Go and does not If the developer does not have the Expo
 * package installed then we do not need to warn them as there is no way that
 * it will run in Expo Go in development even. We should revisit this with
 * dev client, and possibly also by excluding SDK version for bare
 * expo-updates usage in the future (and then surfacing this as an error in
 * the Expo Go app instead)
 *
 * Related: https://github.com/expo/expo/issues/9517
 *
 * @param pkg package.json
 */


function logBareWorkflowWarnings(pkg) {
  var _pkg$dependencies3;

  const hasExpoInstalled = (_pkg$dependencies3 = pkg.dependencies) === null || _pkg$dependencies3 === void 0 ? void 0 : _pkg$dependencies3['expo'];

  if (!hasExpoInstalled) {
    return;
  }

  _log().default.nestedWarn((0, _logConfigWarnings().formatNamedWarning)('Workflow target', `This is a ${_chalk().default.bold('bare workflow')} project. The resulting publish will only run properly inside of a native build of your project. If you want to publish a version of your app that will run in Expo Go, please use ${_chalk().default.bold('expo publish --target managed')}. You can skip this warning by explicitly running ${_chalk().default.bold('expo publish --target bare')} in the future.`));
}
//# sourceMappingURL=publishAsync.js.map