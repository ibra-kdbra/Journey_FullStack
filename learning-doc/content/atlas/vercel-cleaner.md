---
title: Vercel Cleaner
description: A single script that deletes failed Vercel deployments.
project: vercel-cleaner
track: tooling
stack: [Node.js]
status: reference
compare: []
---

One file, `deleteFailedDeployments.js`. It is in the Atlas because operational
scripts are part of a real toolchain, and pretending a repository consists only
of applications is how small tools end up undocumented and unowned.

## What problem shape is this for?

Failed Vercel deployments accumulate, count against project limits, and clutter
the dashboard. The Vercel UI has no bulk delete.

## The layer map

There isn't one, and that is the correct answer. A script that does one thing
against one API does not need layers; adding them would be architecture as
decoration.

## The idea it demonstrates most clearly

**Knowing when *not* to apply the patterns in the rest of this repository.** Every
other project here argues for boundaries. This one is the counter-example: the
cost of an abstraction is paid immediately and the benefit arrives only if the
code changes. This code does not change.

The judgment call — "is this going to grow?" — is the actual skill. Getting it
wrong in this direction costs a rewrite; getting it wrong in the other costs
every reader thereafter.

## What it deliberately does not do

- No CLI framework, no config file. Environment variables and defaults.
- No tests. The `test` script is a placeholder; a script whose only behaviour is
  an API call is verified by running it against a real account.

## Running it

```bash
cd vercel-cleaner
export VERCEL_TOKEN=...
node deleteFailedDeployments.js
```

## Read alongside

Nothing. That is the point.
