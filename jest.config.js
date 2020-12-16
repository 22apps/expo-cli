module.exports = {
  projects: [
    require('./packages/babel-preset-cli/jest.config'),
    require('./packages/config/jest.config'),
    require('./packages/dev-server/jest.config'),
    require('./packages/dev-tools/jest.config'),
    require('./packages/expo-cli/jest.config'),
    require('./packages/expo-codemod/jest.config'),
    require('./packages/json-file/jest.config'),
    require('./packages/metro-config/jest.config'),
    require('./packages/package-manager/jest.config'),
    require('./packages/pkcs12/jest.config'),
    require('./packages/plist/jest.config'),
    require('./packages/pwa/jest.config'),
    require('./packages/schemer/jest.config'),
    require('./packages/uri-scheme/jest.config'),
    require('./packages/webpack-config/jest/unit-test-config'),
    require('./packages/xdl/jest/unit-test-config'),
  ],
  testPathIgnorePatterns: ['.*'],
};
