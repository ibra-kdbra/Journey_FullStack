import tseslint from 'typescript-eslint'
import importHelpers from 'eslint-plugin-import-helpers'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

/**
 * Flat config. ESLint 10 does not read `.eslintrc.json` at all - it exits
 * with "couldn't find an eslint.config.* file" before linting anything - so
 * the old config had been dead since eslint 9 went in.
 *
 * The old config extended `airbnb-base`, which has no build for eslint 9 or
 * 10 and was the last reason this project needed `--legacy-peer-deps`
 * (issue #1289). Most of its `rules` block existed only to switch airbnb
 * rules back off - class-methods-use-this, import/prefer-default-export,
 * no-shadow, no-useless-constructor, no-empty-function,
 * lines-between-class-members. With airbnb gone none of those are on in the
 * first place, so the overrides are dropped rather than carried over.
 *
 * What survives is what the project actually chose: the I-prefix convention
 * for interfaces, the import grouping, and prettier as the last word on
 * formatting.
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'tmp/**', 'coverage/**', '*.js', 'eslint.config.mjs'],
  },
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['src/**/*.ts'],
    plugins: { 'import-helpers': importHelpers },
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    rules: {
      camelcase: 'off',
      'no-console': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: true },
        },
      ],
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: ['module', '/^@shared/', ['parent', 'sibling', 'index']],
          alphabetize: { order: 'asc', ignoreCase: true },
        },
      ],
    },
  },
)
