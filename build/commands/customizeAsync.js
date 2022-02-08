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

function _prompts() {
  const data = _interopRequireDefault(require("prompts"));

  _prompts = function () {
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

function _log() {
  const data = _interopRequireDefault(require("../log"));

  _log = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function maybeWarnToCommitAsync(projectRoot) {
  let workingTreeStatus = 'unknown';

  try {
    const result = await (0, _spawnAsync().default)('git', ['status', '--porcelain']);
    workingTreeStatus = result.stdout === '' ? 'clean' : 'dirty';
  } catch (e) {// Maybe git is not installed?
    // Maybe this project is not using git?
  }

  if (workingTreeStatus === 'dirty') {
    _log().default.log(_chalk().default.yellow('You should commit your changes before generating code into the root of your project.'));
  }
}

const dependencyMap = {
  'babel.config.js': ['babel-preset-expo'],
  'webpack.config.js': ['@expo/webpack-config']
};

function resolveFromLocalOrGlobal(projectRoot, moduleId) {
  const resolved = _resolveFrom().default.silent(projectRoot, moduleId);

  if (resolved) {
    return resolved;
  }

  return require.resolve(moduleId);
}

async function generateFilesAsync({
  projectRoot,
  staticPath,
  options,
  answer,
  templateFolder
}) {
  const promises = [];

  for (const file of answer) {
    if (Object.keys(dependencyMap).includes(file)) {
      const projectFilePath = _path().default.resolve(projectRoot, file); // copy the file from template


      promises.push(_fsExtra().default.copy(resolveFromLocalOrGlobal(projectRoot, _path().default.join('@expo/webpack-config/template', file)), projectFilePath, {
        overwrite: true,
        recursive: true
      }));

      if (file in dependencyMap) {
        const packageManager = PackageManager().createForProject(projectRoot, {
          log: _log().default.log
        });

        for (const dependency of dependencyMap[file]) {
          promises.push(packageManager.addDevAsync(dependency));
        }
      }
    } else {
      const fileName = _path().default.basename(file);

      const src = _path().default.resolve(templateFolder, fileName);

      const dest = _path().default.resolve(projectRoot, staticPath, fileName);

      if (await _fsExtra().default.pathExists(src)) {
        promises.push(_fsExtra().default.copy(src, dest, {
          overwrite: true,
          recursive: true
        }));
      } else {
        throw new Error(`Expected template file for ${fileName} doesn't exist at path: ${src}`);
      }
    }
  }

  await Promise.all(promises);
}

async function actionAsync(projectRoot = './', options = {
  force: false
}) {
  // Get the static path (defaults to 'web/')
  // Doesn't matter if expo is installed or which mode is used.
  const {
    exp
  } = (0, _config().getConfig)(projectRoot, {
    skipSDKVersionRequirement: true
  });

  const templateFolder = _path().default.dirname(resolveFromLocalOrGlobal(projectRoot, '@expo/webpack-config/web-default/index.html'));

  const files = (await _fsExtra().default.readdir(templateFolder)).filter(item => item !== 'icon.png');
  const {
    web: {
      staticPath = 'web'
    } = {}
  } = exp;
  const allFiles = [...Object.keys(dependencyMap), ...files.map(file => _path().default.join(staticPath, file))];
  const values = [];

  for (const file of allFiles) {
    const localProjectFile = _path().default.resolve(projectRoot, file);

    const exists = _fsExtra().default.existsSync(localProjectFile);

    values.push({
      title: file,
      value: file,
      // @ts-ignore: broken types
      disabled: !options.force && exists,
      description: options.force && exists ? _chalk().default.red('This will overwrite the existing file') : ''
    });
  }

  if (!values.filter(({
    disabled
  }) => !disabled).length) {
    _log().default.log(_chalk().default.yellow('\nAll of the custom web files already exist.') + '\nTo regenerate the files run:' + _chalk().default.bold(' expo customize:web --force\n'));

    return;
  }

  await maybeWarnToCommitAsync(projectRoot);
  const {
    answer
  } = await (0, _prompts().default)({
    type: 'multiselect',
    name: 'answer',
    message: 'Which files would you like to generate?',
    hint: '- Space to select. Return to submit',
    // @ts-ignore: broken types
    warn: 'File exists, use --force to overwrite it.',
    limit: values.length,
    instructions: '',
    choices: values
  });

  if (!answer || answer.length === 0) {
    _log().default.log('\n\u203A Exiting with no change...\n');

    return;
  }

  await generateFilesAsync({
    projectRoot,
    staticPath,
    options,
    answer,
    templateFolder
  });
}
//# sourceMappingURL=customizeAsync.js.map