import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

/**
 * Flat config. ESLint 10 no longer reads `.eslintrc.js`, so the old config
 * could not load and `npm run lint` failed before linting anything.
 *
 * Same rule set as before, expressed flat: typescript-eslint's recommended
 * config, prettier last so it wins on formatting, and the four rules this
 * project turns off.
 */
export default tseslint.config(
  {
    // test/ is excluded by tsconfig.json, so type-aware rules cannot resolve it.
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'test/**', 'eslint.config.mjs'],
  },
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // This project demonstrates SOLID by showing interface shapes, so method
      // bodies are deliberately empty - `badSendSMS(notification: Notification)`
      // with a `// Logic to send SMS` comment is the lesson, not an oversight.
      // Unused *parameters* are therefore expected; unused variables and
      // imports are still real dead code and stay reported.
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    },
  },
)
