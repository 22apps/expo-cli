"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.actionAsync = actionAsync;

function _chalk() {
  const data = _interopRequireDefault(require("chalk"));

  _chalk = function () {
    return data;
  };

  return data;
}

function fs() {
  const data = _interopRequireWildcard(require("fs-extra"));

  fs = function () {
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

function _CommandError() {
  const data = _interopRequireDefault(require("../../CommandError"));

  _CommandError = function () {
    return data;
  };

  return data;
}

function _context() {
  const data = require("../../credentials/context");

  _context = function () {
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

function _getOrPromptApplicationId() {
  const data = require("../utils/getOrPromptApplicationId");

  _getOrPromptApplicationId = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function actionAsync(projectRoot) {
  const inProjectDir = filename => path().resolve(projectRoot, filename);

  const bundleIdentifier = await (0, _getOrPromptApplicationId().getOrPromptForBundleIdentifier)(projectRoot);

  try {
    var _appCredentials$crede;

    const ctx = new (_context().Context)();
    await ctx.init(projectRoot);
    const app = {
      accountName: ctx.projectOwner,
      projectName: ctx.manifest.slug,
      bundleIdentifier
    };

    _log().default.log(`Retrieving iOS credentials for @${app.accountName}/${app.projectName} (${bundleIdentifier})`);

    const appCredentials = await ctx.ios.getAppCredentials(app);
    const pushCredentials = await ctx.ios.getPushKey(app);
    const distCredentials = await ctx.ios.getDistCert(app);
    const {
      certP12,
      certPassword,
      certPrivateSigningKey
    } = distCredentials !== null && distCredentials !== void 0 ? distCredentials : {};
    const {
      apnsKeyId,
      apnsKeyP8
    } = pushCredentials !== null && pushCredentials !== void 0 ? pushCredentials : {};
    const {
      pushP12,
      pushPassword,
      provisioningProfile,
      teamId
    } = (_appCredentials$crede = appCredentials === null || appCredentials === void 0 ? void 0 : appCredentials.credentials) !== null && _appCredentials$crede !== void 0 ? _appCredentials$crede : {};

    if (teamId !== undefined) {
      _log().default.log(`These credentials are associated with Apple Team ID: ${teamId}`);
    }

    if (certP12) {
      const distPath = inProjectDir(`${app.projectName}_dist.p12`);
      await fs().writeFile(distPath, Buffer.from(certP12, 'base64'));
    }

    if (certPrivateSigningKey) {
      const distPrivateKeyPath = inProjectDir(`${app.projectName}_dist_cert_private.key`);
      await fs().writeFile(distPrivateKeyPath, certPrivateSigningKey);
    }

    if (certP12 || certPrivateSigningKey) {
      _log().default.log('Wrote distribution cert credentials to disk.');
    }

    if (apnsKeyP8) {
      const apnsKeyP8Path = inProjectDir(`${app.projectName}_apns_key.p8`);
      await fs().writeFile(apnsKeyP8Path, apnsKeyP8);

      _log().default.log('Wrote push key credentials to disk.');
    }

    if (pushP12) {
      const pushPath = inProjectDir(`${app.projectName}_push.p12`);
      await fs().writeFile(pushPath, Buffer.from(pushP12, 'base64'));
    }

    if (pushP12) {
      _log().default.log('Wrote push cert credentials to disk.');
    }

    if (provisioningProfile) {
      const provisioningProfilePath = path().resolve(projectRoot, `${app.projectName}.mobileprovision`);
      await fs().writeFile(provisioningProfilePath, Buffer.from(provisioningProfile, 'base64'));

      _log().default.log('Wrote provisioning profile to disk');
    }

    _log().default.log(`Save these important values as well:

Distribution P12 password: ${certPassword ? _chalk().default.bold(certPassword) : _chalk().default.yellow('(not available)')}
Push Key ID:               ${apnsKeyId ? _chalk().default.bold(apnsKeyId) : _chalk().default.yellow('(not available)')}
Push P12 password:         ${pushPassword ? _chalk().default.bold(pushPassword) : _chalk().default.yellow('(not available)')}
`);
  } catch (e) {
    throw new (_CommandError().default)('Unable to fetch credentials for this project. Are you sure they exist?');
  }

  _log().default.log('All done!');
}
//# sourceMappingURL=fetchIosCertsAsync.js.map