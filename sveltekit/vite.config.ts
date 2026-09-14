import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  test: {
    projects: [
      {
        extends: './vite.config.ts',
        plugins: [svelteTesting()],
        test: {
          name: 'client',
          environment: 'jsdom',
          clearMocks: true,
          include: ['tests/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**'],
          setupFiles: ['./vitest-setup-client.ts']
        }
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
          // Component specs live under tests/components/ and belong to the
          // client project. This exclude used to read src/**, which matched
          // nothing - no spec has ever lived there - so a *.svelte.test.ts
          // dropped into tests/unit/ would have been run in the node
          // environment, with no DOM, and failed for the wrong reason.
          exclude: ['tests/**/*.svelte.{test,spec}.{js,ts}']
        }
      }
    ]
  }
});
