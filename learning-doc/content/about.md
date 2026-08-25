---
title: About
description: Why this repository is shaped the way it is.
---

# About

This repository collects the applications I have built while working through
software architecture — not as a portfolio of finished products, but as a set of
controlled comparisons.

## The premise

Most architectural advice is framework-shaped. "Use a repository pattern" means
something different in NestJS, where a DI container makes it nearly free, than in
Express, where you wire it by hand, than in Flask, where no type system checks
that your implementation matches the contract.

The only way to see which parts of the advice are essential and which are
framework folklore is to build the same thing several ways and read them side by
side. That is what this repository is.

## How it is organised

Each project is independent — its own toolchain, its own dependency graph, its
own lifecycle. There is no root `package.json` and no shared `node_modules`,
because forcing one package manager on Bun, Poetry, Maven, and npm projects would
destroy the thing that makes them comparable.

CI is driven by a checked-in manifest that records, per project, which checks are
known to pass. A check is enabled only after it has been observed passing — which
keeps green meaningful.

## What it is not

- Not production software. Several projects are deliberately incomplete where
  completeness would obscure the point.
- Not a tutorial series. The [courses](/courses) are separate from the [Atlas](/atlas).
- Not uniformly finished. Entries marked *in progress* say what is missing.

## Source

[github.com/ibra-kdbra/Journey_FullStack](https://github.com/ibra-kdbra/Journey_FullStack)
