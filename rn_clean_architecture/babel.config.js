module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['react-native-paper/babel', 'transform-remove-console'],
    },
  },
  plugins: [
    // Must come before the decorators plugin. Babel's decorator support covers
    // class, method and field decorators but not TypeScript *parameter*
    // decorators, which is what constructor injection is made of. Without this,
    // `constructor(@inject(TYPES.X) private x: X)` is silently dropped and
    // inversify resolves undefined.
    'babel-plugin-transform-typescript-metadata',
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
