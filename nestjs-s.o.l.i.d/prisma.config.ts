import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/**
 * Prisma 7 removed `datasource.url` from schema.prisma, and no longer loads
 * `.env` implicitly — hence the explicit dotenv import.
 *
 * Migrate and introspect read the connection string from here. The runtime
 * client does not: it gets a driver adapter instead (see src/prisma.service.ts).
 * `process.env` rather than Prisma's `env()` helper because the helper throws
 * when the variable is unset, and `prisma generate` — which CI runs on every
 * build — does not need a database at all.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
