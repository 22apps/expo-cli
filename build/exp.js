"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bootstrapAnalyticsAsync = bootstrapAnalyticsAsync;
exports.helpGroupOrder = void 0;
exports.run = run;
exports.trackUsage = trackUsage;

function _bunyan() {
  const data = _interopRequireDefault(require("@expo/bunyan"));

  _bunyan = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("@expo/config");

  _config = function () {
    return data;
  };

  return data;
}

function _boxen() {
  const data = _interopRequireDefault(require("boxen"));

  _boxen = function () {
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

function _commander() {
  const data = _interopRequireWildcard(require("commander"));

  _commander = function () {
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

function _getenv() {
  const data = _interopRequireDefault(require("getenv"));

  _getenv = function () {
    return data;
  };

  return data;
}

function _leven() {
  const data = _interopRequireDefault(require("leven"));

  _leven = function () {
    return data;
  };

  return data;
}

function _findLastIndex() {
  const data = _interopRequireDefault(require("lodash/findLastIndex"));

  _findLastIndex = function () {
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

function _progress() {
  const data = _interopRequireDefault(require("progress"));

  _progress = function () {
    return data;
  };

  return data;
}

function _stripAnsi() {
  const data = _interopRequireDefault(require("strip-ansi"));

  _stripAnsi = function () {
    return data;
  };

  return data;
}

function _url() {
  const data = _interopRequireDefault(require("url"));

  _url = function () {
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

function _StatusEventEmitter() {
  const data = _interopRequireDefault(require("./analytics/StatusEventEmitter"));

  _StatusEventEmitter = function () {
    return data;
  };

  return data;
}

function _commands() {
  const data = require("./commands");

  _commands = function () {
    return data;
  };

  return data;
}

function _accounts() {
  const data = require("./commands/auth/accounts");

  _accounts = function () {
    return data;
  };

  return data;
}

function _TerminalLink() {
  const data = require("./commands/utils/TerminalLink");

  _TerminalLink = function () {
    return data;
  };

  return data;
}

function _profileMethod() {
  const data = require("./commands/utils/profileMethod");

  _profileMethod = function () {
    return data;
  };

  return data;
}

function _urlOpts() {
  const data = _interopRequireDefault(require("./commands/utils/urlOpts"));

  _urlOpts = function () {
    return data;
  };

  return data;
}

function _log() {
  const data = _interopRequireDefault(require("./log"));

  _log = function () {
    return data;
  };

  return data;
}

function _handleErrors() {
  const data = require("./utils/handleErrors");

  _handleErrors = function () {
    return data;
  };

  return data;
}

function _matchFileNameOrURLFromStackTrace() {
  const data = require("./utils/matchFileNameOrURLFromStackTrace");

  _matchFileNameOrURLFromStackTrace = function () {
    return data;
  };

  return data;
}

function _ora() {
  const data = require("./utils/ora");

  _ora = function () {
    return data;
  };

  return data;
}

function _update() {
  const data = _interopRequireDefault(require("./utils/update"));

  _update = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// We use require() to exclude package.json from TypeScript's analysis since it lives outside the
// src directory and would change the directory structure of the emitted files under the build
// directory
const packageJSON = require('../package.json');

_xdl().ApiV2.setClientName(packageJSON.version); // The following prototyped functions are not used here, but within in each file found in `./commands`
// Extending commander to easily add more options to certain command line arguments


_commander().Command.prototype.urlOpts = function () {
  _urlOpts().default.addOptions(this);

  return this;
};

_commander().Command.prototype.allowOffline = function () {
  this.option('--offline', 'Allows this command to run while offline');
  return this;
}; // Add support for logical command groupings


_commander().Command.prototype.helpGroup = function (name) {
  if (this.commands[this.commands.length - 1]) {
    this.commands[this.commands.length - 1].__helpGroup = name;
  } else {
    this.parent.helpGroup(name);
  }

  return this;
}; // A longer description that will be displayed then the command is used with --help


_commander().Command.prototype.longDescription = function (name) {
  if (this.commands[this.commands.length - 1]) {
    this.commands[this.commands.length - 1].__longDescription = name;
  } else {
    this.parent.longDescription(name);
  }

  return this;
};

function pad(str, width) {
  // Pulled from commander for overriding
  const len = Math.max(0, width - (0, _stripAnsi().default)(str).length);
  return str + Array(len + 1).join(' ');
}

function humanReadableArgName(arg) {
  // Pulled from commander for overriding
  const nameOutput = arg.name + (arg.variadic === true ? '...' : '');
  return arg.required ? `<${nameOutput}>` : `[${nameOutput}]`;
}

function breakSentence(input) {
  // Break a sentence by the word after a max character count, adjusting for ansi characters
  return (0, _wrapAnsi().default)(input, 72);
}

_commander().Command.prototype.prepareCommands = function () {
  return this.commands.filter(function (cmd) {
    // Display all commands with EXPO_DEBUG, otherwise use the noHelp option.
    if (_getenv().default.boolish('EXPO_DEBUG', false)) {
      return true;
    }

    return !['internal'].includes(cmd.__helpGroup);
  }).map(function (cmd, i) {
    var _cmd$__helpGroup;

    const args = cmd._args.map(humanReadableArgName).join(' ');

    const description = cmd._description; // Remove alias. We still show this with --help on the command.
    // const alias = cmd._alias;
    // const nameWithAlias = cmd._name + (alias ? '|' + alias : '');

    const nameWithAlias = cmd._name;
    return [nameWithAlias + ( // Remove the redundant [options] string that's shown after every command.
    // (cmd.options.length ? ' [options]' : '') +
    args ? ' ' + args : ''), breakSentence(description), (_cmd$__helpGroup = cmd.__helpGroup) !== null && _cmd$__helpGroup !== void 0 ? _cmd$__helpGroup : 'misc'];
  });
};
/**
 * Set / get the command usage `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */
// @ts-ignore


_commander().Command.prototype.usage = function (str) {
  const args = this._args.map(function (arg) {
    return humanReadableArgName(arg);
  });

  const commandsStr = this.commands.length ? '[command]' : '';
  const argsStr = this._args.length ? args.join(' ') : '';
  let usage = commandsStr + argsStr;
  if (usage.length) usage += ' ';
  usage += '[options]';

  if (arguments.length === 0) {
    return this._usage || usage;
  }

  this._usage = str;
  return this;
};

_commander().Command.prototype.helpInformation = function () {
  var _this$__longDescripti;

  let desc = []; // Use the long description if available, otherwise use the regular description.

  const description = (_this$__longDescripti = this.__longDescription) !== null && _this$__longDescripti !== void 0 ? _this$__longDescripti : this._description;

  if (description) {
    desc = [replaceAll(breakSentence(description), '\n', pad('\n', 3)), ''];
    const argsDescription = this._argsDescription;

    if (argsDescription && this._args.length) {
      const width = this.padWidth();
      desc.push('Arguments:');
      desc.push('');

      this._args.forEach(({
        name
      }) => {
        desc.push('  ' + pad(name, width) + '  ' + argsDescription[name]);
      });

      desc.push('');
    }
  }

  let cmdName = this._name;

  if (this._alias) {
    // Here is the only place we show the command alias
    cmdName = `${cmdName}|${this._alias}`;
  } // Dim the options to keep things consistent.


  const usage = `${_chalk().default.bold`Usage:`} ${cmdName} ${_chalk().default.dim(this.usage())}\n`;
  const commandHelp = '' + this.commandHelp();
  const options = [_chalk().default.bold`Options:`, '\n' + this.optionHelp().replace(/^/gm, '    '), '']; // return ['', usage, ...desc, ...options, commandHelp].join('\n') + '\n';

  return ['', usage, ...desc, ...options, commandHelp].join(pad('\n', 3)) + '\n';
};

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

const helpGroupOrder = ['core', 'auth', 'client', 'info', 'eject', 'publish', 'build', 'credentials', 'notifications', 'url', 'webhooks', 'upload', 'internal', 'deprecated'];
exports.helpGroupOrder = helpGroupOrder;

function sortHelpGroups(helpGroups) {
  const groupOrder = [...new Set([...helpGroupOrder, // add any others and remove duplicates
  ...Object.keys(helpGroups)])];
  const subGroupOrder = {
    core: ['init', 'start', 'start:web', 'publish', 'export']
  };

  const sortSubGroupWithOrder = (groupName, group) => {
    const order = subGroupOrder[groupName];

    if (!(order !== null && order !== void 0 && order.length)) {
      return group;
    }

    const sortedCommands = [];

    while (order.length) {
      const key = order.shift();
      const index = group.findIndex(item => item[0].startsWith(key));

      if (index >= 0) {
        const [item] = group.splice(index, 1);
        sortedCommands.push(item);
      }
    }

    return sortedCommands.concat(group);
  }; // Reverse the groups


  const sortedGroups = {};

  while (groupOrder.length) {
    const group = groupOrder.shift();

    if (group in helpGroups) {
      sortedGroups[group] = helpGroups[group];
    }
  }

  return Object.keys(sortedGroups).reduce((prev, curr) => ({ ...prev,
    // Sort subgroups that have a defined order
    [curr]: sortSubGroupWithOrder(curr, helpGroups[curr])
  }), {});
} // Extended the help renderer to add a custom format and groupings.


_commander().Command.prototype.commandHelp = function () {
  if (!this.commands.length) {
    return '';
  }

  const width = this.padWidth();
  const commands = this.prepareCommands();
  const helpGroups = {}; // Sort commands into helpGroups

  for (const command of commands) {
    const groupName = command[2];

    if (!helpGroups[groupName]) {
      helpGroups[groupName] = [];
    }

    helpGroups[groupName].push(command);
  }

  const sorted = sortHelpGroups(helpGroups); // Render everything.

  return ['' + _chalk().default.bold('Commands:'), '', // Render all of the groups.
  Object.values(sorted).map(group => group // Render the command and description
  .map(([cmd, description]) => {
    // Dim the arguments that come after the command, this makes scanning a bit easier.
    let [noArgsCmd, ...noArgsCmdArgs] = cmd.split(' ');

    if (noArgsCmdArgs.length) {
      noArgsCmd += ` ${_chalk().default.dim(noArgsCmdArgs.join(' '))}`;
    } // Word wrap the description.


    let wrappedDescription = description;

    if (description) {
      // Ensure the wrapped description appears on the same padded line.
      wrappedDescription = '  ' + replaceAll(description, '\n', pad('\n', width + 3));
    }

    const paddedName = wrappedDescription ? pad(noArgsCmd, width) : noArgsCmd;
    return paddedName + wrappedDescription;
  }).join('\n').replace(/^/gm, '    ')) // Double new line to add spacing between groups
  .join('\n\n'), ''].join('\n');
};

_commander().default.on('--help', () => {
  _log().default.log(`  Run a command with --help for more info 💡`);

  _log().default.log(`    $ expo start --help`);

  _log().default.log();
});

// asyncAction is a wrapper for all commands/actions to be executed after commander is done
// parsing the command input
_commander().Command.prototype.asyncAction = function (asyncFn) {
  return this.action(async (...args) => {
    if (!_getenv().default.boolish('EAS_BUILD', false) && !_commander().default.nonInteractive) {
      try {
        await (0, _profileMethod().profileMethod)(checkCliVersionAsync)();
      } catch (e) {}
    }

    try {
      const options = args[args.length - 1];

      if (options.offline) {
        const {
          ConnectionStatus
        } = await Promise.resolve().then(() => _interopRequireWildcard(require('xdl')));
        ConnectionStatus.setIsOffline(true);
      }

      await asyncFn(...args); // After a command, flush the analytics queue so the program will not have any active timers
      // This allows node js to exit immediately

      await Promise.all([_xdl().Analytics.flush(), _xdl().UnifiedAnalytics.flush()]);
    } catch (err) {
      await (0, _handleErrors().handleErrorsAsync)(err, {
        command: this.name()
      });
      process.exit(1);
    }
  });
}; // asyncActionProjectDir captures the projectDirectory from the command line,
// setting it to cwd if it is not provided.
// Commands such as `start` and `publish` use this.
// It does several things:
// - Everything in asyncAction
// - Checks if the user is logged in or out
// - Checks for updates
// - Attaches the bundling logger
// - Checks if the project directory is valid or not
// - Runs AsyncAction with the projectDir as an argument


_commander().Command.prototype.asyncActionProjectDir = function (asyncFn, options = {}) {
  this.option('--config [file]', `${_chalk().default.yellow('Deprecated:')} Use app.config.js to switch config files instead.`);
  return this.asyncAction(async (projectRoot, ...args) => {
    const opts = args[0];

    if (!projectRoot) {
      projectRoot = process.cwd();
    } else {
      projectRoot = _path().default.resolve(process.cwd(), projectRoot);
    }

    if (opts.config) {
      _log().default.log(_chalk().default.yellow(`\u203A ${_chalk().default.bold('--config')} flag is deprecated. Use app.config.js instead. ${(0, _TerminalLink().learnMore)('https://expo.fyi/config-flag-migration')}`));

      _log().default.newLine(); // @ts-ignore: This guards against someone passing --config without a path.


      if (opts.config === true) {
        _log().default.addNewLineIfNone();

        _log().default.log('Please specify your custom config path:');

        _log().default.log(_chalk().default.green(`  expo ${this.name()} --config ${_chalk().default.cyan(`<app-config>`)}`));

        _log().default.newLine();

        process.exit(1);
      }

      const pathToConfig = _path().default.resolve(process.cwd(), opts.config); // Warn the user when the custom config path they provided does not exist.


      if (!_fs().default.existsSync(pathToConfig)) {
        const relativeInput = _path().default.relative(process.cwd(), opts.config);

        const formattedPath = _chalk().default.reset(pathToConfig).replace(relativeInput, _chalk().default.bold(relativeInput));

        _log().default.addNewLineIfNone();

        _log().default.nestedWarn(`Custom config file does not exist:\n${formattedPath}`);

        _log().default.newLine();

        const helpCommand = _chalk().default.green(`expo ${this.name()} --help`);

        _log().default.log(`Run ${helpCommand} for more info`);

        _log().default.newLine();

        process.exit(1); // throw new Error(`File at provided config path does not exist: ${pathToConfig}`);
      }

      (0, _config().setCustomConfigPath)(projectRoot, pathToConfig);
    }

    const logLines = (msg, logFn) => {
      if (typeof msg === 'string') {
        for (const line of msg.split('\n')) {
          logFn(line);
        }
      } else {
        logFn(msg);
      }
    };

    const {
      INTERNAL_CALLSITES_REGEX
    } = await Promise.resolve().then(() => _interopRequireWildcard(require('@expo/metro-config')));

    const logStackTrace = async (chunk, logFn, nestedLogFn) => {
      let traceInfo;

      try {
        traceInfo = JSON.parse(chunk.msg);
      } catch (e) {
        return logFn(chunk.msg);
      }

      const {
        message,
        stack
      } = traceInfo;

      _log().default.addNewLineIfNone();

      logFn(_chalk().default.bold(message));

      const isLibraryFrame = line => {
        return line.startsWith('node_modules');
      };

      const stackFrames = stack.split('\n').filter(line => line);
      const lastAppCodeFrameIndex = (0, _findLastIndex().default)(stackFrames, line => {
        return !isLibraryFrame(line);
      });
      let lastFrameIndexToLog = Math.min(stackFrames.length - 1, lastAppCodeFrameIndex + 2 // show max two more frames after last app code frame
      );
      let unloggedFrames = stackFrames.length - lastFrameIndexToLog; // If we're only going to exclude one frame, just log them all

      if (unloggedFrames === 1) {
        lastFrameIndexToLog = stackFrames.length - 1;
        unloggedFrames = 0;
      }

      for (let i = 0; i <= lastFrameIndexToLog; i++) {
        const line = stackFrames[i];

        if (!line) {
          continue;
        }

        let isCollapsed = false;
        const fileNameOrUrl = (0, _matchFileNameOrURLFromStackTrace().matchFileNameOrURLFromStackTrace)(line);

        if (fileNameOrUrl) {
          // Use the same regex we use in Metro config to filter out traces:
          isCollapsed = INTERNAL_CALLSITES_REGEX.test(fileNameOrUrl); // Unless the user is in debug mode, skip printing the collapsed files.

          if (!_log().default.isDebug && isCollapsed) {
            continue;
          }
        } // If a file is collapsed, print it with dim styling.


        const style = isCollapsed ? _chalk().default.dim : message => message; // Use the `at` prefix to match Node.js

        nestedLogFn(style('at ' + line));
      }

      if (unloggedFrames > 0) {
        nestedLogFn(`- ... ${unloggedFrames} more stack frames from framework internals`);
      }

      _log().default.printNewLineBeforeNextLog();
    };

    const logWithLevel = chunk => {
      if (!chunk.msg) {
        return;
      }

      if (chunk.level <= _bunyan().default.INFO) {
        if (chunk.includesStack) {
          logStackTrace(chunk, _log().default.log, _log().default.nested);
        } else {
          logLines(chunk.msg, _log().default.log);
        }
      } else if (chunk.level === _bunyan().default.WARN) {
        if (chunk.includesStack) {
          logStackTrace(chunk, _log().default.warn, _log().default.nestedWarn);
        } else {
          logLines(chunk.msg, _log().default.warn);
        }
      } else {
        if (chunk.includesStack) {
          logStackTrace(chunk, _log().default.error, _log().default.nestedError);
        } else {
          logLines(chunk.msg, _log().default.error);
        }
      }
    };

    let bar; // eslint-disable-next-line no-new

    new (_xdl().PackagerLogsStream)({
      projectRoot,

      onStartBuildBundle({
        bundleDetails
      }) {
        // TODO: Unify with commands/utils/progress.ts
        const platform = _xdl().PackagerLogsStream.getPlatformTagForBuildDetails(bundleDetails);

        bar = new (_progress().default)(`${platform}Bundling JavaScript [:bar] :percent`, {
          width: 64,
          total: 100,
          clear: true,
          complete: '=',
          incomplete: ' '
        });

        _log().default.setBundleProgressBar(bar);
      },

      onProgressBuildBundle({
        progress
      }) {
        if (!bar || bar.complete) return;
        const ticks = progress - bar.curr;
        ticks > 0 && bar.tick(ticks);
      },

      onFinishBuildBundle({
        error,
        start,
        end,
        bundleDetails
      }) {
        if (bar && !bar.complete) {
          bar.tick(100 - bar.curr);
        }

        if (bar) {
          _log().default.setBundleProgressBar(null);

          bar.terminate();
          bar = null;

          const platform = _xdl().PackagerLogsStream.getPlatformTagForBuildDetails(bundleDetails);

          const totalBuildTimeMs = end.getTime() - start.getTime();

          const durationSuffix = _chalk().default.gray(` ${totalBuildTimeMs}ms`);

          if (error) {
            _log().default.log(_chalk().default.red(`${platform}Bundling failed` + durationSuffix));
          } else {
            _log().default.log(_chalk().default.green(`${platform}Bundling complete` + durationSuffix));

            _StatusEventEmitter().default.emit('bundleBuildFinish', {
              totalBuildTimeMs
            });
          }
        }
      },

      updateLogs: updater => {
        const newLogChunks = updater([]);
        newLogChunks.forEach(newLogChunk => {
          if (newLogChunk.issueId && newLogChunk.issueCleared) {
            return;
          }

          logWithLevel(newLogChunk);
        });
      }
    }); // needed for validation logging to function

    _xdl().ProjectUtils.attachLoggerStream(projectRoot, {
      stream: {
        write: chunk => {
          if (chunk.tag === 'device') {
            logWithLevel(chunk);

            _StatusEventEmitter().default.emit('deviceLogReceive', {
              deviceId: chunk.deviceId,
              deviceName: chunk.deviceName
            });
          }
        }
      },
      type: 'raw'
    }); // The existing CLI modules only pass one argument to this function, so skipProjectValidation
    // will be undefined in most cases. we can explicitly pass a truthy value here to avoid
    // validation (eg for init)
    //
    // If the packager/manifest server is running and healthy, there is no need
    // to rerun Doctor because the directory was already checked previously
    // This is relevant for command such as `send`


    if (options.checkConfig && (await _xdl().ProjectSettings.getCurrentStatusAsync(projectRoot)) !== 'running') {
      const spinner = (0, _ora().ora)('Making sure project is set up correctly...').start();

      _log().default.setSpinner(spinner); // validate that this is a good projectDir before we try anything else


      const {
        Doctor
      } = await Promise.resolve().then(() => _interopRequireWildcard(require('xdl')));
      const status = await Doctor.validateWithoutNetworkAsync(projectRoot, {
        skipSDKVersionRequirement: options.skipSDKVersionRequirement
      });

      if (status === Doctor.FATAL) {
        throw new Error(`There is an error with your project. See above logs for information.`);
      }

      spinner.stop();

      _log().default.setSpinner(null);
    } // the existing CLI modules only pass one argument to this function, so skipProjectValidation
    // will be undefined in most cases. we can explicitly pass a truthy value here to avoid validation (eg for init)


    return asyncFn(projectRoot, ...args);
  });
};

async function bootstrapAnalyticsAsync() {
  _xdl().Analytics.initializeClient('1wHTzmVgmZvNjCalKL45chlc2VN', 'https://cdp.expo.dev', packageJSON.version);

  _xdl().UnifiedAnalytics.initializeClient('1wabJGd5IiuF9Q8SGlcI90v8WTs', 'https://cdp.expo.dev', packageJSON.version);

  const userData = await (0, _profileMethod().profileMethod)(_xdl().UserManager.getCachedUserDataAsync, 'getCachedUserDataAsync')();
  if (!(userData !== null && userData !== void 0 && userData.userId)) return;

  _xdl().UnifiedAnalytics.identifyUser(userData.userId, {
    userId: userData.userId,
    currentConnection: userData === null || userData === void 0 ? void 0 : userData.currentConnection,
    username: userData === null || userData === void 0 ? void 0 : userData.username
  });
}

function trackUsage(commands = []) {
  var _commands$find;

  const input = process.argv[2];

  const ExpoCommand = cmd => (cmd._name === input || cmd._alias === input) && input !== undefined;

  const subCommand = (_commands$find = commands.find(ExpoCommand)) === null || _commands$find === void 0 ? void 0 : _commands$find._name;
  if (!subCommand) return; // only track valid expo commands

  _xdl().UnifiedAnalytics.logEvent('action', {
    action: `expo ${subCommand}`,
    source: 'expo cli',
    source_version: _xdl().UnifiedAnalytics.version
  });
}

async function runAsync(programName) {
  try {
    _registerLogs();

    if (_xdl().Env.shouldEnableAnalytics()) {
      await bootstrapAnalyticsAsync();
    }

    _xdl().UserManager.setInteractiveAuthenticationCallback(_accounts().loginOrRegisterAsync);

    if (process.env.SERVER_URL) {
      let serverUrl = process.env.SERVER_URL;

      if (!serverUrl.startsWith('http')) {
        serverUrl = `http://${serverUrl}`;
      }

      const parsedUrl = _url().default.parse(serverUrl);

      const port = parseInt(parsedUrl.port || '', 10);

      if (parsedUrl.hostname && port) {
        _xdl().Config.api.host = parsedUrl.hostname;
        _xdl().Config.api.port = port;
      } else {
        throw new Error('Environment variable SERVER_URL is not a valid url');
      }
    } // Setup our commander instance


    _commander().default.name(programName);

    _commander().default.version(packageJSON.version).option('--non-interactive', 'Fail, if an interactive prompt would be required to continue.'); // Load each module found in ./commands by 'registering' it with our commander instance


    (0, _profileMethod().profileMethod)(_commands().registerCommands)(_commander().default);
    trackUsage(_commander().default.commands); // must be after register commands

    _commander().default.on('command:detach', () => {
      _log().default.warn('To eject your project to ExpoKit (previously "detach"), use `expo eject`.');

      process.exit(0);
    });

    _commander().default.on('command:*', subCommand => {
      let msg = `"${subCommand}" is not an expo command. See "expo --help" for the full list of commands.`;

      const availableCommands = _commander().default.commands.map(cmd => cmd._name); // finding the best match whose edit distance is less than 40% of their length.


      const suggestion = availableCommands.find(commandName => (0, _leven().default)(commandName, subCommand[0]) < commandName.length * 0.4);

      if (suggestion) {
        msg = `"${subCommand}" is not an expo command -- did you mean ${suggestion}?\n See "expo --help" for the full list of commands.`;
      }

      _log().default.warn(msg);
    });

    if (typeof _commander().default.nonInteractive === 'undefined') {
      // Commander doesn't initialize boolean args with default values.
      _commander().default.nonInteractive = !process.stdin.isTTY;
    }

    _commander().default.parse(process.argv); // Show help when no sub-command specified


    if (_commander().default.args.length === 0) {
      _commander().default.help();
    }
  } catch (e) {
    _log().default.error(e);

    throw e;
  }
}

async function checkCliVersionAsync() {
  // Skip checking for latest version on EAS Build
  if (_getenv().default.boolish('EAS_BUILD', false)) {
    return;
  }

  const {
    updateIsAvailable,
    current,
    latest,
    deprecated
  } = await _update().default.checkForUpdateAsync();

  if (updateIsAvailable) {
    _log().default.nestedWarn((0, _boxen().default)(_chalk().default.green(`There is a new version of ${packageJSON.name} available (${latest}).
You are currently using ${packageJSON.name} ${current}
Install expo-cli globally using the package manager of your choice;
for example: \`npm install -g ${packageJSON.name}\` to get the latest version`), {
      borderColor: 'green',
      padding: 1
    }));
  }

  if (deprecated) {
    _log().default.nestedWarn((0, _boxen().default)(_chalk().default.red(`This version of expo-cli is not supported anymore.
It's highly recommended to update to the newest version.

The API endpoints used in this version of expo-cli might not exist,
any interaction with Expo servers may result in unexpected behaviour.`), {
      borderColor: 'red',
      padding: 1
    }));
  }
}

function _registerLogs() {
  const stream = {
    level: _log().default.isDebug ? 'debug' : 'info',
    stream: {
      write: chunk => {
        if (chunk.code) {
          switch (chunk.code) {
            case _xdl().LoadingEvent.START_PROGRESS_BAR:
              {
                const bar = new (_progress().default)(chunk.msg, {
                  width: 64,
                  total: 100,
                  clear: true,
                  complete: '=',
                  incomplete: ' '
                });

                _log().default.setBundleProgressBar(bar);

                return;
              }

            case _xdl().LoadingEvent.TICK_PROGRESS_BAR:
              {
                const bar = _log().default.getProgress();

                if (bar) {
                  bar.tick(1, chunk.msg);
                }

                return;
              }

            case _xdl().LoadingEvent.STOP_PROGRESS_BAR:
              {
                const bar = _log().default.getProgress();

                if (bar) {
                  _log().default.setBundleProgressBar(null);

                  bar.terminate();
                }

                return;
              }

            case _xdl().LoadingEvent.START_LOADING:
              (0, _ora().logNewSection)(chunk.msg || '');
              return;

            case _xdl().LoadingEvent.STOP_LOADING:
              {
                const spinner = _log().default.getSpinner();

                if (spinner) {
                  spinner.stop();
                }

                return;
              }
          }
        }

        if (chunk.level === _bunyan().default.INFO) {
          _log().default.log(chunk.msg);
        } else if (chunk.level === _bunyan().default.WARN) {
          _log().default.warn(chunk.msg);
        } else if (chunk.level === _bunyan().default.DEBUG) {
          _log().default.debug(chunk.msg);
        } else if (chunk.level >= _bunyan().default.ERROR) {
          _log().default.error(chunk.msg);
        }
      }
    },
    type: 'raw'
  };

  _xdl().Logger.notifications.addStream(stream);

  _xdl().Logger.global.addStream(stream);
}

async function writePathAsync() {
  const subCommand = process.argv[2];

  if (subCommand === 'prepare-detached-build') {
    // This is being run from Android Studio or Xcode. Don't want to write PATH in this case.
    return;
  }

  await _xdl().Binaries.writePathToUserSettingsAsync();
} // This is the entry point of the CLI


function run(programName) {
  (async function () {
    await Promise.all([writePathAsync(), runAsync(programName)]);
  })().catch(e => {
    _log().default.error('Uncaught Error', e);

    process.exit(1);
  });
}
//# sourceMappingURL=exp.js.map