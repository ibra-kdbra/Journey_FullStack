## What changed

<!-- One paragraph. Which project, and what is different afterwards. -->

## Why

<!-- The problem this solves. Link an issue or an ADR if one exists. -->

## Checks run

<!--
List the commands you actually ran and what they printed. "CI will catch it" is
not a check. See docs/ENGINEERING.md#working-on-a-change.
-->

- [ ] `node .github/scripts/check-manifest.mjs`
- [ ] `npm run build` in the affected project
- [ ] Other:

## Manifest

- [ ] No change to `.github/projects.json`
- [ ] Flipped a check to `true` — the fix that earned it is described above
- [ ] Flipped a check to `false` — the `notes` field explains why

## Review gates

<!-- Tick only what applies. -->

- [ ] Architecture: no inward-pointing dependency added ([`ARCHITECTURE.md`](../ARCHITECTURE.md#reviewing-a-change))
- [ ] UI: tokens only, both themes, visible focus ([`DESIGN.md`](../DESIGN.md#9-review-checklist))
- [ ] Docs: README, Atlas entry, and manifest agree (`check-manifest.mjs` enforces this)
- [ ] Decision recorded in `docs/decisions/` if this changes a convention
