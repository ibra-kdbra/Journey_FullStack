# vue3-clean-architecture

Clean Architecture in plain Vue 3 — Vite, Pinia, vue-router, and nothing else.
No meta-framework, no server, no database.

The domain is a small lending library: books have a fixed number of copies,
members have a loan allowance, and loans fall due after a fixed period.

## Why this project exists

[`nuxt-clean-architecture`](../nuxt-clean-architecture/) teaches the same layering
as a six-stage refactor, but does it inside a meta-framework with its own module
system and auto-imports. This project answers the obvious follow-up question: what
is left when you take those away?

The answer is that almost nothing changes. The layer boundaries are enforced by
imports and folders, not by the framework — which is the point.

## The layer map

```
src/
  domain/              ← imports nothing outside itself
    entities/          Book, Member, Loan — invariants live in their constructors
    ports/             Interfaces the use cases need: repositories, Clock, IdGenerator
    usecases/          One rule set per file: BorrowBook, ReturnBook, ListCatalogue, ListMemberLoans
    errors.ts          Domain vocabulary for expected failures
  infrastructure/      ← depends on domain, satisfies its ports
    in-memory/         The repositories the app actually runs on
    system-clock.ts    SystemClock, plus FixedClock for tests
    id-generator.ts    RandomIdGenerator, plus SequentialIdGenerator for tests
    container.ts       The composition root — the one file that knows concrete classes
  stores/              ← Pinia: view state and error presentation, no business rules
  components/          ← dumb, prop-driven
  views/               ← routed pages
```

Dependencies point inward only. `src/domain/` contains no import of Vue, Pinia,
vue-router, or anything under `src/infrastructure/`. That is checkable, not just
claimed:

```bash
grep -rn "from '@/infrastructure\|from 'vue\|from 'pinia" src/domain/ --include='*.ts' \
  | grep -v __tests__      # → no matches
```

The tests are the exception, and deliberately so: they import the in-memory
adapters because that is what the adapters are *for*.

## What it demonstrates

**Dependency inversion, in the direction that matters.** `BorrowBook` depends on a
`LoanRepository` interface declared beside it in `domain/ports/`. The in-memory
class in `infrastructure/` implements that interface. Swapping in an HTTP or
IndexedDB repository is a one-line change in `container.ts`; no use case and no
component is touched.

**Injected time.** `Clock` is a port. The overdue rules are tested at day 17
without waiting seventeen days, and without stubbing a global.

**Derived state is not stored.** `Book` has `totalCopies` but no `availableCopies`.
Availability is computed by `ListCatalogue` from the open loans, so the two can
never disagree.

**Immutable loans.** `loan.returnedOn(date)` returns a *new* `Loan`. A caller
holding the old reference sees the old value, because that is what it asked for.

**Domain errors are outcomes, not crashes.** `NoCopiesAvailable` and
`LoanAllowanceExceeded` are domain types. The Pinia store catches `DomainError` and
turns it into a message; anything else it rethrows, because an unexpected error
should still be loud.

## What it deliberately does not do

- **No persistence.** State lives in memory and resets on reload. Adding a real
  backend means writing one more adapter, which is the point being made.
- **No authentication.** There is a single hard-coded member in `container.ts`.
- **No component tests.** The behaviour worth protecting is in the domain, and that
  is where the 42 tests are. Components are thin enough to read.
- **No CSS framework.** Colours resolve through the custom properties in
  `src/assets/base.css`, per [`DESIGN.md`](../DESIGN.md).

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 42 unit tests, no browser needed
npm run lint
npm run build      # vue-tsc type-check + vite build
```

E2E specs are not wired up; `CYPRESS_INSTALL_BINARY=0` is set in CI so the binary
download is skipped.

## Read next

- [`nuxt-clean-architecture`](../nuxt-clean-architecture/) — the same ideas arrived at
  by refactoring, one stage at a time
- [`rn_clean_architecture`](../rn_clean_architecture/) — the same layering on mobile
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) — the repository-wide contract these follow
