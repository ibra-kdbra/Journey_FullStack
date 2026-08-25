import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

/**
 * Flat config. ESLint 10 removed `.eslintrc` support along with the `--ext` and
 * `--ignore-path` flags the old lint script passed, so both moved here.
 */
export default defineConfigWithVueTs(
  {
    name: 'app/files',
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
  },
  {
    name: 'app/ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'],
  },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,
)
