---
title: React Native Clean Architecture
description: The most literal layer map in the repository — domain, data, presentation, di and common as siblings.
project: rn_clean_architecture
track: clean-architecture
stack: [React Native, TypeScript, styled-components]
status: reference
compare: [nuxt-clean-architecture, react-s.o.l.i.d]
---

Where [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) *arrives* at the
layer map by refactoring, this project *declares* it on day one. Reading the two
together is the fastest way to form an opinion about which approach you prefer.

## What problem shape is this for?

A mobile app where the platform boundary is a native bridge rather than an HTTP
call, and where the same domain logic has to survive two very different runtime
environments.

## The layer map

Five sibling directories under `app/`, and the dependency rule points inward:

```
app/
  domain/                 ← knows nothing about React or the network
    entities/photo/
    repositories/         PhotoRepository.ts     (the interface)
    usecases/             BaseUseCase.ts
                          photo/GetPhotoUseCase.ts
  data/                   ← implements what domain declares
    models/  datasources/  repositories/  gateway/  config/  helper/
  presentation/           ← React Native lives only here
    features/  components/  navigations/  localizations/  constants/
  di/                     ← wires implementations to interfaces
  common/                 ← shared helpers, no layer opinions
```

`domain/repositories/PhotoRepository.ts` declares an interface;
`data/repositories/` implements it; `di/index.ts` is the only file that knows
both. That is the whole of dependency inversion in three files.

## The idea it demonstrates most clearly

**`BaseUseCase.ts` — that a use case is a type, not a convention.** Once every
operation implements the same single-method contract, the presentation layer
stops caring what any particular one does. Adding a feature means adding a use
case and a DI registration; no existing file changes.

The `data/gateway/` split is the second thing worth reading: datasources speak
the transport's language, gateways translate into domain entities. That
translation step is the one most projects skip, and it is the reason the domain
layer can stay free of API-shaped types.

## What it deliberately does not do

- The domain is one entity (`photo`). The structure is the subject, not the feature set.
- No offline sync, no state-management library — those would obscure the layering.
- `di/index.ts` is manual wiring, not a container. At this size a container adds
  indirection without removing any.

## Running it

```bash
cd rn_clean_architecture
npm install
npm run android      # or: npm run ios
npm run lint
npm test
```

CI runs install and lint only: producing a build artifact needs the Android and
iOS toolchains, which the runners do not provision.

## Read alongside

- [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) — the same destination, arrived at by refactoring.
- [`react-s.o.l.i.d`](/atlas/react-solid) — the same component library, organised by principle rather than by layer.
