---
title: Vue SOLID
description: The smallest treatment of the five principles here — the right first read.
project: vue.js-s.o.l.i.d
track: solid
stack: [Vue, Vite]
status: reference
compare: [react-s.o.l.i.d, vue3-clean-architecture]
---

Start here. It is the shortest path from "I have read the definitions" to "I can
see what they do to code", and it is small enough to read in one sitting.

## What problem shape is this for?

A first pass at applying the principles, before the framework's own machinery
starts doing some of the work for you.

## The layer map

```
src/
  components/     presentation
  views/          routed pages
  composables/    extracted reactive logic
  services/       application logic
  repositories/   data access behind an interface
  utils/
```

The `composables/` → `services/` → `repositories/` chain is the whole lesson in
directory form. A component calls a composable; the composable calls a service;
the service depends on a repository interface. Each arrow is one substitution
point.

## The idea it demonstrates most clearly

**Single Responsibility, as the reason `composables/` exists.** In Vue the
temptation is to put fetching, transforming, and rendering in one `<script setup>`
because it is *allowed to work*. Pulling reactive logic into a composable gives
the component one job, and — the part that actually matters — makes the logic
testable without mounting anything.

`repositories/` then makes the Dependency Inversion case at the smallest scale
that still demonstrates it.

## What it deliberately does not do

- No TypeScript. Which is itself instructive: without compile-time contracts the
  interfaces are conventions, and you feel the difference against
  [`react-s.o.l.i.d`](/atlas/react-solid) immediately.
- No test suite yet. The structure supports one; it has not been written.

## Running it

```bash
cd vue.js-s.o.l.i.d
npm install
npm run dev
npm run build
npm run lint
```

## Read alongside

- [`react-s.o.l.i.d`](/atlas/react-solid) — the same principles, typed and at larger scale.
- [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) — where this structure leads if you keep going.
