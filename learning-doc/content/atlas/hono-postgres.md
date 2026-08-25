---
title: Hono + Postgres
description: A minimal API on a runtime that executes TypeScript directly, so there is no build step hiding the structure.
project: Hono-Postgres
track: edge-runtime
stack: [Hono, Bun, Drizzle, Biome]
status: reference
compare: [sveltekit, nodejs-s.o.l.i.d]
---

The smallest complete API here, and the most useful control for a specific
question: how much of a "layered backend" is essential, and how much is Express
ceremony you have stopped noticing?

## What problem shape is this for?

An API that has to start fast and stay small — edge functions, sidecars, internal
services where a 200ms cold start is not acceptable.

## The layer map

Organised by **feature**, with the cross-cutting pieces at the top:

```
src/
  todos/          the entire feature: routes, handlers, queries
  schemas/        Drizzle table definitions
  middlewares/
  config/  constants/  types/
  app/            composition root
```

`todos/` holding routes, handlers, and queries together is the interesting
choice. In [`nodejs-s.o.l.i.d`](/atlas/nodejs-solid) those live in three separate
directories. At this size, colocation wins: everything that changes together is
in one place. The honest caveat is that this stops being true somewhere around
the fifth feature, and this project has one.

## The idea it demonstrates most clearly

**No build step, so nothing hides.** Bun runs TypeScript directly, which means
the file you read is the file that executes — no transpilation, no bundler
config, no source maps. Every abstraction has to justify itself on readability
alone, because none of them are buying you compatibility.

Drizzle reinforces the same point: the schema in `schemas/` *is* the type. There
is no generation step and no separate model layer, so the database shape and the
TypeScript type cannot drift.

## What it deliberately does not do

- No repository interfaces. Handlers call Drizzle directly. That is a deliberate
  contrast with the SOLID projects, not an oversight — it is what "as small as
  the problem needs" looks like.
- No auth. Middleware exists; the policy does not.

## Running it

```bash
cd Hono-Postgres
bun install
bun run db:generate && bun run db:push
bun run dev
bun run lint        # Biome
bun test
```

## Notes from the last repair pass

The committed `bun.lock` had drifted from `package.json`, so
`bun install --frozen-lockfile` — what CI runs — failed. The lockfile has been
regenerated. It is the only committed lockfile in the repository; the Node
projects still install unpinned.

## Read alongside

- [`nodejs-s.o.l.i.d`](/atlas/nodejs-solid) — the maximal treatment of the same job.
- [`sveltekit`](/atlas/sveltekit) — the same edge assumptions with a UI attached.
