---
title: React SOLID
description: Each principle as a paired demo — the violating version beside the conforming one.
project: react-s.o.l.i.d
track: solid
stack: [React 19, TypeScript, TanStack Query, Tailwind v4]
status: reference
compare: [vue.js-s.o.l.i.d, angular-s.o.l.i.d-advanced]
---

SOLID was written about classes. This project is the argument that it survives
translation to a component tree — and it makes the argument by rendering both
versions so you can see the difference rather than read about it.

## What problem shape is this for?

A component library that has started to sprawl: components that fetch and render
and format, props objects nobody can implement fully, conditional branches that
grow with every new variant.

## The layer map

```
src/
  principles/     srp/  OCP/  LSP/  ISP/  DIP/     the introductory demos
  advanced/       DIP/  LSP/  …                    the same ideas at scale
  di/
    interfaces/                                    contracts the UI depends on
    repositories/                                  implementations it does not name
  utils/
```

The `principles/` → `advanced/` split matters. The introductory demos are small
enough to hold in your head; the `advanced/` versions show the same principle
where it is actually load-bearing.

## The idea it demonstrates most clearly

**`di/` — that a React app can invert its data dependencies.** Components consume
an interface from `di/interfaces/`; `di/repositories/` supplies an implementation.
Swapping a live API for a fixture is a provider change, not a component change,
which is what makes the components testable without mocking `fetch`.

For Single Responsibility, the pairing to read is a component that fetches,
transforms, and renders against the split version where a hook fetches, a pure
function transforms, and the component only renders. The line count barely moves;
what changes is how many reasons the file has to change.

## What it deliberately does not do

- No router, no global store. Both would add state questions unrelated to the principles.
- `db.json` is a local fixture, not a backend.

## Running it

```bash
cd react-s.o.l.i.d
npm install
npm run dev
npm run build
```

## Notes from the last repair pass

This project had Tailwind v4 installed against a v3 PostCSS configuration, so it
could not build at all. It now uses `@tailwindcss/vite` with a CSS-first
`@import "tailwindcss"`, and the redundant `postcss.config.cjs` and
`tailwind.config.cjs` are gone.

## Read alongside

- [`vue.js-s.o.l.i.d`](/atlas/vue-solid) — the same principles, smaller.
- [`angular-s.o.l.i.d-advanced`](/atlas/angular-solid) — a framework with DI built in.
