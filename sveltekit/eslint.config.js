import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: { 'no-undef': 'off' }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    }
  },
  {
    // Email templates render to MJML for a mail client, not to the SvelteKit
    // router. Their hrefs are absolute URLs built from PUBLIC_BASE_URL, so
    // resolve() - which prefixes the app's base path - would corrupt them.
    files: ['src/lib/utils/mail/templates/**/*.svelte'],
    rules: { 'svelte/no-navigation-without-resolve': 'off' }
  },
  {
    ignores: ['*.env', 'node_modules/', 'build/', '.svelte-kit/', 'src/lib/components/ui/**']
  }
);
