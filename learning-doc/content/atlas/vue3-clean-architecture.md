---
title: Vue 3 Clean Architecture
description: The same layering as the Nuxt project, in a plain Vite SPA with no meta-framework.
project: vue3-clean-architecture
track: clean-architecture
stack: [Vue 3, TypeScript, Vite, Pinia, Vitest]
status: reference
compare: [nuxt-clean-architecture, rn_clean_architecture, vue.js-s.o.l.i.d]
---

A lending library: books have a fixed number of copies, members have a loan
allowance, loans fall due after a fixed period. Small enough to read in one
sitting, with enough rules that the use cases are not disguised CRUD.

## What problem shape is this for?

A single-page app with real business rules and no backend to hide them in. When
every rule has to live in the client, the question of *where* becomes unavoidable —
and the wrong answer is the component.

## The layer map

```
src/
  domain/              imports nothing outside itself
    entities/          book.ts  member.ts  loan.ts
    ports/             book-repository.ts  loan-repository.ts  clock.ts  id-generator.ts
    usecases/          borrow-book.ts  return-book.ts  list-catalogue.ts  list-member-loans.ts
    errors.ts
  infrastructure/      depends on domain, satisfies its ports
    in-memory/         in-memory-book-repository.ts  in-memory-loan-repository.ts
    system-clock.ts    SystemClock + FixedClock
    id-generator.ts    RandomIdGenerator + SequentialIdGenerator
    container.ts       composition root
  stores/library.ts    Pinia: view state and error presentation only
  components/  views/
```

The dependency rule is checkable rather than asserted:

```bash
grep -rn "from '@/infrastructure\|from 'vue\|from 'pinia" src/domain/ --include='*.ts' \
  | grep -v __tests__      # → no matches
```

## Which principle does it demonstrate most clearly?

**Dependency inversion, pointed the right way.** `BorrowBook` depends on a
`LoanRepository` interface declared beside it in `domain/ports/`; the in-memory
class in `infrastructure/` implements it. Swapping in an HTTP repository is one
line in `container.ts` and touches no use case and no component.

Two smaller decisions are worth copying. `Clock` is a port, so the overdue rules
are tested at day 17 without waiting or stubbing a global. And `Book` stores
`totalCopies` but not `availableCopies` — availability is derived by
`ListCatalogue` from open loans, so the two cannot drift apart.

The cost is real and worth stating: four files to add one rule, and an interface
whose only implementation today is an in-memory map.

## What it deliberately does not do

No persistence — state resets on reload. No authentication; one hard-coded member
in the composition root. No component tests: the 42 tests cover entities, use
cases and the repository, because that is where the behaviour worth protecting
lives. No CSS framework.

## How do you run it?

```bash
cd vue3-clean-architecture
npm install
npm run dev
npm test             # 42 unit tests, no browser
npm run lint
npm run build        # vue-tsc type-check + vite build
```

## Read alongside

- [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) — the same destination, reached
  as a six-stage refactor. Read that one first if you want the *why* of each step;
  read this one to see what survives when the meta-framework is removed.
- [`rn_clean_architecture`](/atlas/rn-clean-architecture) — the same layering on mobile.
- [`vue.js-s.o.l.i.d`](/atlas/vue-solid) — a lighter service/repository split.
