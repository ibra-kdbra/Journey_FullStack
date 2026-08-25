# Contributing

The full working agreement is [`docs/ENGINEERING.md`](docs/ENGINEERING.md). This
page is the short version.

## Before you start

This is a **polyrepo living in one repository**. Each top-level directory is an
independent application with its own toolchain. There is no root install and no
shared `node_modules`. Work inside one project directory wherever possible.

## The loop

```bash
git switch -c <type>/<short-description>

cd <project>
npm install && npm run build          # or bun / poetry / mvnw

node .github/scripts/check-manifest.mjs   # structural checks, no install needed

git commit -m "fix(<project>): <imperative summary>"
```

`type` ∈ `feat` · `fix` · `docs` · `refactor` · `test` · `chore` · `ci` · `deps`.
`scope` is the project directory, or `repo` for cross-cutting changes.

## The rules that matter most

1. **A CI check is enabled only after it has been observed passing.** If you fix
   a project, run its check and flip the flag in
   [`.github/projects.json`](.github/projects.json) in the same commit. Never
   flip one optimistically.
2. **Every disabled check carries a `notes` reason.** A `false` with no
   explanation is a bug in the manifest.
3. **Delete workflows, never comment them out.** A workflow with no `on:`
   triggers is invalid, not inert — it fails every run instantly. `hygiene.yml`
   now catches this.
4. **Documentation must match reality.** The manifest, this README, and the Atlas
   are cross-validated. If a project is not what its directory name promises, the
   docs say so.
5. **Dependency majors are reviewed by a human and never auto-merged.** Every
   breakage this repository has suffered came from an unverified major.

## Adding a project

See the [project contract](docs/ENGINEERING.md#the-project-contract). In short:
a manifest at its root, an entry in `.github/projects.json`, an Atlas entry, a
row in the README index, and its own `README.md`.

## Changing a convention

Anything that changes a layering rule, adds or removes a project, or diverges
from a convention another project already follows gets an ADR in
[`docs/decisions/`](docs/decisions/). Copy
[`0000-template.md`](docs/decisions/0000-template.md). Keep it to a page.

## Agents

Repository-scoped subagents live in [`.claude/agents/`](.claude/agents/):
`architecture-reviewer`, `ui-finish-gate`, `dependency-steward`, `atlas-curator`.
The dependency steward carries a table of every breakage this repository has hit —
read it before diagnosing a dependency failure.
