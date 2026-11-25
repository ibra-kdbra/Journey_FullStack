const fs = require('fs');
const path = require('path');

// Load untracked local settings (see .env.example) so `PIXABAY_API_KEY` can live
// in a git-ignored .env file. Variables already set in the shell win.
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
  plugins: [
    // Must come before the decorators plugin. Babel's decorator support covers
    // class, method and field decorators but not TypeScript *parameter*
    // decorators, which is what constructor injection is made of. Without this,
    // `constructor(@inject(TYPES.X) private x: X)` is silently dropped and
    // inversify resolves undefined.
    // Inlines the listed variables at bundle time. React Native has no runtime
    // process.env, so this is how a build-time setting reaches the app. Run
    // `npx react-native start --reset-cache` after changing the value.
    [
      'transform-inline-environment-variables',
      {include: ['PIXABAY_API_KEY']},
    ],
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
