module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['react-native-paper/babel', 'transform-remove-console'],
    },
  },
  plugins: [
    [
      require('@babel/plugin-proposal-decorators').default,
      {
        // Renamed upstream: the plugin now requires `version`, and rejects the
        // old `legacy: true` with "The decorators plugin requires a 'version'
        // option, whose value must be one of: '2023-11' or 'legacy'."
        version: 'legacy',
      },
    ],
    [
      'module-resolver',
      {
        root: ['./app'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      },
    ],
  ],
};
