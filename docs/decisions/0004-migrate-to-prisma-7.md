# 0004 — Migrate to Prisma 7 with driver adapters

**Status:** accepted
**Date:** 2026-08-25

## Context

Prisma was held at `^6` in `nestjs-s.o.l.i.d` and `next-prisma-starter`. Four
Dependabot pull requests proposing Prisma 7 sat open and red, failing at
`prisma generate` with:

```
The datasource property `url` is no longer supported in schema files.
```

Prisma 7 makes three changes that a version bump alone cannot satisfy:

1. `datasource.url` is removed from `schema.prisma`. Migrate and introspect read
   the connection string from a `prisma.config.ts` instead.
2. The runtime client no longer reads that URL at all. It requires a **driver
   adapter** — `@prisma/adapter-better-sqlite3`, `@prisma/adapter-pg` — passed to
   the `PrismaClient` constructor.
3. `.env` is no longer loaded implicitly. Config that needs it must import
   `dotenv/config` itself.

The hold was correct: this is a code migration wearing a dependency bump's
clothing. Merging any of those four PRs would have broken both projects.

## Decision

Do the migration deliberately, in one reviewed change, rather than merging the
Dependabot PRs.

- `schema.prisma` loses its `url` line in both projects.
- Each project gains a `prisma.config.ts` that imports `dotenv/config` and reads
  `process.env.DATABASE_URL`.
- `PrismaService` (Nest) and `src/utils/client.ts` (Next) construct their client
  with a driver adapter.

Two details are load-bearing:

**`process.env.DATABASE_URL`, not Prisma's `env()` helper.** The helper throws
when the variable is unset. Both projects run `prisma generate` in `prebuild`, and
CI has no database — so the helper would fail every CI build. Generate does not
need a connection string; only Migrate does.

**The SQLite path changed meaning.** Prisma 6 resolved a relative SQLite URL
against the *schema* directory. A driver adapter resolves it against the process
CWD. `file:./dev.db` therefore silently opened a new, empty database at the
project root while the real tables sat in `prisma/dev.db`. `nestjs-s.o.l.i.d/.env`
now says `file:./prisma/dev.db`.

That last one is the reason this needed runtime verification and not just a green
build. The build passed *before* the path was corrected.

## Alternatives considered

**Stay on Prisma 6 indefinitely.** Rejected: the hold had no clearing condition
being worked toward, so it would have become permanent by default — the failure
mode [#1296](https://github.com/ibra-kdbra/Journey_FullStack/issues/1296) exists
to prevent.

**Merge the Dependabot PRs and fix forward.** Rejected: four PRs across two
projects, each red, each needing the same migration. Fixing forward means four
broken intermediate commits on `main`.

**Use Prisma Accelerate (`accelerateUrl`) instead of adapters.** Rejected: it
introduces a hosted dependency for two local demo projects.

## Consequences

**What this buys.** Both projects run current Prisma. Four red PRs close. The
datasource is now a runtime concern rather than a schema constant, so swapping
engines is a change to one constructor. The `prisma` hold in
[`docs/DEPENDENCIES.md`](../DEPENDENCIES.md) is retired.

**What it costs.** Two more dependencies per project (the adapter and its driver).
`prisma.config.ts` is a new file to keep in sync. And the CWD-relative SQLite path
is a sharp edge that will bite anyone who runs the Nest project from a
subdirectory — hence the comment in `.env`.

**Still held:** `typescript` at `^6`. That one is genuinely blocked upstream —
`@angular/compiler-cli@22.1.3` and `typescript-eslint@8.68.0` both cap TypeScript
below 6.1 on their latest releases, so TS 7 cannot even install.
