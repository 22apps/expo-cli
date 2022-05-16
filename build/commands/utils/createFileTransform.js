"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEntryResolver = createEntryResolver;
exports.createFileTransform = createFileTransform;

function _configPlugins() {
  const data = require("@expo/config-plugins");

  _configPlugins = function () {
    return data;
  };

  return data;
}

function _minipass() {
  const data = _interopRequireDefault(require("minipass"));

  _minipass = function () {
    return data;
  };

  return data;
}

function path() {
  const data = _interopRequireWildcard(require("path"));

  path = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function escapeXMLCharacters(original) {
  const noAmps = original.replace('&', '&amp;');
  const noLt = noAmps.replace('<', '&lt;');
  const noGt = noLt.replace('>', '&gt;');
  const noApos = noGt.replace('"', '\\"');
  return noApos.replace("'", "\\'");
}

class Transformer extends _minipass().default {
  constructor(settings) {
    super();
    this.settings = settings;

    _defineProperty(this, "data", '');
  }

  write(data) {
    this.data += data;
    return true;
  }

  getNormalizedName() {
    if (['.xml', '.plist'].includes(this.settings.extension)) {
      return escapeXMLCharacters(this.settings.name);
    }

    return this.settings.name;
  }

  end() {
    const name = this.getNormalizedName();
    const replaced = this.data.replace(/Hello App Display Name/g, name).replace(/HelloWorld/g, _configPlugins().IOSConfig.XcodeUtils.sanitizedName(name)).replace(/helloworld/g, _configPlugins().IOSConfig.XcodeUtils.sanitizedName(name.toLowerCase()));
    super.write(replaced);
    return super.end();
  }

}

function createEntryResolver(name) {
  return entry => {
    if (name) {
      // Rewrite paths for bare workflow
      entry.path = entry.path.replace(/HelloWorld/g, entry.path.includes('android') ? _configPlugins().IOSConfig.XcodeUtils.sanitizedName(name.toLowerCase()) : _configPlugins().IOSConfig.XcodeUtils.sanitizedName(name)).replace(/helloworld/g, _configPlugins().IOSConfig.XcodeUtils.sanitizedName(name).toLowerCase());
    }

    if (entry.type && /^file$/i.test(entry.type) && path().basename(entry.path) === 'gitignore') {
      // Rename `gitignore` because npm ignores files named `.gitignore` when publishing.
      // See: https://github.com/npm/npm/issues/1862
      entry.path = entry.path.replace(/gitignore$/, '.gitignore');
    }
  };
}

function createFileTransform(name) {
  return entry => {
    const extension = path().extname(entry.path); // Binary files, don't process these (avoid decoding as utf8)

    if (!['.png', '.jpg', '.jpeg', '.gif', '.webp', '.psd', '.tiff', '.svg', '.jar', '.keystore'].includes(extension) && name) {
      return new Transformer({
        name,
        extension
      });
    }

    return undefined;
  };
}
//# sourceMappingURL=createFileTransform.js.map