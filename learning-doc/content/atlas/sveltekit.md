---
title: SvelteKit Platform Starter
description: Auth, teams and object storage against edge-hosted SQLite — the most operationally complete frontend here.
project: sveltekit
track: edge-runtime
stack: [Svelte 5, Drizzle, Turso, Cloudflare R2]
status: in-progress
compare: [next-prisma-starter, Hono-Postgres]
---

Every other frontend project here stops at "renders and fetches". This one has
sessions, OAuth, team membership, and file uploads — which is where architectural
choices start costing something.

## What problem shape is this for?

A real multi-tenant product: users belong to teams, teams own resources,
resources include files, and none of it may leak across tenants.

## The layer map

```
src/lib/
  server/          the only code with database or secret access
    oauth.ts       provider configuration
  db/              Drizzle schema and client
  validations/     Zod schemas, shared by client and server
  components/  hooks/  utils/
src/routes/
  (auth)/          login, callback, session establishment
  (dashboard)/     authenticated surface, including teams
  api/
```

SvelteKit's `$lib/server` convention is the enforcement mechanism worth noting:
importing it from client code is a **build error**, not a code review comment.
That is a stronger boundary than any of the other frontend projects have.

## The idea it demonstrates most clearly

**A boundary the compiler enforces beats a boundary you agree to.** Most layering
in this repository is convention — nothing stops a Vue component importing a
repository implementation directly. Here the framework refuses.

The second idea is **validation as a shared contract**: the Zod schemas in
`validations/` are used by the form on the client and the handler on the server,
so the two cannot disagree. `superForm` binds them to the form state, which is
why the dashboard has no hand-written validation logic.

Turso and R2 make the third point: at the edge, "the database" is a
region-replicated SQLite file and "the filesystem" is an object store. Both are
reached through Drizzle and an S3-compatible client, so the application code does
not encode either assumption.

## What it deliberately does not do

- No billing, no admin panel. Auth and tenancy are the subject.
- No server-side state. Sessions live in the database, not in process memory,
  because edge deployments have no sticky process to keep them in.

## Current status

Marked `in-progress`: `arctic@3` no longer exports `Google` from the package
root, so `src/lib/server/oauth.ts` needs migrating to the current provider API
before the project builds. Install and lint pass; `build` is disabled in the CI
manifest with that reason recorded rather than silently skipped.

## Running it

```bash
cd sveltekit
npm install
npm run db:push
npm run dev
npm run check        # svelte-check
```

## Read alongside

- [`next-prisma-starter`](/atlas/next-prisma-starter) — the same full-stack shape on Node and Postgres.
- [`Hono-Postgres`](/atlas/hono-postgres) — the API half, without a frontend attached.
