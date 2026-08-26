---
title: SvelteKit Platform Starter
description: Auth, teams and object storage against edge-hosted SQLite — the most operationally complete frontend here.
project: sveltekit
track: edge-runtime
stack: [Svelte 5, Drizzle, Turso, Cloudflare R2]
status: reference
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

Install and build pass in CI. `lint` stays off: `npm run lint` exits 1 with
Prettier style issues in 115 files, which is a formatting sweep, not a
dependency problem, and belongs in its own change.

`build` was disabled here for a long time under a diagnosis that turned out to
be wrong — the note said `arctic@3` had stopped exporting `Google` from its
package root. It had not; `Google` is one of 74 root exports in 3.7.0, and every
call the app makes matches the v3 API. The real failure was that
`$env/static/private` inlines secrets at build time, so the build needs every
name in `.env.example` to be *present*, not correct. CI declares placeholders in
`.github/projects.json` and the build passes unchanged.

The lesson is the one this repository keeps relearning: a plausible reading of
an error is not a diagnosis. `npm run build` said
`"GOOGLE_CLIENT_ID" is not exported by "virtual:env/static/private"`, which
names the real cause and no part of arctic.

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
