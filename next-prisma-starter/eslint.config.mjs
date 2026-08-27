import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

/**
 * Flat config. Two things forced this:
 *
 *   - `next lint` was removed in Next 16, so the old script was parsed as
 *     `next <dir>` and died with
 *     "Invalid project directory provided, no such directory: …/lint".
 *   - ESLint 10 no longer reads `.eslintrc.json`.
 *
 * eslint-config-next 16 already exports a flat config array, so it is imported
 * directly. Routing it through @eslint/eslintrc's FlatCompat — the usual advice
 * for eslintrc-era shareable configs — fails here with
 * "Converting circular structure to JSON" on the bundled react plugin, because
 * it is translating something that needs no translation.
 */
export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'prisma/generated/**'],
  },
  ...nextCoreWebVitals,
]
