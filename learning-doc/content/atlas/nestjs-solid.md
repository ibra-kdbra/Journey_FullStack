---
title: NestJS SOLID & Clean Architecture
description: Modules named after the principle each one demonstrates, on a framework where inversion is the default.
project: nestjs-s.o.l.i.d
track: clean-architecture
stack: [NestJS, Prisma, PostgreSQL, TypeScript]
status: reference
compare: [nodejs-s.o.l.i.d, API_s.o.l.i.d_TS]
---

The counterpart to [`nodejs-s.o.l.i.d`](/atlas/nodejs-solid): the same five
principles, but on a framework whose DI container makes several of them the path
of least resistance rather than a deliberate choice.

## What problem shape is this for?

An enterprise API where module boundaries need to be explicit and enforceable,
and where you want the framework to hold the wiring so you can spend your
attention on the domain.

## The layer map

Unusually, this project organises by *principle* rather than by layer — each
top-level module is a worked example, with a real feature inside it:

```
src/modules/
  SRP/    orders/  products/  emails/     one reason to change, per service
  OCP/    orders/  payment/               extension without modification
  LSP/    orders/  pricing/               subtypes that honour the contract
  ISP/    notifications/                  narrow contracts over fat ones
  DIP/    storage/                        depend on abstractions
src/
  prisma.service.ts   prisma.module.ts
```

That layout is a teaching decision, not a production one. In a real service these
would be feature modules and the principles would be invisible. Here they are the
subject.

## The idea it demonstrates most clearly

**`DIP/storage/` — that dependency inversion is about *who owns the interface*.**
The module declares a storage contract; `storage-s3-fetcher.service.ts` satisfies
it. Nest's provider tokens mean the consuming service never names the
implementation, and swapping S3 for local disk touches one module registration.

`ISP/notifications/` is the sharpest contrast with the Express version: Nest's
custom providers make several narrow interfaces cheap, where hand-wiring them in
Express costs enough boilerplate that people reach for one fat interface instead.
That cost difference *is* the finding.

## What it deliberately does not do

- No CQRS, no event sourcing. Nest supports both; both would bury the principles.
- No auth module. Adding one would double the surface without adding a principle.

## Running it

```bash
cd nestjs-s.o.l.i.d
npm install
npm run build          # `prebuild` runs `prisma generate` first
npm run start:dev
npm test
```

`@prisma/client` has no types until `prisma generate` has run, which is why
generation is a `prebuild` script rather than a step in a README nobody reads.

## Notes from the last repair pass

TypeScript is held at `^6`: the Nest CLI needs the programmatic compiler API that
TypeScript 7.0 removed. Prisma is held at `^6`: Prisma 7 moves the datasource
`url` out of `schema.prisma` and requires a driver adapter, which is a runtime
migration rather than a version bump. Both holds have clearing conditions
recorded in the repository's engineering notes.

## Read alongside

- [`nodejs-s.o.l.i.d`](/atlas/nodejs-solid) — the same principles, no container.
- [`angular-s.o.l.i.d-advanced`](/atlas/angular-solid) — the same DI philosophy on the client.
