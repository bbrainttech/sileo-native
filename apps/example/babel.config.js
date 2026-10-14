const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');

const library = path.resolve(__dirname, '../../packages/sileo-native');
const pkg = require(path.join(library, 'package.json'));

module.exports = function (api) {
  api.cache(true);

  return getConfig(
    {
      presets: ['babel-preset-expo'],
    },
    { root: library, pkg }
  );
};
