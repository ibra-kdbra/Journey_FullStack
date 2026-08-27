import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    include: [
      '**/__tests__/unit/**/*.{test,spec}.ts',
      '**/__tests__/**/*.unit.{test,spec}.ts',
      '**/__tests__/integration/**/*.{test,spec}.ts',
      // Without this, layers/newsletter/__tests__/component/ matched no pattern
      // and its suite never ran - the one test directory nothing executed.
      '**/__tests__/component/**/*.{test,spec}.ts',
    ],
    name: 'unit',
    environment: 'node',
  },
})
