const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      process: require.resolve('process/browser'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
