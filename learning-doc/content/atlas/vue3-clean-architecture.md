---
title: Vue 3 Clean Architecture
description: Currently the create-vue scaffold — the layering the name promises has not been built yet.
project: vue3-clean-architecture
track: clean-architecture
stack: [Vue 3, TypeScript, Vite, Pinia]
status: in-progress
compare: [nuxt-clean-architecture, vue.js-s.o.l.i.d]
---

**This entry exists to be accurate rather than flattering.** The directory is
currently the unmodified `create-vue` scaffold. The Clean Architecture its name
promises has not been written.

## What is actually here

```
src/
  components/     HelloWorld.vue  TheWelcome.vue  WelcomeItem.vue  icons/
  views/          HomeView.vue  AboutView.vue
  stores/         counter.ts
  router/         index.ts
  assets/
```

That is the scaffold, plus `counter.ts` — the Pinia example store. There is no
domain layer, no repository interface, and no use case.

What the tooling *is* configured for is real: Vitest for unit tests, Cypress for
e2e, `vue-tsc` type-checking in the build, and a project-references `tsconfig`
split across app, config, and vitest.

## Why the entry stays

Two reasons. First, an Atlas that quietly described this as "a Clean Architecture
implementation" would be worse than no Atlas — a reader would trust it and lose
an afternoon. Second, the scaffold is a genuinely useful baseline: it is the
"before" that [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) spends
six layers moving away from.

## What building it out would take

Roughly the shape `nuxt-clean-architecture` arrives at, adapted to a plain Vite SPA:

1. `domain/` — entities and a repository interface, importing nothing from Vue.
2. `application/` — use cases depending on that interface.
3. `infrastructure/` — an HTTP implementation plus an in-memory one.
4. Composables that receive a use case rather than importing a service.
5. Unit tests for use cases against the in-memory repository.

Until then this stays `in-progress`, and CI checks that it installs and builds —
nothing more, because there is nothing more to check.

## Running it

```bash
cd vue3-clean-architecture
npm install
npm run dev
npm run build        # type-check + build-only
npm run test:unit
```

## Notes from the last repair pass

`@vue/tsconfig` 0.9 renamed its presets: `tsconfig.web.json` became
`tsconfig.dom.json` and `tsconfig.node.json` was removed. Both references were
stale, so the build failed before it reached any source file. TypeScript is held
at `^6` because `vue-tsc` cannot yet drive the TypeScript 7 compiler.

## Read alongside

- [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) — where this is going.
- [`vue.js-s.o.l.i.d`](/atlas/vue-solid) — a Vue project that does have a service and repository split.
