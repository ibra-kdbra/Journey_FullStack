# Dependency policy

This repository merged roughly 1,200 Dependabot pull requests with no CI watching
them. By the end four projects could not install and six could not build, while
every one of those PRs reported success — because nothing was actually running.

Every rule here is a consequence of that. The question is never "is there a newer
version?" It is **"what breaks, and who finds out?"**

---

## Rules

1. **A major bump is a code change.** Majors are reviewed by a human and never
   auto-merged. [`dependabot.yml`](../.github/dependabot.yml) deliberately excludes
   framework packages from the minor/patch groups so majors arrive alone.
2. **Never merge red or unverified.** If CI did not run for the touched project,
   find out why before merging. *"No checks ran"* is worse than a failure.
3. **Verify resolution, not just semver.** Packages do stop being published. Check
   the version actually exists before accepting a range.
4. **Toolchain floors are real constraints.** Angular CLI, Nest CLI and Vite each
   impose Node and TypeScript floors that dependency bumps quietly violate. Pin
   them in [`.github/projects.json`](../.github/projects.json) rather than
   rediscovering them in CI logs.
5. **One project at a time.** Never fix a shared symptom by bumping the same
   package everywhere in one PR. Each project builds independently here.
6. **A held dependency needs a written reason and a clearing condition.** The one
   current hold is recorded in [known open work](ENGINEERING.md#known-open-work).
7. **A hold needs an `ignore` rule, not just a closed PR.** Dependabot recreates a
   closed PR on its next run unless the target version is already satisfied or
   `dependabot.yml` ignores it. Closing without the rule buys one week of quiet and
   then the same red PR returns.

---

## Known breakages

Consult this table before diagnosing anything. It is where every failure this
repository has suffered came from, and the answer is usually already here.

| Symptom | Root cause | Resolution |
|:---|:---|:---|
| `notarget No matching version found for xlsx@>=0.20.2` | SheetJS stopped publishing `xlsx` to npm after `0.18.5` | Pin `^0.18.5`, or move to the `@e965/xlsx` mirror |
| `The installed TypeScript version (7.x) does not expose the programmatic compiler API` | Nest CLI needs the TS compiler API, removed in TS 7.0 | Hold `typescript` at `^6` until TS 7.1 |
| `Option 'moduleResolution=node10' has been removed` / `target=ES5` / `baseUrl` | TypeScript 7 dropped legacy options | Move to `moduleResolution: nodenext` or `bundler`; replace `baseUrl` with relative `paths` |
| `trying to use tailwindcss directly as a PostCSS plugin` | Tailwind v4 moved the PostCSS plugin out | Use `@tailwindcss/vite`, or `@tailwindcss/postcss`; drop `autoprefixer` |
| `module is not defined in ES module scope` in `postcss.config.js` | CJS config file inside a `"type": "module"` package | Rename to `.cjs`, or delete if Tailwind v4 made it redundant |
| `Rollup failed to resolve import "@internationalized/date"` | Unhoisted peer dependency of `bits-ui` | Add the peer as a direct dependency |
| Angular CLI refuses to start | Node floor raised by a minor Angular bump | Pin the project's Node version in `.github/projects.json` |
| `TypeError: Cannot read properties of undefined (reading 'Error')` in `@angular/compiler-cli` `readConfiguration` | TypeScript newer than the compiler-cli peer range (Angular 22 wants `>=6.0 <6.1`) | Pin `typescript` into the peer range; `npm view @angular/compiler-cli@<v> peerDependencies` gives it |
| `TS2307: Cannot find module '@angular/material/<entry>'` | `moduleResolution: node` (node10) ignores package `exports` maps, and the on-disk directory holds only Sass | Switch to `moduleResolution: bundler` |
| `NG6008: Component is standalone, and cannot be declared in an NgModule` | Angular 19 flipped the `standalone` default to `true` | Add `standalone: false` to components that stay in an NgModule |
| Prisma `datasource url is no longer supported` | Prisma 7 removed `datasource.url` from the schema | Move the URL to `prisma.config.ts` and give the client a driver adapter — done in [ADR 0004](decisions/0004-migrate-to-prisma-7.md) |
| Prisma client opens an empty SQLite file | A driver adapter resolves a relative `file:` URL against the process CWD, where Prisma 6 resolved it against the schema directory | Write the path from the project root: `file:./prisma/dev.db` |
| `PrismaConfigEnvError: Cannot resolve environment variable` | Prisma 7 stopped loading `.env` implicitly, and its `env()` helper throws when a variable is unset | `import 'dotenv/config'` in `prisma.config.ts`, and read `process.env.X` so `prisma generate` works without a database |
| `Tsconfig not found @vue/tsconfig/tsconfig.node.json` | `@vue/tsconfig` 0.9 renamed its presets | Point at the new preset name |
| `error: lockfile had changes, but lockfile is frozen` | A bun project registered under Dependabot's `npm` ecosystem: it updates `package.json` but never writes `bun.lock` | Register it as `package-ecosystem: "bun"`, and regenerate the lockfile for the update already open |
| `"X" is not exported by "virtual:env/static/private"` | SvelteKit's `$env/static/*` inlines values at build time, so the build needs every variable *present*, not correct | Declare placeholders in the project's `env` block in `.github/projects.json`. Do not convert the app to `$env/dynamic/*` just to satisfy CI — that lets the build environment dictate application architecture |
| `npm warn deprecated <pkg>@1.0.0: Package deprecated. Please use <other> instead` on a `0.x → 1.0` bump | The `1.0.0` is the package line's *final* release, published to point at a renamed successor | Take the bump — it is still the newest of what you depend on — and open a separate issue for the rename. `npm view <pkg>@1.0.0 dist.fileCount` tells a real release from an empty stub |
| `ERESOLVE could not resolve` naming a `peerOptional` range one version behind | A dependency moved past a peer range its consumer has not widened yet | Not automatically a break. `--legacy-peer-deps` installs it anyway; decide by *running* the built artefact, not by reading the warning |
| A Poetry PR that widens a constraint merges green with nothing upgraded | The already-locked version still satisfies the wider range, so `poetry lock` keeps it | Use `poetry update --lock <pkg>`. `poetry lock` only re-resolves what the constraint *forces*; a widening forces nothing |
| `ERR_PNPM_BROKEN_LOCKFILE ... duplicated mapping key` | A lockfile no CI job reads can be corrupted by an unrelated merge and stay corrupt indefinitely | Regenerate with `pnpm install --lockfile-only`, never by hand — then give the project an install path that actually reads it, so the next corruption fails a build instead of waiting |

### A note on `--legacy-peer-deps`

It is no longer a global default. Under [ADR 0005](decisions/0005-commit-lockfiles.md)
every Node project installs with `npm ci` from a committed lockfile, and three
still need the flag — each declaring it in `installFlags`, with the conflicting
packages named in its manifest `notes`:

| Project | Conflict |
|:---|:---|
| `astro-starter` | `@astrojs/check@0.9.10` peers `typescript@^5 \|\| ^6`; project is on 7.x |
| `rn_clean_architecture` | `react-native-fast-image@8.6.3` peers `react@^17 \|\| ^18`; project is on 19.x |
| `learning-doc` | `better-sqlite3@13` exceeds `@nuxt/content`'s `peerOptional ^12.5.0` |

That short list is the point. Applied to all sixteen the flag silenced peer
conflicts everywhere and deferred them to the build, where they surfaced as
errors naming neither package involved — the Angular `compiler-cli` row above is
exactly that. Thirteen projects now fail loudly at install instead.

The three that remain are all upstream waits. Every conflict that was the
project's own to fix has been fixed, and both turned out to be dead code rather
than a version puzzle: `API_s.o.l.i.d_TS` needed the flag first for
`express-async-errors` (a patch Express 5 made redundant) and then for
`eslint-config-airbnb-base`, which was pinning an eslint config that ESLint 10
could no longer even read. Deleting each removed the conflict outright.

The flag still cuts both ways where it remains. `better-sqlite3` 13 sits outside
`@nuxt/content`'s range, and that one turned out fine — the Atlas builds, and the
built server renders its content-driven pages. Treat a crossed peer range as a
prompt to run the thing, not as a verdict either way.

**Never generate a lockfile with `--legacy-peer-deps` if the project resolves
without it.** The flag skips peer installs, so those packages never enter the
lockfile and `npm ci` then refuses it with `Missing: <pkg> from lock file`.

### Why a lockfile conflict is never resolved by hand

Git will merge a lockfile for you, and that is the problem. Two branches adding
packages in distant regions of the file merge cleanly by line and produce a
lockfile no resolver ever generated — still valid JSON, still parseable, simply
describing a tree nobody chose. `npm ci` catches it later with
`Missing: <pkg> from lock file`, or does not catch it at all.

Demonstrated on `sveltekit/package-lock.json`, two branches each inserting one
line 10,000 lines apart:

```
$ git merge tmp/b                       # without .gitattributes
Auto-merging sveltekit/package-lock.json
Merge made by the 'ort' strategy.
 sveltekit/package-lock.json | 1 +      # both insertions survived
```

`.gitattributes` marks every lockfile `-merge`, so the same merge stops instead:

```
warning: Cannot merge binary files: sveltekit/package-lock.json (HEAD vs. tmp/b)
CONFLICT (content): Merge conflict in sveltekit/package-lock.json
```

That is the whole point — a conflict you must answer beats a merge you would
never have questioned. The answer is always to regenerate:

```
git checkout --theirs <project>/package-lock.json && npm install --package-lock-only
git checkout --theirs <project>/poetry.lock       && poetry lock
```

### One PR per project per update kind

Dependabot used to open one PR per major bump. Twelve arrived against
`sveltekit/package-lock.json` in a single cycle — vite, eslint, typescript
twice, lucide, `@types/node`, vite-node, prettier-plugin-svelte, jest-dom,
`@eslint/js`, mjml, nanoid — and only one of them could ever merge, because they
all rewrite the same file. The other eleven were closed and folded by hand into
five branches.

The cause was the config, not the tool: every `*-minor` group covered minor and
patch only, so majors fell out individually. Each project with a lockfile now
also declares a `*-major` group carrying the same `exclude-patterns`, so
platform packages keep their own grouping and everything else's majors arrive
together.

Maven is deliberately excluded. The rationale is the shared lockfile;
`hospital-management` has none, so a major there can land on its own and
grouping would only hide which dependency moved.

The tradeoff is real and worth stating: a grouped major PR is all-or-nothing, so
one bad bump blocks the others. That was already true — they share a lockfile,
so they always had to land together. Grouping just makes the tool produce what
the constraint already required.

### Resolving a Poetry lockfile conflict

Two dependency PRs against the same Poetry project always collide on
`poetry.lock`, and a lockfile is not a thing to merge by hand. The sequence that
works:

1. Merge `main` in and let `pyproject.toml` resolve normally — that file holds the
   PR's actual contribution, and its conflicts are a few readable lines.
2. Throw the conflicted lock away: `git checkout origin/main -- <project>/poetry.lock`.
3. Regenerate. `poetry lock` is enough when the new constraint excludes the locked
   version; when it merely widens the range, you need `poetry update --lock <pkg>`
   or the bump silently does nothing.
4. Confirm the blast radius before committing — diff the `name`/`version` pairs
   against `main`'s lock and read the list. It should name the bumped package,
   its new transitives, and nothing else.

Step 4 is not ceremony. It is the step that catches a regeneration which quietly
reverted an earlier merge, or pulled a hundred unrelated packages forward.

### Lockfiles that CI does not read

`learning-doc` commits a `yarn.lock` that Dependabot maintains, and CI installs it
with `npm install`. The lockfile is therefore updated by every dependency PR and
consulted by nothing. Until the project picks one package manager, the resolved
tree CI tests is not the tree the lockfile describes.

CI installs with `--legacy-peer-deps` because most projects here have no lockfile.
That silences peer-dependency conflicts at install time and defers them to the
build, where they surface as errors naming neither package involved — the Angular
`compiler-cli` row above is exactly that. When a build fails somewhere that makes
no sense, re-run the install *without* the flag; a peer conflict will announce
itself immediately.

---

## Triaging a dependency PR

1. Read the PR: which project, which package, which semver jump.
2. Check `.github/projects.json` for that project's toolchain pins and enabled checks.
3. Confirm the target version resolves: `npm view <pkg> versions --json | tail -20`.
4. Run the project's own checks locally before approving anything non-trivial.
5. For a major, read the upstream migration guide, then state in the PR exactly what
   code changes the bump requires — or that it requires none.
6. If the bump is blocked upstream, pin it and write the clearing condition. Do not
   leave it open.

Record the verdict in the PR in this shape:

```
PROJECT:  <name>
BUMP:     <pkg> <from> → <to>  (<major|minor|patch>)
VERDICT:  merge | merge-after-fix | hold | close
EVIDENCE: <command run, result>
```

`merge-after-fix` names the exact code change required. `hold` names the upstream
blocker and the condition that clears it.

---

## What good looks like

- No project in `.github/projects.json` sits at `install: false`.
- No dependency PR merges without a green run for its project.
- Every held dependency has a written reason and a clearing condition.
