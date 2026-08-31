import { createRequire } from 'node:module'
import path from 'node:path'
import { FlatCompat } from '@eslint/eslintrc'

/**
 * Flat config. ESLint 10 no longer reads `.eslintrc.js`, so the old config
 * could not load and `npm run lint` failed before linting anything.
 *
 * @react-native/eslint-config 0.87 is still an eslintrc-style object, so
 * FlatCompat translates it rather than us restating its rule set. Two things
 * that translation needs, neither of them obvious:
 *
 *   * `@eslint/eslintrc` is a direct dependency now. ESLint 9 pulled it in
 *     transitively; ESLint 10 does not, so the import above resolved to
 *     nothing and the run died with ERR_MODULE_NOT_FOUND before reading any
 *     config at all.
 *   * `resolvePluginsRelativeTo` points plugin resolution at the config
 *     package rather than at this project. eslintrc-style `extends` looks for
 *     plugins from the project root, but eslint-plugin-react and its siblings
 *     are dependencies *of* @react-native/eslint-config, so without this the
 *     run fails with "ESLint couldn't find the plugin eslint-plugin-react".
 *     Resolving the package's `package.json` would be the obvious way to find
 *     that directory and does not work - its `exports` map does not expose
 *     `./package.json` - so resolve the entry point and take its dirname.
 *
 * `lint` still stays disabled in .github/projects.json, but for exactly one
 * remaining reason and it is not ours: typescript-eslint 8 refuses to run
 * against TypeScript 7 outright ("typescript-eslint does not support TS 7.0"),
 * and this project is on typescript 7.0.2. Tracked upstream at
 * https://github.com/typescript-eslint/typescript-eslint/issues/10940 and in
 * issue #1430. The check flips the day that lands; nothing here needs to
 * change for it.
 */
const require = createRequire(import.meta.url)
const rnConfigDir = path.dirname(require.resolve('@react-native/eslint-config'))

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  resolvePluginsRelativeTo: rnConfigDir,
})

export default [
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', 'coverage/**', 'eslint.config.mjs'],
  },
  ...compat.extends('@react-native'),
]
