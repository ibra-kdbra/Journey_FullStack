module.exports = {
  // React Native 0.87 no longer ships jest-preset.js at its package root; the
  // preset was extracted to @react-native/jest-preset. Without this, jest dies
  // with 'Module react-native should have "jest-preset.js" ... at the root'.
  preset: '@react-native/jest-preset',

  // inversify now ships ESM (`export {…}` in lib/index.js) and jest does not
  // transform node_modules by default, so it reaches the runtime as raw ESM and
  // throws "SyntaxError: Unexpected token 'export'". React Native's own
  // packages need the same treatment for the same reason.
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-navigation|inversify|@inversifyjs)/)',
  ],
};
