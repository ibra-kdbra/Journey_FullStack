# 0005 — Commit a lockfile for every Node project, and install from it

**Status:** accepted
**Date:** 2026-08-26

## Context

Eleven of sixteen Node projects commit no lockfile. CI installs them with
`npm install --no-audit --no-fund --legacy-peer-deps`, resolving the dependency
graph fresh on every run.

The consequence is that a green run proves nothing about the next one. A patch
release published between two runs can turn a project red with no commit in
between, which directly undercuts the manifest rule that a check is only enabled
after it has been observed passing — observed *once*, against a tree that no
longer exists.

The five projects that do commit a lockfile turned out to make the argument
better than the eleven that do not. Checked one at a time:

| Project | Lockfile | Declared manager | State |
|:---|:---|:---|:---|
| `Hono-Postgres` | `bun.lock` | `bun` | read by CI, verified with `--frozen-lockfile` |
| `nuxt-clean-architecture` | `pnpm-lock.yaml` | `pnpm@9.15.5` | **was corrupt** — `ERR_PNPM_BROKEN_LOCKFILE` |
| `sveltekit` | `pnpm-lock.yaml` | none | **corrupt** — `@floating-ui/dom@1.7.5` duplicated |
| `solid-flask-web-app/ui` | `pnpm-lock.yaml` | none | **stale** — `ERR_PNPM_OUTDATED_LOCKFILE` |
| `learning-doc` | `yarn.lock` | none | maintained by Dependabot, read by nothing |

Three of the five were broken, and not one of those breaks was visible, because
in every case CI installed with npm and never opened the file. The
`nuxt-clean-architecture` and `sveltekit` corruptions share a cause: both files
were last written by the merge of #1193, a Dependabot pull request for
`rn_clean_architecture` — a third project entirely.

That is the actual finding. The problem is not only that most projects lack a
lockfile; it is that committing one changes nothing unless something reads it.
An unread lockfile is an unchecked lockfile, and it rots in silence while
looking like diligence.

## Decision

Every Node project commits a lockfile for its declared package manager, and CI
installs from that lockfile in a mode that fails when it disagrees with
`package.json` — `npm ci`, `pnpm install --frozen-lockfile`, or
`bun install --frozen-lockfile`.

A project's package manager is whatever `.github/projects.json` declares, and
the lockfile follows that declaration. A lockfile belonging to a manager the
project does not declare is deleted rather than adopted: `sveltekit` and
`solid-flask-web-app/ui` carry `pnpm-lock.yaml` with no `packageManager` field
and no pnpm anywhere in their tooling, so those files are historical accidents,
not decisions.

Migration proceeds in small batches, never as one mass commit. Every project is
verified independently before it is pushed — lockfile generated from an empty
`node_modules`, `npm ci` proven to install from it, and the project's enabled
checks run against the result — and every project gets its own CI job, so a red
run still names the project that broke.

Lockfiles are generated **without** `--legacy-peer-deps`. The flag skips peer
installs, so the lockfile it writes omits packages `npm ci` then demands, and
the install fails with `Missing: <pkg> from lock file`. A project that cannot
resolve without it has a real peer conflict; it records the flag in an
`installFlags` field in the manifest, with the conflict named in its `notes`.
That field is empty for every project that resolves cleanly, which turns
[#1289](https://github.com/ibra-kdbra/Journey_FullStack/issues/1289) from a
global default into a short list of written-down exceptions.

## Consequences

**What this buys us.** A green check becomes a claim about a specific dependency
graph rather than about whatever npm resolved that minute. `npm ci` is faster
than `npm install` and deletes `node_modules` first, so CI stops inheriting
state. Dependabot's diffs start showing transitive changes, which is where the
breakage in this repository has usually lived. And a corrupted or drifted
lockfile fails a build instead of waiting years to be noticed.

**What it costs us.** Roughly 17 pull requests to get there, and a permanent
increase in diff noise — a lockfile churns on every dependency update. Merge
conflicts on lockfiles become routine, and they are not hand-resolvable; the
procedure is to take one side and regenerate, which
[`DEPENDENCIES.md`](../DEPENDENCIES.md) documents for Poetry and which applies
equally here. Repository size grows by a few megabytes.

**What it forecloses.** Casual dependency edits. Hand-editing a version in
`package.json` and pushing now fails CI until the lockfile is regenerated, which
is the point, but it does mean a one-line bump is no longer a one-line change.

## Alternatives considered

| Option | Why not |
|:---|:---|
| Keep lockfiles out and write down why | The three broken lockfiles above are what "deliberately unreproducible" looks like in practice. It also leaves #1289 permanently open: `--legacy-peer-deps` cannot be retired without reproducible installs |
| Commit all seventeen in one pull request | Unreviewable, and a red run would not say which project caused it. This is the shape that produced the 1,200-PR backlog |
| Adopt pnpm wherever a `pnpm-lock.yaml` exists | Two of those three projects declare no package manager and use no pnpm tooling. Adopting it because a stale file exists is letting an accident set policy |
| Commit lockfiles but keep `npm install` | The failure this ADR is built on. A lockfile nothing reads is a lockfile nothing checks |

## Revisit when

A package manager offers a reproducible install without a committed lockfile —
a content-addressed store with a manifest digest, say. Until then the lockfile
is the only artefact that makes "observed passing" mean anything.
