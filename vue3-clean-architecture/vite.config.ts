import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // The unit-test setup lives here rather than on the `vitest` command line.
  // Passing `--root src/` used to work only because Vitest 4 walked up out of
  // that root to find this file; Vitest 5 resolves the config from the root it
  // is given, so `src/` had no config, no `@` alias, and every spec importing
  // `@/...` failed to resolve. Scoping via `include` keeps the project root —
  // and therefore this alias — intact.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
})
