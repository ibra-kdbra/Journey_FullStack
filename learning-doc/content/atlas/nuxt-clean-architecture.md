---
title: Nuxt Clean Architecture
description: A six-stage refactor from a naive component to a use case behind a repository interface.
project: nuxt-clean-architecture
track: clean-architecture
stack: [Nuxt 3, TypeScript, Vitest, Playwright]
status: reference
compare: [rn_clean_architecture, vue3-clean-architecture]
---

**The most useful project in this repository for actually learning the ideas**,
because it does not show you the finished layer map — it shows you the six steps
that get there, and what each step buys.

## What problem shape is this for?

A frontend feature that starts as "just fetch and render" and gradually acquires
validation, error states, offline behaviour, and tests. The question it answers
is *when* to introduce each abstraction, not whether to.

## The layer map

Rather than one `src/` split into rings, it uses **Nuxt Layers** — each stage of
the refactor is a self-contained, runnable layer with its own `nuxt.config.ts`
and its own tests:

```
layers/
  version-01/    component fetches and renders directly
  version-02/    logic extracted to a composable
  version-03/    presentation split from container
  version-04/    composable gains its own unit tests
  version-05/    dependencies passed in rather than imported
  version-06/    repository interface + in-memory implementation
  newsletter/    the pattern applied to a real feature
app/
  pages/  shared/  types/
server/
```

The `newsletter/` layer is the destination in full:

```
newsletter/
  use-cases/                     subscribe-use-case.ts
  repositories/                  newsletter-repository-factory.ts
                                 in-memory-newsletter-repository.ts
  components/                    NewsletterForm.vue
  __tests__/unit/                use case, repository, composable
  __tests__/component/           NewsletterForm
  __tests__/e2e/                 the whole flow
```

## The idea it demonstrates most clearly

**Dependency inversion earns its keep at the test boundary.** By `version-06`
the composable no longer imports a repository; it receives one. That single
change is what makes `in-memory-newsletter-repository.ts` possible, and that file
is what makes `subscribe-use-case.spec.ts` run without a network.

Read `version-01` and `version-06` side by side. Everything between them is the
argument for why the extra indirection is worth it — and the earlier versions are
kept precisely so you can judge whether you agree.

The three-tier test split is the other lesson: unit tests for the use case,
component tests for the form, e2e for the flow. Each tier tests something the
others cannot.

## What it deliberately does not do

- No production database — the repository factory swaps between in-memory and HTTP.
- No auth, no multi-tenancy. The domain is one newsletter subscription on purpose.
- The earlier version layers are **not** dead code to be cleaned up. Deleting
  them destroys the point of the project.

## Running it

```bash
cd nuxt-clean-architecture
npm install
npm run dev          # http://localhost:3000
npm run test:unit    # the use case and repository specs
npm run build
```

## Read alongside

- [`rn_clean_architecture`](/atlas/rn-clean-architecture) — the same destination, reached by declaring the layers up front instead of refactoring into them.
- [`vue3-clean-architecture`](/atlas/vue3-clean-architecture) — the same framework family, not yet layered.
