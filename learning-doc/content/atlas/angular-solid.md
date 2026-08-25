---
title: Angular SOLID (Advanced)
description: Enterprise patterns in a framework with opinionated DI, where interface segregation has ergonomic consequences.
project: angular-s.o.l.i.d-advanced
track: solid
stack: [Angular 22, TypeScript, RxJS, Karma]
status: reference
compare: [react-s.o.l.i.d, nestjs-s.o.l.i.d]
---

Angular is the only frontend framework here with a real injector, which makes it
the fairest client-side comparison against [`nestjs-s.o.l.i.d`](/atlas/nestjs-solid)
on the server.

## What problem shape is this for?

A long-lived enterprise application where shared components accumulate
responsibilities and the cost of a wrong abstraction is measured in years.

## The layer map

```
src/app/
  shared/
    components/     including table-export/
    classes/        the abstractions those components depend on
```

Deliberately flat. The interesting structure is inside `shared/classes/` — the
contracts — rather than in the directory tree.

## The idea it demonstrates most clearly

**`shared/components/table-export/` — Open/Closed through Angular's injector.**
The component depends on an export contract, not on a spreadsheet library. Adding
a format is a new provider; the component is untouched.

The broader observation this project supports: Angular's DI makes Dependency
Inversion nearly free, and that changes which principles are hard. Here, DIP is
almost automatic and **Interface Segregation** becomes the expensive one — a fat
service interface is easy to inject and painful to implement, and the pain shows
up in every test double you have to write.

RxJS adds a second dimension: an `Observable` return type is a contract about
*timing*, and Liskov substitutability has to hold for that too. A synchronous
implementation of an async contract passes the compiler and breaks the caller.

## What it deliberately does not do

- No NgRx. Angular's own DI is the subject; a state library would overshadow it.
- No routing depth. One feature area, examined closely.

## Running it

```bash
cd angular-s.o.l.i.d-advanced
npm install
npm start            # http://localhost:4200
npm run build
npm test             # Karma + Jasmine
```

Requires **Node ≥ 22.22.3** — Angular CLI 22 enforces this floor, and CI pins
Node 24 for this project because of it.

## Notes from the last repair pass

`xlsx` was declared as `>=0.20.2`, which resolves to nothing: SheetJS stopped
publishing to the public npm registry after `0.18.5`. Every install failed. It is
now pinned to `^0.18.5`, which still exports the `writeFileXLSX` this project uses.

## Read alongside

- [`react-s.o.l.i.d`](/atlas/react-solid) — the same principles where DI is hand-rolled.
- [`nestjs-s.o.l.i.d`](/atlas/nestjs-solid) — the same injector philosophy, server-side.
