---
title: Next.js + Prisma Starter
description: Full-stack Next.js where the data layer is generated, which puts pressure on where the domain boundary sits.
project: next-prisma-starter
track: clean-architecture
stack: [Next.js 16, Prisma, Redux Toolkit, Tailwind v4]
status: reference
compare: [nuxt-clean-architecture, sveltekit]
---

Useful for one specific tension: Prisma generates a fully typed client from your
schema, and that client is *so* convenient that it quietly becomes your domain
model.

## What problem shape is this for?

A full-stack application where the same codebase owns the schema, the API, and
the UI — and where the temptation to let the database shape drive everything is
strongest.

## The layer map

```
src/
  pages/          routes
  pages/api/      API handlers
  redux/
    api/          RTK Query endpoints
    features/     slices
  hooks/  config/  utils/  types/  styles/
prisma/
  schema.prisma   seed.ts
```

Compare this with [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture),
which puts a repository interface between the framework and the data source. This
project does not — and reading them together is the clearest illustration in the
repository of what that interface is actually for.

## The idea it demonstrates most clearly

**A generated type is not a domain model.** `PrismaClient` gives you `User` for
free, so every layer ends up importing it, and now a column rename is a
whole-application refactor. RTK Query's `api/` slice is the closest thing here to
a boundary: it is the one place that knows the wire shape.

The honest reading of this project is that it shows the *default* — what you get
when you follow each tool's happy path. That has real value as a baseline. The
layered projects are arguments against this default; you cannot evaluate the
argument without seeing what it is arguing against.

## What it deliberately does not do

- No repository layer. See above — that absence is the point of comparison.
- No auth. Sessions would need a boundary decision this starter does not make.

## Running it

```bash
cd next-prisma-starter
npm install
npm run build         # `prebuild` runs `prisma generate`
npm run push          # push the schema to your database
npm run seed
npm run dev
```

## Notes from the last repair pass

Three separate breakages, all from unverified major bumps: the `tsconfig.json`
carried `target: ES5`, `moduleResolution: node10`, and `baseUrl`, all removed in
TypeScript 7; Tailwind v4 was installed against a v3 PostCSS config; and
`faker.internet.avatar()` no longer exists. The Tailwind config's two custom
gradients now live in `globals.css` as v4 `@utility` rules. Prisma is held at `^6`
pending the driver-adapter migration.

## Read alongside

- [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) — the same job, with the boundary drawn.
- [`sveltekit`](/atlas/sveltekit) — the same job, with the boundary compiler-enforced.
