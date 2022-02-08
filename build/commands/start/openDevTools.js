"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tryOpeningDevToolsAsync = tryOpeningDevToolsAsync;

function _devTools() {
  const data = require("@expo/dev-tools");

  _devTools = function () {
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

function _log() {
  const data = _interopRequireDefault(require("../../log"));

  _log = function () {
    return data;
  };

  return data;
}

function TerminalUI() {
  const data = _interopRequireWildcard(require("./TerminalUI"));

  TerminalUI = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @ts-ignore: not typed
async function tryOpeningDevToolsAsync(projectRoot, {
  exp,
  options
}) {
  const devToolsUrl = await _devTools().DevToolsServer.startAsync(projectRoot);

  _log().default.log(`Developer tools running on ${_chalk().default.underline(devToolsUrl)}`);

  if (!options.nonInteractive && !exp.isDetached) {
    if (await TerminalUI().shouldOpenDevToolsOnStartupAsync()) {
      await _xdl().UserSettings.setAsync('openDevToolsAtStartup', true);
      TerminalUI().openDeveloperTools(devToolsUrl);
    } else {
      await _xdl().UserSettings.setAsync('openDevToolsAtStartup', false);
    }
  }
}
//# sourceMappingURL=openDevTools.js.map