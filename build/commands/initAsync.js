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

function _configPlugins() {
  const data = require("@expo/config-plugins");

  _configPlugins = function () {
    return data;
  };

  return data;
}

function _plist() {
  const data = _interopRequireDefault(require("@expo/plist"));

  _plist = function () {
    return data;
  };

  return data;
}

function _spawnAsync() {
  const data = _interopRequireDefault(require("@expo/spawn-async"));

  _spawnAsync = function () {
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
  const data = _interopRequireDefault(require("commander"));

  _commander = function () {
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

function _npmPackageArg() {
  const data = _interopRequireDefault(require("npm-package-arg"));

  _npmPackageArg = function () {
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

function _stripAnsi() {
  const data = _interopRequireDefault(require("strip-ansi"));

  _stripAnsi = function () {
    return data;
  };

  return data;
}

function _terminalLink() {
  const data = _interopRequireDefault(require("terminal-link"));

  _terminalLink = function () {
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

function _ora() {
  const data = require("../utils/ora");

  _ora = function () {
    return data;
  };

  return data;
}

function _prompts() {
  const data = _interopRequireWildcard(require("../utils/prompts"));

  _prompts = function () {
    return data;
  };

  return data;
}

function _clearNativeFolder() {
  const data = require("./eject/clearNativeFolder");

  _clearNativeFolder = function () {
    return data;
  };

  return data;
}

function CreateApp() {
  const data = _interopRequireWildcard(require("./utils/CreateApp"));

  CreateApp = function () {
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

function _extractTemplateAppAsync() {
  const data = require("./utils/extractTemplateAppAsync");

  _extractTemplateAppAsync = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FEATURED_TEMPLATES = ['----- Managed workflow -----', {
  shortName: 'blank',
  name: 'expo-template-blank',
  description: 'a minimal app as clean as an empty canvas'
}, {
  shortName: 'blank (TypeScript)',
  name: 'expo-template-blank-typescript',
  description: 'same as blank but with TypeScript configuration'
}, {
  shortName: 'tabs (TypeScript)',
  name: 'expo-template-tabs',
  description: 'several example screens and tabs using react-navigation and TypeScript'
}, '----- Bare workflow -----', {
  shortName: 'minimal',
  name: 'expo-template-bare-minimum',
  description: 'bare and minimal, just the essentials to get you started'
}];
const isMacOS = process.platform === 'darwin';

function assertValidName(folderName) {
  const validation = CreateApp().validateName(folderName);

  if (typeof validation === 'string') {
    throw new (_CommandError().default)(`Cannot create an app named ${_chalk().default.red(`"${folderName}"`)}. ${validation}`);
  }

  const isFolderNameForbidden = CreateApp().isFolderNameForbidden(folderName);

  if (isFolderNameForbidden) {
    throw new (_CommandError().default)(`Cannot create an app named ${_chalk().default.red(`"${folderName}"`)} because it would conflict with a dependency of the same name.`);
  }
}

function parseOptions(command) {
  return {
    yes: !!command.yes,
    yarn: !!command.yarn,
    npm: !!command.npm,
    install: !!command.install,
    template: command.template,
    /// XXX(ville): this is necessary because with Commander.js, when the --name
    // option is not set, `command.name` will point to `Command.prototype.name`.
    name: typeof command.name === 'string' ? command.name : undefined
  };
}

async function assertFolderEmptyAsync(projectRoot, folderName) {
  if (!(await CreateApp().assertFolderEmptyAsync({
    projectRoot,
    folderName,
    overwrite: false
  }))) {
    const message = 'Try using a new directory name, or moving these files.';

    _log().default.newLine();

    _log().default.nested(message);

    _log().default.newLine();

    throw new (_CommandError().SilentError)(message);
  }
}

async function resolveProjectRootAsync(input) {
  let name = input === null || input === void 0 ? void 0 : input.trim();

  if (!name) {
    try {
      const {
        answer
      } = await (0, _prompts().default)({
        type: 'text',
        name: 'answer',
        message: 'What would you like to name your app?',
        initial: 'my-app',
        validate: name => {
          const validation = CreateApp().validateName(_path().default.basename(_path().default.resolve(name)));

          if (typeof validation === 'string') {
            return 'Invalid project name: ' + validation;
          }

          return true;
        }
      }, {
        nonInteractiveHelp: 'Pass the project name using the first argument `expo init <name>`'
      });

      if (typeof answer === 'string') {
        name = answer.trim();
      }
    } catch (error) {
      // Handle the aborted message in a custom way.
      if (error.code !== 'ABORTED') {
        throw error;
      }
    }
  }

  if (!name) {
    const message = ['', 'Please choose your app name:', `  ${_chalk().default.green(`${_commander().default.name()} init`)} ${_chalk().default.cyan('<app-name>')}`, '', `Run ${_chalk().default.green(`${_commander().default.name()} init --help`)} for more info`, ''].join('\n');

    _log().default.nested(message);

    throw new (_CommandError().SilentError)(message);
  }

  const projectRoot = _path().default.resolve(name);

  const folderName = _path().default.basename(projectRoot);

  assertValidName(folderName);
  await _fsExtra().default.ensureDir(projectRoot);
  await assertFolderEmptyAsync(projectRoot, folderName);
  return projectRoot;
}

function padEnd(str, width) {
  // Pulled from commander for overriding
  const len = Math.max(0, width - (0, _stripAnsi().default)(str).length);
  return str + Array(len + 1).join(' ');
}

async function resolveTemplateAsync(resolvedTemplate) {
  const {
    version: newestSdkVersion,
    data: newestSdkReleaseData
  } = await _xdl().Versions.newestReleasedSdkVersionAsync(); // If the user is opting into a beta then we need to append the template tag explicitly
  // in order to not fall back to the latest tag for templates.

  let versionParam = '';

  if (newestSdkReleaseData !== null && newestSdkReleaseData !== void 0 && newestSdkReleaseData.beta) {
    const majorVersion = parseInt(newestSdkVersion, 10);
    versionParam = `@sdk-${majorVersion}`; // If the --template flag is provided without an explicit version, then opt-in to
    // the beta version

    if (resolvedTemplate && !resolvedTemplate.includes('@')) {
      resolvedTemplate = `${resolvedTemplate}${versionParam}`;
    }
  }

  let templateSpec;

  if (resolvedTemplate) {
    var _templateSpec$name, _templateSpec$fetchSp;

    templateSpec = (0, _npmPackageArg().default)(resolvedTemplate); // For backwards compatibility, 'blank' and 'tabs' are aliases for
    // 'expo-template-blank' and 'expo-template-tabs', respectively.

    if (templateSpec.name && templateSpec.registry && ['blank', 'tabs', 'bare-minimum'].includes(templateSpec.name)) {
      templateSpec.escapedName = `expo-template-${templateSpec.name}`;
      templateSpec.name = templateSpec.escapedName;
      templateSpec.raw = templateSpec.escapedName;
    }

    return `${(_templateSpec$name = templateSpec.name) !== null && _templateSpec$name !== void 0 ? _templateSpec$name : templateSpec.raw}@${(_templateSpec$fetchSp = templateSpec.fetchSpec) !== null && _templateSpec$fetchSp !== void 0 ? _templateSpec$fetchSp : 'latest'}`;
  }

  const descriptionColumn = Math.max(...FEATURED_TEMPLATES.map(t => typeof t === 'object' ? t.shortName.length : 0)) + 2;
  const template = await (0, _prompts().selectAsync)({
    message: 'Choose a template:',
    optionsPerPage: 20,
    choices: FEATURED_TEMPLATES.map(template => {
      if (typeof template === 'string') {
        return _prompts().default.separator(template);
      } else {
        return {
          value: template.name,
          title: _chalk().default.bold(padEnd(template.shortName, descriptionColumn)) + template.description.trim(),
          short: template.name
        };
      }
    })
  }, {
    nonInteractiveHelp: '--template: argument is required in non-interactive mode. Valid choices are: "blank", "tabs", "bare-minimum" or any custom template (name of npm package).'
  });
  return `${template}${versionParam}`;
}

async function actionAsync(incomingProjectRoot, command) {
  var _options$template;

  const options = parseOptions(command); // Resolve the name, and projectRoot

  let projectRoot;

  if (!incomingProjectRoot && options.yes) {
    projectRoot = _path().default.resolve(process.cwd());

    const folderName = _path().default.basename(projectRoot);

    assertValidName(folderName);
    await assertFolderEmptyAsync(projectRoot, folderName);
  } else {
    projectRoot = await resolveProjectRootAsync(incomingProjectRoot || options.name);
  }

  let resolvedTemplate = (_options$template = options.template) !== null && _options$template !== void 0 ? _options$template : null; // @ts-ignore: This guards against someone passing --template without a name after it.

  if (resolvedTemplate === true) {
    throw new (_CommandError().default)('Please specify the template name');
  } // Download and sync templates
  // TODO(Bacon): revisit


  if (options.yes && !resolvedTemplate) {
    resolvedTemplate = 'blank';
  } // Supported templates:
  // `-t tabs` (tabs, blank, bare-minimum, expo-template-blank-typescript)
  // `-t tabs@40`
  // `-t tabs@sdk-40`
  // `-t tabs@latest`
  // `-t expo-template-tabs@latest`


  const npmPackageName = await resolveTemplateAsync(resolvedTemplate);

  _log().default.debug(`Using template: ${npmPackageName}`);

  const projectName = _path().default.basename(projectRoot);

  const initialConfig = {
    // In older templates the `.name` property is set when extracting template files. This is because older templates have the `.name` property set to `HelloWorld`.
    // Newer templates don't need the `.name` property set, so we don't bother with setting it.
    expo: {
      name: projectName,
      slug: projectName
    }
  };
  const extractTemplateStep = (0, _ora().logNewSection)('Downloading template.');
  let projectPath;

  try {
    projectPath = await (0, _extractTemplateAppAsync().extractAndPrepareTemplateAppAsync)(npmPackageName, projectRoot, initialConfig);
    extractTemplateStep.succeed('Downloaded template.');
  } catch (e) {
    extractTemplateStep.fail('Something went wrong while downloading and extracting the template.');
    throw e;
  } // Install dependencies


  const packageManager = CreateApp().resolvePackageManager(options); // TODO(Bacon): not this

  const isBare = await (0, _clearNativeFolder().directoryExistsAsync)(_path().default.join(projectRoot, 'ios'));
  const workflow = isBare ? 'bare' : 'managed';
  let hasPodsInstalled = false;

  const needsPodsInstalled = _fsExtra().default.existsSync(_path().default.join(projectRoot, 'ios/Podfile'));

  if (options.install) {
    await installNodeDependenciesAsync(projectRoot, packageManager);

    if (needsPodsInstalled) {
      hasPodsInstalled = await CreateApp().installCocoaPodsAsync(projectRoot);
    }
  } // Configure updates (?)


  const cdPath = CreateApp().getChangeDirectoryPath(projectRoot);
  let showPublishBeforeBuildWarning;
  let didConfigureUpdatesProjectFiles = false;
  let username = null;

  if (isBare) {
    username = await _xdl().UserManager.getCurrentUsernameAsync();

    if (username) {
      try {
        await configureUpdatesProjectFilesAsync(projectPath, username);
        didConfigureUpdatesProjectFiles = true;
      } catch {}
    }

    showPublishBeforeBuildWarning = await (0, _ProjectUtils().usesOldExpoUpdatesAsync)(projectPath);
  } // Log info


  _log().default.addNewLineIfNone();

  await logProjectReadyAsync({
    cdPath,
    packageManager,
    workflow,
    showPublishBeforeBuildWarning,
    didConfigureUpdatesProjectFiles,
    username
  }); // Log a warning about needing to install node modules

  if (!options.install) {
    logNodeInstallWarning(cdPath, packageManager);
  }

  if (needsPodsInstalled && !hasPodsInstalled) {
    logCocoaPodsWarning(cdPath);
  } // Initialize Git at the end to ensure all lock files are committed.


  await initGitRepoAsync(projectPath);
}

async function installNodeDependenciesAsync(projectRoot, packageManager) {
  const installJsDepsStep = (0, _ora().logNewSection)('Installing JavaScript dependencies.');

  try {
    await CreateApp().installNodeDependenciesAsync(projectRoot, packageManager);
    installJsDepsStep.succeed('Installed JavaScript dependencies.');
  } catch {
    installJsDepsStep.fail(`Something went wrong installing JavaScript dependencies. Check your ${packageManager} logs. Continuing to initialize the app.`);
  }
}
/**
 * Check if the project is inside an existing Git repo, if so bail out,
 * if not then create a new git repo and commit the initial files.
 *
 * @returns `true` if git is setup.
 */


async function initGitRepoAsync(root) {
  // let's see if we're in a git tree
  try {
    await (0, _spawnAsync().default)('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: root
    }); // Log a light notice if we're in a git tree.

    _log().default.log(_chalk().default.gray(`Project is already inside of a git repo, skipping ${_chalk().default.bold`git init`}.`)); // Bail out if inside git repo, this makes monorepos a bit easier to setup.


    return true;
  } catch (e) {
    if (e.errno === 'ENOENT') {
      _log().default.warn('Unable to initialize git repo. `git` not in PATH.');

      return false;
    }
  } // not in git tree, so let's init


  try {
    await (0, _spawnAsync().default)('git', ['init'], {
      cwd: root
    });

    _log().default.debug('Initialized a git repository.');

    await (0, _spawnAsync().default)('git', ['add', '--all'], {
      cwd: root,
      stdio: 'ignore'
    });
    await (0, _spawnAsync().default)('git', ['commit', '-m', 'Created a new Expo app'], {
      cwd: root,
      stdio: 'ignore'
    });
    return true;
  } catch (e) {
    _log().default.debug('git error:', e); // no-op -- this is just a convenience and we don't care if it fails


    return false;
  }
}

function logNodeInstallWarning(cdPath, packageManager) {
  _log().default.newLine();

  _log().default.nested(`⚠️  Before running your app, make sure you have node modules installed:`);

  _log().default.nested('');

  if (cdPath) {
    // In the case of --yes the project can be created in place so there would be no need to change directories.
    _log().default.nested(`  cd ${cdPath}/`);
  }

  _log().default.nested(`  ${packageManager === 'npm' ? 'npm install' : 'yarn'}`);

  _log().default.nested('');
}

function logCocoaPodsWarning(cdPath) {
  if (process.platform !== 'darwin') {
    return;
  }

  _log().default.newLine();

  _log().default.nested(`⚠️  Before running your app on iOS, make sure you have CocoaPods installed and initialize the project:`);

  _log().default.nested('');

  if (cdPath) {
    // In the case of --yes the project can be created in place so there would be no need to change directories.
    _log().default.nested(`  cd ${cdPath}/`);
  }

  _log().default.nested(`  npx pod-install`);

  _log().default.nested('');
}

function logProjectReadyAsync({
  cdPath,
  packageManager,
  workflow,
  showPublishBeforeBuildWarning,
  didConfigureUpdatesProjectFiles,
  username
}) {
  _log().default.nested(_chalk().default.bold(`✅ Your project is ready!`));

  _log().default.newLine(); // empty string if project was created in current directory


  if (cdPath) {
    _log().default.nested(`To run your project, navigate to the directory and run one of the following ${packageManager} commands.`);

    _log().default.newLine();

    _log().default.nested(`- ${_chalk().default.bold('cd ' + cdPath)}`);
  } else {
    _log().default.nested(`To run your project, run one of the following ${packageManager} commands.`);

    _log().default.newLine();
  }

  if (workflow === 'managed') {
    _log().default.nested(`- ${_chalk().default.bold(`${packageManager} start`)} ${_chalk().default.dim(`# you can open iOS, Android, or web from here, or run them directly with the commands below.`)}`);
  }

  _log().default.nested(`- ${_chalk().default.bold(packageManager === 'npm' ? 'npm run android' : 'yarn android')}`);

  let macOSComment = '';

  if (!isMacOS && workflow === 'bare') {
    macOSComment = ' # you need to use macOS to build the iOS project - use managed workflow if you need to do iOS development without a Mac';
  } else if (!isMacOS && workflow === 'managed') {
    macOSComment = ' # requires an iOS device or macOS for access to an iOS simulator';
  }

  _log().default.nested(`- ${_chalk().default.bold(packageManager === 'npm' ? 'npm run ios' : 'yarn ios')}${macOSComment}`);

  _log().default.nested(`- ${_chalk().default.bold(packageManager === 'npm' ? 'npm run web' : 'yarn web')}`);

  if (workflow === 'bare') {
    _log().default.newLine();

    _log().default.nested(`💡 You can also open up the projects in the ${_chalk().default.bold('ios')} and ${_chalk().default.bold('android')} directories with their respective IDEs.`);

    if (showPublishBeforeBuildWarning) {
      _log().default.nested(`🚀 ${(0, _terminalLink().default)('expo-updates', 'https://github.com/expo/expo/blob/master/packages/expo-updates/README.md')} has been configured in your project. Before you do a release build, make sure you run ${_chalk().default.bold('expo publish')}. ${(0, _terminalLink().default)('Learn more.', 'https://expo.fyi/release-builds-with-expo-updates')}`);
    } else if (didConfigureUpdatesProjectFiles) {
      _log().default.nested(`🚀 ${(0, _terminalLink().default)('expo-updates', 'https://github.com/expo/expo/blob/master/packages/expo-updates/README.md')} has been configured in your project. If you publish this project under a different user account than ${_chalk().default.bold(username)}, you'll need to update the configuration in Expo.plist and AndroidManifest.xml before making a release build.`);
    } else {
      _log().default.nested(`🚀 ${(0, _terminalLink().default)('expo-updates', 'https://github.com/expo/expo/blob/master/packages/expo-updates/README.md')} has been installed in your project. Before you do a release build, you'll need to configure a few values in Expo.plist and AndroidManifest.xml in order for updates to work.`);
    } // TODO: add equivalent of this or some command to wrap it:
    // # ios
    // $ open -a Xcode ./ios/{PROJECT_NAME}.xcworkspace
    // # android
    // $ open -a /Applications/Android\\ Studio.app ./android

  }
}

async function configureUpdatesProjectFilesAsync(projectRoot, username) {
  // skipSDKVersionRequirement here so that this will work when you use the
  // --no-install flag. the tradeoff is that the SDK version field won't be
  // filled in, but we should be getting rid of that for expo-updates ASAP
  // anyways.
  const {
    exp
  } = (0, _config().getConfig)(projectRoot, {
    skipSDKVersionRequirement: true
  }); // apply Android config

  const androidManifestPath = await _configPlugins().AndroidConfig.Paths.getAndroidManifestAsync(projectRoot);
  const androidManifestJSON = await _configPlugins().AndroidConfig.Manifest.readAndroidManifestAsync(androidManifestPath);
  const result = await _configPlugins().AndroidConfig.Updates.setUpdatesConfig(exp, androidManifestJSON, username);
  await _configPlugins().AndroidConfig.Manifest.writeAndroidManifestAsync(androidManifestPath, result); // apply iOS config

  const iosSourceRoot = _configPlugins().IOSConfig.Paths.getSourceRoot(projectRoot);

  const supportingDirectory = _path().default.join(iosSourceRoot, 'Supporting');

  const plistFilePath = _path().default.join(supportingDirectory, 'Expo.plist');

  let data = _plist().default.parse(_fsExtra().default.readFileSync(plistFilePath, 'utf8'));

  data = _configPlugins().IOSConfig.Updates.setUpdatesConfig(exp, data, username);
  await _fsExtra().default.writeFile(plistFilePath, _plist().default.build(data));
}
//# sourceMappingURL=initAsync.js.map