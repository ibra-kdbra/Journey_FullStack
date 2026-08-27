import { FlatCompat } from '@eslint/eslintrc'

/**
 * Flat config. ESLint 10 no longer reads `.eslintrc.js`, so the old config
 * could not load and `npm run lint` failed before linting anything.
 *
 * @react-native/eslint-config 0.87 is still an eslintrc-style object, so
 * FlatCompat translates it rather than us restating its rule set.
 *
 * This is correct but not yet sufficient: the config bundles a typescript-eslint
 * whose parser does not implement the SourceCode API ESLint 10 expects, so the
 * run dies with "scopeManager.addGlobals is not a function". `lint` therefore
 * stays disabled in .github/projects.json until React Native ships a config
 * that supports ESLint 10.
 */
const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default [
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', 'coverage/**', 'eslint.config.mjs'],
  },
  ...compat.extends('@react-native'),
]
