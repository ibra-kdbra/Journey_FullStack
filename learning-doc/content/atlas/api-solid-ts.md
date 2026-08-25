---
title: Car Rental API
description: Feature modules with dtos, repositories, use cases and infra — over a domain with real business rules.
project: API_s.o.l.i.d_TS
track: solid
stack: [Node.js, TypeORM, Tsyringe, TypeScript]
status: reference
compare: [nodejs-s.o.l.i.d, nestjs-s.o.l.i.d]
---

The only project here whose domain has rules worth arguing about — a car cannot
be rented twice over the same window, a rental has a devolution date, an account
has to exist first. That makes it the best place to see where use-case boundaries
actually fall.

## What problem shape is this for?

A transactional service with genuine invariants, where "where does this rule
live?" has a wrong answer.

## The layer map

Organised by **feature module**, each module repeating the same four-way split:

```
src/modules/
  cars/       dtos/  repositories/  useCases/  infra/
  rentals/    dtos/  repositories/  useCases/  infra/
  accounts/   dtos/  repositories/  useCases/  infra/
src/shared/
  errors/     infra/
```

This is the structure that scales best of anything in the repository: a new
feature is a new directory, and nothing outside it changes. Compare with
[`nodejs-s.o.l.i.d`](/atlas/nodejs-solid), which splits by technical role
(`controllers/`, `services/`, `repositories/`) — that layout groups files that
change together *across* features and separates files that change together
*within* one.

## The idea it demonstrates most clearly

**One use case per file, one public method each.** `useCases/` is where the
business rules live, and each directory holds a controller, the use case, and its
test. The rule "a car already rented cannot be rented again" has exactly one home,
and you can find it by name.

`shared/errors/` is the second thing to read: domain errors as types rather than
thrown strings means the HTTP layer can map them to status codes without knowing
anything about rentals.

Tsyringe supplies the container, so this sits between the manual wiring of
`nodejs-s.o.l.i.d` and the full framework treatment of `nestjs-s.o.l.i.d`.

## What it deliberately does not do

- No build step — it runs from source under `ts-node`, so CI checks install only.
- No API documentation layer. The DTOs are the contract.

## Running it

```bash
cd API_s.o.l.i.d_TS
npm install
npm run dev
npm run typeorm migration:run
npm run seed:admin
npm test
```

## Read alongside

- [`nodejs-s.o.l.i.d`](/atlas/nodejs-solid) — organised by technical role instead of by feature.
- [`nestjs-s.o.l.i.d`](/atlas/nestjs-solid) — the same container idea, framework-supplied.
