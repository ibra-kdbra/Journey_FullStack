import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

/**
 * Flat config. ESLint 10 removed `.eslintrc` support along with the `--ext` and
 * `--ignore-path` flags the old lint script passed — that script could not run
 * at all, failing with `Invalid option '--ignore-path'` before it linted a
 * single file. Both concerns move here.
 *
 * Plain JavaScript, unlike `vue3-clean-architecture`, so no TypeScript layer.
 */
export default [
  {
    name: 'app/files',
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      // Browser globals: this is a Vite SPA, so localStorage, alert and console
      // are ambient. Without declaring them, `eslint:recommended`'s no-undef
      // flags every use.
      globals: globals.browser,
    },
  },
  {
    name: 'app/ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
]
