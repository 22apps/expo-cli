"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeOptionsAsync = normalizeOptionsAsync;
exports.parseRawArguments = parseRawArguments;
exports.parseStartOptions = parseStartOptions;
exports.setBooleanArg = setBooleanArg;

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

function _xdl() {
  const data = require("xdl");

  _xdl = function () {
    return data;
  };

  return data;
}

function WebpackEnvironment() {
  const data = _interopRequireWildcard(require("xdl/build/webpack-utils/WebpackEnvironment"));

  WebpackEnvironment = function () {
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

function _resolvePortAsync() {
  const data = require("../run/utils/resolvePortAsync");

  _resolvePortAsync = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hasBooleanArg(rawArgs, argName) {
  return rawArgs.includes('--' + argName) || rawArgs.includes('--no-' + argName);
}

function getBooleanArg(rawArgs, argName) {
  if (rawArgs.includes('--' + argName)) {
    return true;
  } else {
    return false;
  }
}

function setBooleanArg(argName, rawArgs, fallback) {
  if (rawArgs.includes(`--${argName}`)) {
    return true;
  } else if (rawArgs.includes(`--no-${argName}`)) {
    return false;
  } else {
    return fallback;
  }
} // TODO: Deprecate these features sometime around the versioned migration.


function warnUsingDeprecatedArgs(rawArgs) {
  const deprecatedArgs = [['--no-https', 'Https is disabled by default.'], ['--no-minify', 'Minify is disabled by default.'], ['--dev', 'Dev is enabled by default.']];

  for (const [arg, message] of deprecatedArgs) {
    if (rawArgs.includes(arg)) {
      _log().default.warn(`\u203A The ${_chalk().default.bold(arg)} flag is deprecated. ${message}`);
    }
  }
} // The main purpose of this function is to take existing options object and
// support boolean args with as defined in the hasBooleanArg and getBooleanArg
// functions.


async function normalizeOptionsAsync(projectRoot, options) {
  var _options$parent;

  const rawArgs = ((_options$parent = options.parent) === null || _options$parent === void 0 ? void 0 : _options$parent.rawArgs) || [];
  warnUsingDeprecatedArgs(rawArgs);
  const opts = parseRawArguments(options, rawArgs);

  if (options.webOnly) {
    const webpackPort = await (0, _resolvePortAsync().resolvePortAsync)(projectRoot, {
      defaultPort: options.port,
      fallbackPort: WebpackEnvironment().DEFAULT_PORT
    });

    if (!webpackPort) {
      throw new (_CommandError().AbortCommandError)();
    }

    opts.webpackPort = webpackPort;
  } else {
    const metroPort = await (0, _resolvePortAsync().resolvePortAsync)(projectRoot, {
      defaultPort: options.port,
      fallbackPort: options.devClient ? 8081 : 19000
    });

    if (!metroPort) {
      throw new (_CommandError().AbortCommandError)();
    }

    opts.metroPort = metroPort;
  } // Side-effect


  await cacheOptionsAsync(projectRoot, opts);
  return opts;
} // The main purpose of this function is to take existing options object and
// support boolean args with as defined in the hasBooleanArg and getBooleanArg
// functions.


function parseRawArguments(options, rawArgs) {
  var _options$parent2;

  const opts = { ...options,
    // This is necessary to ensure we don't drop any options
    webOnly: !!options.webOnly,
    // This is only ever true in the start:web command
    nonInteractive: (_options$parent2 = options.parent) === null || _options$parent2 === void 0 ? void 0 : _options$parent2.nonInteractive,
    // setBooleanArg is used to flip the default commander logic which automatically sets a value to `true` if the inverse option isn't provided.
    // ex: `dev == true` if `--no-dev` is a possible flag, but `--no-dev` was not provided in the command.
    dev: setBooleanArg('dev', rawArgs, true),
    minify: setBooleanArg('minify', rawArgs, false),
    https: setBooleanArg('https', rawArgs, false)
  };

  if (hasBooleanArg(rawArgs, 'android')) {
    opts.android = getBooleanArg(rawArgs, 'android');
  }

  if (hasBooleanArg(rawArgs, 'ios')) {
    opts.ios = getBooleanArg(rawArgs, 'ios');
  }

  if (hasBooleanArg(rawArgs, 'web')) {
    opts.web = getBooleanArg(rawArgs, 'web');
  }

  if (hasBooleanArg(rawArgs, 'localhost')) {
    opts.localhost = getBooleanArg(rawArgs, 'localhost');
  }

  if (hasBooleanArg(rawArgs, 'lan')) {
    opts.lan = getBooleanArg(rawArgs, 'lan');
  }

  if (hasBooleanArg(rawArgs, 'tunnel')) {
    opts.tunnel = getBooleanArg(rawArgs, 'tunnel');
  }

  return opts;
}

async function cacheOptionsAsync(projectRoot, options) {
  await _xdl().ProjectSettings.setAsync(projectRoot, {
    devClient: options.devClient,
    scheme: options.scheme,
    dev: options.dev,
    minify: options.minify,
    https: options.https
  });
}

function parseStartOptions(options, exp) {
  var _exp$platforms;

  const startOpts = {
    metroPort: options.metroPort,
    webpackPort: options.webpackPort,
    platforms: (_exp$platforms = exp.platforms) !== null && _exp$platforms !== void 0 ? _exp$platforms : ['ios', 'android', 'web']
  };

  if (options.clear) {
    startOpts.reset = true;
  }

  if (options.nonInteractive) {
    startOpts.nonInteractive = true;
  }

  if (options.webOnly) {
    startOpts.webOnly = true;
  }

  if (options.maxWorkers) {
    startOpts.maxWorkers = options.maxWorkers;
  }

  if (options.devClient) {
    startOpts.devClient = true;
  }

  if (options.forceManifestType) {
    startOpts.forceManifestType = options.forceManifestType === 'classic' ? 'classic' : options.forceManifestType === 'expo-updates' ? 'expo-updates' : undefined;
  } else {
    var _exp$updates;

    const easUpdatesUrlRegex = /^https:\/\/(staging-)?u\.expo\.dev/;
    const updatesUrl = (_exp$updates = exp.updates) === null || _exp$updates === void 0 ? void 0 : _exp$updates.url;
    const isEasUpdatesUrl = updatesUrl && easUpdatesUrlRegex.test(updatesUrl);
    startOpts.forceManifestType = isEasUpdatesUrl ? 'expo-updates' : 'classic';
  }

  if ((0, _config().isLegacyImportsEnabled)(exp)) {
    // For `expo start`, the default target is 'managed', for both managed *and* bare apps.
    // See: https://docs.expo.dev/bare/using-expo-client
    startOpts.target = options.devClient ? 'bare' : 'managed';

    _log().default.debug('Using target: ', startOpts.target);
  } // The SDK 41 client has web socket support.


  if (_xdl().Versions.gteSdkVersion(exp, '41.0.0')) {
    startOpts.isRemoteReloadingEnabled = true;

    if (!startOpts.webOnly || _xdl().Webpack.isTargetingNative()) {
      startOpts.isWebSocketsEnabled = true;
    }
  }

  return startOpts;
}
//# sourceMappingURL=parseStartOptions.js.map