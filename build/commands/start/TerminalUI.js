"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openDeveloperTools = openDeveloperTools;
exports.shouldOpenDevToolsOnStartupAsync = shouldOpenDevToolsOnStartupAsync;
exports.startAsync = startAsync;

function _devServer() {
  const data = require("@expo/dev-server");

  _devServer = function () {
    return data;
  };

  return data;
}

function _betterOpn() {
  const data = _interopRequireDefault(require("better-opn"));

  _betterOpn = function () {
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

function _wrapAnsi() {
  const data = _interopRequireDefault(require("wrap-ansi"));

  _wrapAnsi = function () {
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

function _handleErrors() {
  const data = require("../../utils/handleErrors");

  _handleErrors = function () {
    return data;
  };

  return data;
}

function _prompts() {
  const data = require("../../utils/prompts");

  _prompts = function () {
    return data;
  };

  return data;
}

function _accounts() {
  const data = require("../auth/accounts");

  _accounts = function () {
    return data;
  };

  return data;
}

function _TerminalLink() {
  const data = require("../utils/TerminalLink");

  _TerminalLink = function () {
    return data;
  };

  return data;
}

function _openInEditorAsync() {
  const data = require("../utils/openInEditorAsync");

  _openInEditorAsync = function () {
    return data;
  };

  return data;
}

function _urlOpts() {
  const data = _interopRequireDefault(require("../utils/urlOpts"));

  _urlOpts = function () {
    return data;
  };

  return data;
}

function _ensureWebSetup() {
  const data = require("../utils/web/ensureWebSetup");

  _ensureWebSetup = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CTRL_C = '\u0003';
const CTRL_D = '\u0004';
const CTRL_L = '\u000C';
const BLT = `\u203A`;

const {
  bold: b,
  italic: i,
  underline: u
} = _chalk().default;

const printHelp = () => {
  logCommandsTable([{
    key: '?',
    msg: 'show all commands'
  }]);
};

const div = _chalk().default.dim(`│`);

async function shouldOpenDevToolsOnStartupAsync() {
  return _xdl().UserSettings.getAsync('openDevToolsAtStartup', // Defaults to false for new users.
  // We can swap this back to true when dev tools UI has a code owner again.
  false);
}

const printUsageAsync = async (projectRoot, options) => {
  const {
    dev
  } = await _xdl().ProjectSettings.readAsync(projectRoot);
  const openDevToolsAtStartup = await shouldOpenDevToolsOnStartupAsync();
  const devMode = dev ? 'development' : 'production';
  const currentToggle = openDevToolsAtStartup ? 'enabled' : 'disabled';
  const isMac = process.platform === 'darwin';
  const {
    platforms = ['ios', 'android', 'web']
  } = options;
  const isAndroidDisabled = !platforms.includes('android');
  const isIosDisabled = !platforms.includes('ios');
  const isWebDisable = !platforms.includes('web');
  logCommandsTable([{}, {
    key: 'a',
    msg: `open Android`,
    disabled: isAndroidDisabled
  }, {
    key: 'shift+a',
    msg: `select a device or emulator`,
    disabled: isAndroidDisabled
  }, isMac && {
    key: 'i',
    msg: `open iOS simulator`,
    disabled: isIosDisabled
  }, isMac && {
    key: 'shift+i',
    msg: `select a simulator`,
    disabled: isIosDisabled
  }, {
    key: 'w',
    msg: `open web`,
    disabled: isWebDisable
  }, {}, !!options.isRemoteReloadingEnabled && {
    key: 'r',
    msg: `reload app`
  }, !!options.isWebSocketsEnabled && {
    key: 'm',
    msg: `toggle menu`
  }, !!options.isWebSocketsEnabled && {
    key: 'shift+m',
    msg: `more tools`
  }, !!options.isWebSocketsEnabled && {
    key: 'j',
    msg: `open JavaScript inspector for Hermes`
  }, {
    key: 'o',
    msg: `open project code in your editor`
  }, {
    key: 'c',
    msg: `show project QR`
  }, {
    key: 'p',
    msg: `toggle build mode`,
    status: devMode
  }, // TODO: Drop with SDK 40
  !options.isRemoteReloadingEnabled && {
    key: 'r',
    msg: `restart bundler`
  }, !options.isRemoteReloadingEnabled && {
    key: 'shift+r',
    msg: `restart and clear cache`
  }, {}, {
    key: 'd',
    msg: `show developer tools`
  }, {
    key: 'shift+d',
    msg: `toggle auto opening developer tools on startup`,
    status: currentToggle
  }, {}]);
};

const printBasicUsageAsync = async options => {
  const isMac = process.platform === 'darwin';
  const openDevToolsAtStartup = await shouldOpenDevToolsOnStartupAsync();
  const currentToggle = openDevToolsAtStartup ? 'enabled' : 'disabled';
  const {
    platforms = ['ios', 'android', 'web']
  } = options;
  const isAndroidDisabled = !platforms.includes('android');
  const isIosDisabled = !platforms.includes('ios');
  const isWebDisable = !platforms.includes('web');
  logCommandsTable([{}, {
    key: 'a',
    msg: `open Android`,
    disabled: isAndroidDisabled
  }, isMac && {
    key: 'i',
    msg: `open iOS simulator`,
    disabled: isIosDisabled
  }, {
    key: 'w',
    msg: `open web`,
    disabled: isWebDisable
  }, {}, !!options.isRemoteReloadingEnabled && {
    key: 'r',
    msg: `reload app`
  }, !!options.isWebSocketsEnabled && {
    key: 'm',
    msg: `toggle menu`
  }, {
    key: 'd',
    msg: `show developer tools`
  }, {
    key: 'shift+d',
    msg: `toggle auto opening developer tools on startup`,
    status: currentToggle
  }, {}]);
};

function logCommandsTable(ui) {
  _log().default.nested(ui.filter(Boolean) // @ts-ignore: filter doesn't work
  .map(({
    key,
    msg,
    status,
    disabled
  }) => {
    if (!key) return '';
    let view = `${BLT} `;
    if (key.length === 1) view += 'Press ';
    view += `${b(key)} ${div} `;
    view += msg;

    if (status) {
      view += ` ${_chalk().default.dim(`(${i(status)})`)}`;
    }

    if (disabled) {
      view = _chalk().default.dim(view);
    }

    return view;
  }).join('\n'));
}

const printServerInfo = async (projectRoot, options) => {
  const wrapLength = process.stdout.columns || 80;

  const item = text => `${BLT} ` + (0, _wrapAnsi().default)(text, wrapLength).trimStart();

  if (!options.webOnly) {
    try {
      const url = await _xdl().UrlUtils.constructDeepLinkAsync(projectRoot);

      _urlOpts().default.printQRCode(url);

      _log().default.nested(item(`Metro waiting on ${u(url)}`)); // Log.newLine();
      // TODO: if development build, change this message!


      _log().default.nested(item(`Scan the QR code above with Expo Go (Android) or the Camera app (iOS)`));
    } catch (error) {
      // @ts-ignore: If there is no development build scheme, then skip the QR code.
      if (error.code !== 'NO_DEV_CLIENT_SCHEME') {
        throw error;
      } else {
        const serverUrl = await _xdl().UrlUtils.constructManifestUrlAsync(projectRoot, {
          urlType: 'http'
        });

        _log().default.nested(item(`Metro waiting on ${u(serverUrl)}`));

        _log().default.nested(item(`Linking is disabled because the client scheme cannot be resolved.`));
      }
    }
  }

  const webUrl = await _xdl().Webpack.getUrlAsync(projectRoot);

  if (webUrl) {
    _log().default.addNewLineIfNone();

    _log().default.nested(item(`Webpack waiting on ${u(webUrl)}`));

    _log().default.nested(_chalk().default.gray(item(`Expo Webpack (web) is in beta, and subject to breaking changes!`)));
  }

  await printBasicUsageAsync(options);
  printHelp();

  _log().default.addNewLineIfNone();
};

async function openDeveloperTools(url) {
  _log().default.log(`Opening developer tools in the browser...`);

  if (!(await (0, _betterOpn().default)(url))) {
    _log().default.warn(`Unable to open developer tools in the browser`);
  }
}

async function openJsInsectorAsync(projectRoot) {
  _log().default.log(`Opening JavaScript inspector in the browser...`);

  const {
    packagerPort
  } = await _xdl().ProjectSettings.readPackagerInfoAsync(projectRoot);
  const metroServerOrigin = `http://localhost:${packagerPort}`;
  const apps = await (0, _devServer().queryAllInspectorAppsAsync)(metroServerOrigin);

  if (apps.length === 0) {
    _log().default.warn(`No compatible apps connected. This feature is only available for apps using the Hermes runtime. ${(0, _TerminalLink().learnMore)('https://docs.expo.dev/guides/using-hermes/')}`);

    return;
  }

  for (const app of apps) {
    (0, _devServer().openJsInspector)(app);
  }
}

async function startAsync(projectRoot, options) {
  const {
    stdin
  } = process;

  const startWaitingForCommand = () => {
    if (!stdin.setRawMode) {
      _log().default.warn('Non-interactive terminal, keyboard commands are disabled. Please upgrade to Node 12+');

      return;
    }

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', handleKeypress);
  };

  const stopWaitingForCommand = () => {
    stdin.removeListener('data', handleKeypress);

    if (!stdin.setRawMode) {
      _log().default.warn('Non-interactive terminal, keyboard commands are disabled. Please upgrade to Node 12+');

      return;
    }

    stdin.setRawMode(false);
    stdin.resume();
  };

  startWaitingForCommand();

  _xdl().Prompts.addInteractionListener(({
    pause
  }) => {
    if (pause) {
      stopWaitingForCommand();
    } else {
      startWaitingForCommand();
    }
  });

  _xdl().UserManager.setInteractiveAuthenticationCallback(async () => {
    stopWaitingForCommand();

    try {
      return await (0, _accounts().loginOrRegisterIfLoggedOutAsync)();
    } finally {
      startWaitingForCommand();
    }
  });

  await printServerInfo(projectRoot, options);

  async function handleKeypress(key) {
    try {
      await handleKeypressAsync(key);
    } catch (err) {
      await (0, _handleErrors().handleErrorsAsync)(err, {});
      process.exit(1);
    }
  }

  async function handleKeypressAsync(key) {
    const shouldPrompt = !options.nonInteractive && ['I', 'A'].includes(key);

    if (shouldPrompt) {
      _log().default.clear();
    }

    const {
      platforms = ['ios', 'android', 'web']
    } = options;

    switch (key) {
      case 'A':
      case 'a':
        if (options.webOnly && !_xdl().Webpack.isTargetingNative()) {
          _log().default.log(`${BLT} Opening the web project in Chrome on Android...`);

          const results = await _xdl().Android.openWebProjectAsync({
            projectRoot,
            shouldPrompt
          });

          if (!results.success) {
            _log().default.nestedError(results.error);
          }
        } else {
          var _options$devClient;

          const isDisabled = !platforms.includes('android');

          if (isDisabled) {
            _log().default.nestedWarn(`Android is disabled, enable it by adding ${_chalk().default.bold`android`} to the platforms array in your app.json or app.config.js`);

            break;
          }

          _log().default.log(`${BLT} Opening on Android...`);

          const results = await _xdl().Android.openProjectAsync({
            projectRoot,
            shouldPrompt,
            devClient: (_options$devClient = options.devClient) !== null && _options$devClient !== void 0 ? _options$devClient : false
          });

          if (!results.success && results.error !== 'escaped') {
            _log().default.nestedError(typeof results.error === 'string' ? results.error : results.error.message);
          }
        }

        printHelp();
        break;

      case 'I':
      case 'i':
        if (options.webOnly && !_xdl().Webpack.isTargetingNative()) {
          _log().default.log(`${BLT} Opening the web project in Safari on iOS...`);

          const results = await _xdl().Simulator.openWebProjectAsync({
            projectRoot,
            shouldPrompt
          });

          if (!results.success) {
            _log().default.nestedError(results.error);
          }
        } else {
          var _options$devClient2;

          const isDisabled = !platforms.includes('ios');

          if (isDisabled) {
            _log().default.nestedWarn(`iOS is disabled, enable it by adding ${_chalk().default.bold`ios`} to the platforms array in your app.json or app.config.js`);

            break;
          }

          _log().default.log(`${BLT} Opening on iOS...`);

          const results = await _xdl().Simulator.openProjectAsync({
            projectRoot,
            shouldPrompt,
            devClient: (_options$devClient2 = options.devClient) !== null && _options$devClient2 !== void 0 ? _options$devClient2 : false
          });

          if (!results.success && results.error !== 'escaped') {
            _log().default.nestedError(results.error);
          }
        }

        printHelp();
        break;
    }

    switch (key) {
      case CTRL_C:
      case CTRL_D:
        {
          // @ts-ignore: Argument of type '"SIGINT"' is not assignable to parameter of type '"disconnect"'.
          process.emit('SIGINT'); // Prevent terminal UI from accepting commands while the process is closing.
          // Without this, fast typers will close the server then start typing their
          // next command and have a bunch of unrelated things pop up.

          _xdl().Prompts.pauseInteractions();

          break;
        }

      case CTRL_L:
        {
          _log().default.clear();

          break;
        }

      case '?':
        {
          await printUsageAsync(projectRoot, options);
          break;
        }

      case 'w':
        {
          try {
            if (await (0, _ensureWebSetup().ensureWebSupportSetupAsync)(projectRoot)) {
              if (!platforms.includes('web')) {
                var _options$platforms;

                platforms.push('web');
                (_options$platforms = options.platforms) === null || _options$platforms === void 0 ? void 0 : _options$platforms.push('web');
              }
            }
          } catch (e) {
            _log().default.nestedWarn(e.message);

            break;
          }

          const isDisabled = !platforms.includes('web');

          if (isDisabled) {
            // Use warnings from the web support setup.
            break;
          } // Ensure the Webpack dev server is running first


          const isStarted = await _xdl().Webpack.getUrlAsync(projectRoot);

          if (!isStarted) {
            await _xdl().Project.startAsync(projectRoot, {
              webOnly: true
            }); // When this is the first time webpack is started, reprint the connection info.

            await printServerInfo(projectRoot, options);
          }

          _log().default.log(`${BLT} Open in the web browser...`);

          await _xdl().Webpack.openAsync(projectRoot);
          printHelp();
          break;
        }

      case 'c':
        {
          _log().default.clear();

          await printServerInfo(projectRoot, options);
          break;
        }

      case 'd':
        {
          const {
            devToolsPort
          } = await _xdl().ProjectSettings.readPackagerInfoAsync(projectRoot);
          openDeveloperTools(`http://localhost:${devToolsPort}`);
          printHelp();
          break;
        }

      case 'D':
        {
          const enabled = !(await shouldOpenDevToolsOnStartupAsync());
          await _xdl().UserSettings.setAsync('openDevToolsAtStartup', enabled);
          const currentToggle = enabled ? 'enabled' : 'disabled';

          _log().default.log(`Auto opening developer tools on startup: ${_chalk().default.bold(currentToggle)}`);

          logCommandsTable([{
            key: 'd',
            msg: `show developer tools now`
          }]);
          break;
        }

      case 'j':
        {
          await openJsInsectorAsync(projectRoot);
          break;
        }

      case 'm':
        {
          if (options.isWebSocketsEnabled) {
            _log().default.log(`${BLT} Toggling dev menu`);

            _xdl().Project.broadcastMessage('devMenu');

            _xdl().Webpack.broadcastMessage('devMenu');
          }

          break;
        }

      case 'M':
        {
          if (options.isWebSocketsEnabled) {
            _xdl().Prompts.pauseInteractions();

            try {
              const value = await (0, _prompts().selectAsync)({
                // Options match: Chrome > View > Developer
                message: `Dev tools ${_chalk().default.dim`(native only)`}`,
                choices: [{
                  title: 'Inspect elements',
                  value: 'toggleElementInspector'
                }, {
                  title: 'Toggle performance monitor',
                  value: 'togglePerformanceMonitor'
                }, {
                  title: 'Toggle developer menu',
                  value: 'toggleDevMenu'
                }, {
                  title: 'Reload app',
                  value: 'reload'
                } // TODO: Maybe a "View Source" option to open code.
                // Toggling Remote JS Debugging is pretty rough, so leaving it disabled.
                // { title: 'Toggle Remote Debugging', value: 'toggleRemoteDebugging' },
                ]
              });

              _xdl().Project.broadcastMessage('sendDevCommand', {
                name: value
              });

              _xdl().Webpack.broadcastMessage('sendDevCommand', {
                name: value
              });
            } catch {// do nothing
            } finally {
              _xdl().Prompts.resumeInteractions();

              printHelp();
            }
          }

          break;
        }

      case 'p':
        {
          _log().default.clear();

          const projectSettings = await _xdl().ProjectSettings.readAsync(projectRoot);
          const dev = !projectSettings.dev;
          await _xdl().ProjectSettings.setAsync(projectRoot, {
            dev,
            minify: !dev
          });

          _log().default.log(`Metro bundler is now running in ${_chalk().default.bold(dev ? 'development' : 'production')}${_chalk().default.reset(` mode.`)}
Please reload the project in Expo Go for the change to take effect.`);

          printHelp();
          break;
        }

      case 'r':
        if (options.isRemoteReloadingEnabled) {
          _log().default.log(`${BLT} Reloading apps`); // Send reload requests over the dev servers


          _xdl().Project.broadcastMessage('reload');

          _xdl().Webpack.broadcastMessage('reload');
        } else if (!options.webOnly) {
          // [SDK 40]: Restart bundler
          _log().default.clear();

          _xdl().Project.startAsync(projectRoot, { ...options,
            reset: false
          });

          _log().default.log('Restarting Metro bundler...');
        }

        break;

      case 'R':
        if (!options.isRemoteReloadingEnabled) {
          // [SDK 40]: Restart bundler with cache
          _log().default.clear();

          _xdl().Project.startAsync(projectRoot, { ...options,
            reset: true
          });

          _log().default.log('Restarting Metro bundler and clearing cache...');
        }

        break;

      case 'o':
        _log().default.log(`${BLT} Opening the editor...`);

        await (0, _openInEditorAsync().openInEditorAsync)(projectRoot, {
          editor: process.env.EXPO_EDITOR
        });
    }
  }
}
//# sourceMappingURL=TerminalUI.js.map