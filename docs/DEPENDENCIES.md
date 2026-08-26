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
6. **A held dependency needs a written reason and a clearing condition.** Both
   current holds are recorded in [known open work](ENGINEERING.md#known-open-work).

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

### A note on `--legacy-peer-deps`

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
