---
title: Node.js SOLID
description: The five principles without a framework doing the work for you.
project: nodejs-s.o.l.i.d
track: solid
stack: [Node.js, Express, Sequelize, TypeScript]
status: reference
compare: [nestjs-s.o.l.i.d, API_s.o.l.i.d_TS]
---

The control group. NestJS and Angular make dependency inversion nearly automatic;
here you have Express and a database driver, and every abstraction is one you
chose deliberately.

## What problem shape is this for?

A conventional CRUD service that needs to grow: new export formats, new
notification channels, new persistence targets — without rewriting what already
works.

## The layer map

```
src/
  controllers/            HTTP in, HTTP out
  services/               application logic
  repositories/           Sequelize implementations
    in-memory/            the doubles that make services testable
  interfaces/             FileExporter.ts
                          PaymentInterface.ts
                          TransferInterface.ts
                          NotificationHandler/
  classes/ExportHandler/  ExcelExporter.ts  PdfExporter.ts
  models/  middlewares/  helpers/  shared/errors/
```

Note that `repositories/in-memory/` sits *beside* the real implementation rather
than in a test folder. That placement is a statement: the in-memory version is
part of the design, not a testing afterthought.

## The idea it demonstrates most clearly

**Open/Closed, via `interfaces/FileExporter.ts`.** One interface, two
implementations (`ExcelExporter`, `PdfExporter`). Adding CSV export means adding
a file. No existing file is edited. That is the whole principle, and this is the
cleanest instance of it in the repository — a real feature rather than a
`Shape`/`Circle` exercise.

`interfaces/NotificationHandler/` makes the Interface Segregation case the same
way: several narrow contracts rather than one `INotificationService` that every
implementer must partially stub out.

## What it deliberately does not do

- No DI container. Wiring is explicit in constructors, which is the point —
  compare with [`nestjs-s.o.l.i.d`](/atlas/nestjs-solid) to see what a container
  actually removes.
- No GraphQL, no websockets. REST keeps the transport boring so the structure is
  the interesting part.

## Running it

```bash
cd nodejs-s.o.l.i.d
npm install
npm run build          # tsc
npm run typecheck      # tsc --noEmit
npm run migrate:up     # requires a configured database
npm run dev
```

## Notes from the last repair pass

The `tsconfig.json` here carried options TypeScript 7 removed, which masked four
real type errors underneath — an untyped server-side `pdfmake` import, Express 5
route params typed as `string | string[]`, and Sequelize creation attributes that
demanded `id` and timestamps at insert time. All four are fixed; the config no
longer hides them.

## Read alongside

- [`nestjs-s.o.l.i.d`](/atlas/nestjs-solid) — the same principles with a container.
- [`API_s.o.l.i.d_TS`](/atlas/api-solid-ts) — the same stack with a real domain.
