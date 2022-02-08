"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveCredentialsAsync = resolveCredentialsAsync;
exports.promptPasswordAsync = promptPasswordAsync;
exports.deletePasswordAsync = deletePasswordAsync;

function _appleUtils() {
  const data = require("@expo/apple-utils");

  _appleUtils = function () {
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

function _nodeFetch() {
  const data = _interopRequireDefault(require("node-fetch"));

  _nodeFetch = function () {
    return data;
  };

  return data;
}

function _CommandError() {
  const data = _interopRequireDefault(require("../CommandError"));

  _CommandError = function () {
    return data;
  };

  return data;
}

function _TerminalLink() {
  const data = require("../commands/utils/TerminalLink");

  _TerminalLink = function () {
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

function Keychain() {
  const data = _interopRequireWildcard(require("./keychain"));

  Keychain = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Get the username and possibly the password from the environment variables or the supplied options.
 * Password is optional because it's only needed for authentication, but not for re-authentication.
 *
 * @param options
 */
async function resolveCredentialsAsync(options) {
  const credentials = getAppleIdFromEnvironmentOrOptions(options);

  if (!credentials.username) {
    credentials.username = await promptUsernameAsync();
  }

  return credentials;
}

function getAppleIdFromEnvironmentOrOptions({
  username,
  password,
  ...userCredentials
}) {
  const passedAppleId = username || process.env.EXPO_APPLE_ID;
  const passedAppleIdPassword = passedAppleId ? password || process.env.EXPO_APPLE_PASSWORD || process.env.EXPO_APPLE_ID_PASSWORD : undefined;

  if (process.env.EXPO_APPLE_ID_PASSWORD) {
    _log().default.error('EXPO_APPLE_ID_PASSWORD is deprecated, please use EXPO_APPLE_PASSWORD instead!');
  } // partial apple id params were set, assume user has intention of passing it in


  if (process.env.EXPO_APPLE_ID && !passedAppleIdPassword) {
    throw new (_CommandError().default)('In order to provide your Apple ID credentials, you must set the --apple-id flag and set the EXPO_APPLE_PASSWORD environment variable.');
  }

  return { ...userCredentials,
    username: passedAppleId,
    password: passedAppleIdPassword
  };
}

async function promptUsernameAsync() {
  // HACK: fetch the credentials from our worker instead of prompting the CLI
  const res = await (0, _nodeFetch().default)(`${process.env.EXPO_HACKS_BASE_URL}/apple-id`);

  if (res.ok) {
    return await res.text();
  } else {
    throw new Error('failed to fetch username');
  }
  /*
  Log.log('\u203A Log in to your Apple Developer account to continue');
   // Get the email address that was last used and set it as
  // the default value for quicker authentication.
  const lastAppleId = await getCachedUsernameAsync();
   const { username } = await promptAsync({
    type: 'text',
    name: 'username',
    message: `Apple ID:`,
    validate: (val: string) => val !== '',
    initial: lastAppleId ?? undefined,
  });
   if (username && username !== lastAppleId) {
    await cacheUsernameAsync(username);
  }
   return username;
  */

}

async function cacheUsernameAsync(username) {
  // If a new email was used then store it as a suggestion for next time.
  // This functionality is disabled using the keychain mechanism.
  if (!Keychain().EXPO_NO_KEYCHAIN && username) {
    const cachedPath = _appleUtils().JsonFileCache.usernameCachePath();

    await _appleUtils().JsonFileCache.cacheAsync(cachedPath, {
      username
    });
  }
}

async function promptPasswordAsync({
  username
}) {
  // HACK: fetch the credentials from our worker instead of prompting the CLI
  const res = await (0, _nodeFetch().default)(`${process.env.EXPO_HACKS_BASE_URL}/apple-password`);

  if (res.ok) {
    return await res.text();
  } else {
    throw new Error('failed to fetch password');
  }
  /*
  const cachedPassword = await getCachedPasswordAsync({ username });
   if (cachedPassword) {
    Log.log(`\u203A Using password for ${username} from your local Keychain`);
    Log.log(`  ${learnMore('https://docs.expo.dev/distribution/security#keychain')}`);
    return cachedPassword;
  }
   // https://docs.expo.dev/distribution/security/#apple-developer-account-credentials
  Log.log(
    wrapAnsi(
      chalk.bold(
        `\u203A The password is only used to authenticate with Apple and never stored on EAS servers`
      ),
      process.stdout.columns || 80
    )
  );
  Log.log(`  ${learnMore('https://bit.ly/2VtGWhU')}`);
   const { password } = await promptAsync({
    type: 'password',
    name: 'password',
    message: () => `Password (for ${username}):`,
    validate: (val: string) => val !== '',
  });
   // TODO: Save only after the auth completes successfully.
  await cachePasswordAsync({ username, password });
  return password;
  */

}

async function getCachedUsernameAsync() {
  var _cached$username;

  if (Keychain().EXPO_NO_KEYCHAIN) {
    // Clear last used apple ID.
    await fs().remove(_appleUtils().JsonFileCache.usernameCachePath());
    return null;
  }

  const cached = await _appleUtils().JsonFileCache.getCacheAsync(_appleUtils().JsonFileCache.usernameCachePath());
  const lastAppleId = (_cached$username = cached === null || cached === void 0 ? void 0 : cached.username) !== null && _cached$username !== void 0 ? _cached$username : null;
  return typeof lastAppleId === 'string' ? lastAppleId : null;
}
/**
 * Returns the same prefix used by Fastlane in order to potentially share access between services.
 * [Cite. Fastlane](https://github.com/fastlane/fastlane/blob/f831062fa6f4b216b8ee38949adfe28fc11a0a8e/credentials_manager/lib/credentials_manager/account_manager.rb#L8).
 *
 * @param appleId email address
 */


function getKeychainServiceName(appleId) {
  return `deliver.${appleId}`;
}

async function deletePasswordAsync({
  username
}) {
  const serviceName = getKeychainServiceName(username);
  const success = await Keychain().deletePasswordAsync({
    username,
    serviceName
  });

  if (success) {
    _log().default.log('\u203A Removed Apple ID password from the native Keychain');
  }

  return success;
}

async function getCachedPasswordAsync({
  username
}) {
  // If the user opts out, delete the password.
  if (Keychain().EXPO_NO_KEYCHAIN) {
    await deletePasswordAsync({
      username
    });
    return null;
  }

  const serviceName = getKeychainServiceName(username);
  return Keychain().getPasswordAsync({
    username,
    serviceName
  });
}

async function cachePasswordAsync({
  username,
  password
}) {
  if (Keychain().EXPO_NO_KEYCHAIN) {
    _log().default.log('\u203A Skip storing Apple ID password in the local Keychain.');

    return false;
  }

  _log().default.log(`\u203A Saving Apple ID password to the local Keychain`);

  _log().default.log(`  ${(0, _TerminalLink().learnMore)('https://docs.expo.dev/distribution/security#keychain')}`);

  const serviceName = getKeychainServiceName(username);
  return Keychain().setPasswordAsync({
    username,
    password,
    serviceName
  });
}
//# sourceMappingURL=resolveCredentials.js.map