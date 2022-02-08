"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArchiveFileLocationAsync = getArchiveFileLocationAsync;
exports.ArchiveFileSourceType = void 0;

function _xdl() {
  const data = require("xdl");

  _xdl = function () {
    return data;
  };

  return data;
}

function _log() {
  const data = _interopRequireDefault(require("../../../../log"));

  _log = function () {
    return data;
  };

  return data;
}

function _prompts() {
  const data = _interopRequireDefault(require("../../../../prompts"));

  _prompts = function () {
    return data;
  };

  return data;
}

function _validators() {
  const data = require("../../../../validators");

  _validators = function () {
    return data;
  };

  return data;
}

function _isUUID() {
  const data = require("../../../utils/isUUID");

  _isUUID = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("../utils/config");

  _config = function () {
    return data;
  };

  return data;
}

function _files() {
  const data = require("../utils/files");

  _files = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ArchiveFileSourceType;
exports.ArchiveFileSourceType = ArchiveFileSourceType;

(function (ArchiveFileSourceType) {
  ArchiveFileSourceType[ArchiveFileSourceType["url"] = 0] = "url";
  ArchiveFileSourceType[ArchiveFileSourceType["latest"] = 1] = "latest";
  ArchiveFileSourceType[ArchiveFileSourceType["path"] = 2] = "path";
  ArchiveFileSourceType[ArchiveFileSourceType["buildId"] = 3] = "buildId";
  ArchiveFileSourceType[ArchiveFileSourceType["prompt"] = 4] = "prompt";
})(ArchiveFileSourceType || (exports.ArchiveFileSourceType = ArchiveFileSourceType = {}));

async function getArchiveFileLocationAsync(source) {
  switch (source.sourceType) {
    case ArchiveFileSourceType.prompt:
      return await handlePromptSourceAsync(source);

    case ArchiveFileSourceType.url:
      {
        const url = await handleUrlSourceAsync(source);
        return await getArchiveLocationForUrlAsync(url);
      }

    case ArchiveFileSourceType.latest:
      {
        const url = await handleLatestSourceAsync(source);
        return await getArchiveLocationForUrlAsync(url);
      }

    case ArchiveFileSourceType.path:
      {
        const path = await handlePathSourceAsync(source);
        return getArchiveLocationForPathAsync(path);
      }

    case ArchiveFileSourceType.buildId:
      {
        const url = await handleBuildIdSourceAsync(source);
        return await getArchiveLocationForUrlAsync(url);
      }
  }
}

async function getArchiveLocationForUrlAsync(url) {
  // When a URL points to a tar file, download it and extract using unified logic.
  // Otherwise send it directly to the server in online mode.
  if (!(0, _files().pathIsTar)(url)) {
    return url;
  } else {
    _log().default.log('Downloading your app archive');

    return (0, _files().downloadAppArchiveAsync)(url);
  }
}

async function getArchiveLocationForPathAsync(path) {
  const resolvedPath = await (0, _files().extractLocalArchiveAsync)(path);

  _log().default.log('Uploading your app archive to the Expo Submission Service');

  return await (0, _files().uploadAppArchiveAsync)(resolvedPath);
}

async function handleUrlSourceAsync(source) {
  return source.url;
}

async function handleLatestSourceAsync(source) {
  const {
    owner,
    slug
  } = (0, _config().getAppConfig)(source.projectDir);
  const builds = await _xdl().StandaloneBuild.getStandaloneBuilds({
    platform: source.platform,
    owner,
    slug
  }, 1);

  if (builds.length === 0) {
    _log().default.error(_log().default.chalk.bold("Couldn't find any builds for this project on Expo servers. It looks like you haven't run expo build:android yet."));

    return getArchiveFileLocationAsync({
      sourceType: ArchiveFileSourceType.prompt,
      platform: source.platform,
      projectDir: source.projectDir
    });
  }

  return builds[0].artifacts.url;
}

async function handlePathSourceAsync(source) {
  if (!(await (0, _validators().existingFile)(source.path))) {
    _log().default.error(_log().default.chalk.bold(`${source.path} doesn't exist`));

    return getArchiveFileLocationAsync({
      sourceType: ArchiveFileSourceType.prompt,
      platform: source.platform,
      projectDir: source.projectDir
    });
  }

  return source.path;
}

async function handleBuildIdSourceAsync(source) {
  const {
    owner,
    slug
  } = (0, _config().getAppConfig)(source.projectDir);
  let build;

  try {
    build = await _xdl().StandaloneBuild.getStandaloneBuildById({
      platform: source.platform,
      id: source.id,
      owner,
      slug
    });
  } catch (err) {
    _log().default.error(err);

    throw err;
  }

  if (!build) {
    _log().default.error(_log().default.chalk.bold(`Couldn't find build for id ${source.id}`));

    return getArchiveFileLocationAsync({
      sourceType: ArchiveFileSourceType.prompt,
      platform: source.platform,
      projectDir: source.projectDir
    });
  } else {
    return build.artifacts.url;
  }
}

async function handlePromptSourceAsync(source) {
  const {
    sourceType: sourceTypeRaw
  } = await (0, _prompts().default)({
    name: 'sourceType',
    type: 'select',
    message: 'What would you like to submit?',
    choices: [{
      title: 'I have a url to the app archive',
      value: ArchiveFileSourceType.url
    }, {
      title: "I'd like to upload the app archive from my computer",
      value: ArchiveFileSourceType.path
    }, {
      title: 'The latest build from Expo servers',
      value: ArchiveFileSourceType.latest
    }, {
      title: 'A build identified by a build id',
      value: ArchiveFileSourceType.buildId
    }]
  });
  const sourceType = sourceTypeRaw;

  switch (sourceType) {
    case ArchiveFileSourceType.url:
      {
        const url = await askForArchiveUrlAsync();
        return getArchiveFileLocationAsync({
          sourceType: ArchiveFileSourceType.url,
          url,
          platform: source.platform,
          projectDir: source.projectDir
        });
      }

    case ArchiveFileSourceType.path:
      {
        const path = await askForArchivePathAsync();
        return getArchiveFileLocationAsync({
          sourceType: ArchiveFileSourceType.path,
          path,
          platform: source.platform,
          projectDir: source.projectDir
        });
      }

    case ArchiveFileSourceType.latest:
      {
        return getArchiveFileLocationAsync({
          sourceType: ArchiveFileSourceType.latest,
          platform: source.platform,
          projectDir: source.projectDir
        });
      }

    case ArchiveFileSourceType.buildId:
      {
        const id = await askForBuildIdAsync();
        return getArchiveFileLocationAsync({
          sourceType: ArchiveFileSourceType.buildId,
          id,
          platform: source.platform,
          projectDir: source.projectDir
        });
      }

    case ArchiveFileSourceType.prompt:
      throw new Error('This should never happen');
  }
}

async function askForArchiveUrlAsync() {
  const defaultArchiveUrl = 'https://url.to/your/archive.aab';
  const {
    url
  } = await (0, _prompts().default)({
    name: 'url',
    message: 'URL:',
    initial: defaultArchiveUrl,
    type: 'text',
    validate: url => {
      if (url === defaultArchiveUrl) {
        return 'That was just an example URL, meant to show you the format that we expect for the response.';
      } else if (!validateUrl(url)) {
        return `${url} does not conform to HTTP format`;
      } else {
        return true;
      }
    }
  });
  return url;
}

async function askForArchivePathAsync() {
  const defaultArchivePath = '/path/to/your/archive.aab';
  const {
    path
  } = await (0, _prompts().default)({
    name: 'path',
    message: 'Path to the app archive file (aab or apk):',
    initial: defaultArchivePath,
    type: 'text',
    validate: async path => {
      if (path === defaultArchivePath) {
        return 'That was just an example path, meant to show you the format that we expect for the response.';
      } else if (!(await (0, _validators().existingFile)(path, false))) {
        return `File ${path} doesn't exist.`;
      } else {
        return true;
      }
    }
  });
  return path;
}

async function askForBuildIdAsync() {
  const {
    id
  } = await (0, _prompts().default)({
    name: 'id',
    message: 'Build ID:',
    type: 'text',
    validate: val => {
      if (!(0, _isUUID().isUUID)(val)) {
        return `${val} is not a valid id`;
      } else {
        return true;
      }
    }
  });
  return id;
}

function validateUrl(url) {
  return _xdl().UrlUtils.isURL(url, {
    protocols: ['http', 'https']
  });
}
//# sourceMappingURL=ArchiveFileSource.js.map