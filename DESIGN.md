# DESIGN.md — Journey_FullStack Design Language

> A plain-text design system contract. Coding agents (Claude Code, Cursor, Copilot)
> read this file to generate UI that matches the rest of the repository instead of
> inventing a new look per project.
>
> Format follows [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
> The canonical implementation of these tokens lives in
> [`learning-doc/assets/css/courses.css`](learning-doc/assets/css/courses.css) —
> **that file is the source of truth; this document explains it.**

---

## 1. Visual Theme & Atmosphere

**Engineering blueprint.** Not a marketing site, not a dashboard. The surfaces
should read like well-set technical documentation: high-contrast type, precise
1px structure, restrained colour used to *classify* rather than to decorate.

| Principle | Meaning in practice |
|:---|:---|
| **Structure over ornament** | Borders and spacing carry hierarchy. Gradients and glows are a last resort, never a default. |
| **Colour is taxonomy** | Every accent maps to a concept (a track, a language, a state). If a colour means nothing, it does not belong. |
| **Calm motion** | Motion confirms an interaction; it never announces itself. 150–220ms, spring easing, ≤2px travel. |
| **Legibility is non-negotiable** | Body text ships at ≥7:1 contrast. We do not trade readability for aesthetic. |
| **Dark is a first-class theme** | Both themes are designed, not derived. Neither is a filter over the other. |

**Anti-goals:** neon-on-black "hacker" aesthetics, glassmorphism, purple-blue SaaS
gradients, drop shadows used as decoration, emoji as iconography in product chrome.

---

## 2. Colour Palette & Roles

All colours are stored as **space-separated RGB channels** so they compose with
Tailwind's `rgb(var(--token) / <alpha>)` syntax. Never hardcode a hex in a
component — reference the token.

### Surfaces

| Token | Light | Dark | Role |
|:---|:---|:---|:---|
| `--color-bg` | `248 249 252` | `15 17 26` | Page ground |
| `--color-bg-soft` | `241 243 249` | `22 25 38` | Recessed sections, sidebars |
| `--color-bg-card` | `255 255 255` | `26 30 46` | Raised card surface |
| `--color-surface` | `243 245 250` | `32 37 56` | Inline chips, code blocks, wells |

### Typography

| Token | Light | Dark | Contrast (light) | Role |
|:---|:---|:---|:---|:---|
| `--color-text` | `15 23 42` | `248 250 252` | 14.5:1 | Headings, body |
| `--color-text-soft` | `51 65 85` | `203 213 225` | 7.5:1 | Secondary prose, captions |
| `--color-text-muted` | `100 116 139` | `148 163 184` | 4.6:1 | Metadata only — **never body copy** |

### Structure

| Token | Light | Dark | Role |
|:---|:---|:---|:---|
| `--color-border` | `226 232 240` | `45 53 78` | Card and control outlines |
| `--color-border-soft` | `241 245 249` | `35 41 62` | Internal dividers, table rules |

### Semantic accents

| Token | RGB | Meaning |
|:---|:---|:---|
| `--color-accent-blue` | `37 99 235` | Primary action, links, focus |
| `--color-accent-violet` | `124 58 237` | Architecture / theory content |
| `--color-accent-amber` | `217 119 6` | Warning, "requires care", systems-level |
| `--color-accent-emerald` | `16 185 129` | Success, verified, passing |
| `--color-accent-rose` | `225 29 72` | Error, destructive, failing |

### Technology tokens

Each technology gets exactly one colour so a project reads the same everywhere it
appears — index card, nav badge, atlas page header.

| Token | RGB | Technology |
|:---|:---|:---|
| `--color-rust` | `217 119 6` | Rust |
| `--color-go` | `8 145 178` | Go / Gin |
| `--color-nextjs` | `15 23 42` (light) · `248 250 252` (dark) | Next.js |
| `--color-flutter` | `37 99 235` | Flutter |
| `--color-dsa` | `124 58 237` | Algorithms |
| `--color-docker` | `37 99 235` | Docker |
| `--color-fastapi` | `16 185 129` | FastAPI |
| `--color-redis` | `225 29 72` | Redis |

> **Rule:** adding a technology means adding a token *and* an entry in
> [`learning-doc/utils/atlas.ts`](learning-doc/utils/atlas.ts). A one-off inline
> colour in a component is a review blocker.

---

## 3. Typography Rules

Two families, loaded once from Google Fonts and preconnected in `nuxt.config.ts`.

- **`--font-sans`** — `Inter`, then `system-ui, -apple-system, sans-serif`
- **`--font-mono`** — `JetBrains Mono`, then `'Fira Code', monospace`

| Level | Size / line-height | Weight | Notes |
|:---|:---|:---|:---|
| Display | `3rem / 1.15` | 800 | Landing hero only, one per page |
| H1 | `2.25rem / 1.2` | 700 | Page title |
| H2 | `1.75rem / 1.3` | 700 | Major section |
| H3 | `1.25rem / 1.4` | 600 | Subsection, card title |
| Body | `1rem / 1.7` | 400 | Prose. Line length capped at `68ch`. |
| Small | `0.875rem / 1.6` | 400 | Captions, metadata |
| Mono inline | `0.9em` | 500 | Inherits the surrounding size |
| Mono block | `0.875rem / 1.7` | 400 | Fenced code |

**Rules**

1. Never go below `0.75rem` for anything a user must read.
2. Tabular data uses `font-variant-numeric: tabular-nums`.
3. Prose measure is capped — long-form content lives in a `max-w-[68ch]` column.
4. Weight, not colour, expresses emphasis in body copy.

---

## 4. Component Stylings

### Card — `.surface-card`

```css
background: rgb(var(--color-bg-card));
border: 1px solid rgb(var(--color-border));
border-radius: var(--card-radius);        /* 0.875rem */
box-shadow: var(--shadow-sm);

/* hover */
border-color: rgb(var(--color-accent-blue) / 0.5);
box-shadow: var(--shadow-md);
transform: translateY(-2px);
transition: 220ms var(--ease-smooth);
```

Large containers (page-level panels) use `--card-radius-lg` (`1.25rem`).

### Buttons

| Variant | Fill | Text | Border | Use |
|:---|:---|:---|:---|:---|
| Primary | `accent-blue` | white | none | One per view — the main action |
| Secondary | `bg-card` | `text` | `border` | Everything else |
| Ghost | transparent | `text-soft` | none | Toolbars, dense rows |
| Destructive | `accent-rose` | white | none | Irreversible actions only |

Height `2.5rem`, horizontal padding `1rem`, radius `0.625rem`, weight 500.
Hover lifts by 1px; active returns to 0. Disabled drops to 45% opacity and
`cursor: not-allowed` — **never** hides the control.

### Inputs

Resting: `bg-surface` fill, 1px `border`, radius `0.625rem`, `text` colour.
Focus: border becomes `accent-blue`, plus a `0 0 0 3px rgb(var(--color-accent-blue) / 0.15)` ring.
Invalid: border and helper text become `accent-rose`; the message states *what to do*, not just what failed.

### Badges / track chips

`0.75rem` uppercase, `0.05em` tracking, weight 600, radius `9999px`,
`rgb(var(--token) / 0.12)` fill over `rgb(var(--token))` text. This is the only
place saturated colour appears at rest.

### Navigation

Inactive `text-soft`; active `text` with a 2px `accent-blue` indicator on the
leading edge. Never communicate active state with colour alone — always pair it
with weight or an indicator.

### Code blocks

`bg-surface`, 1px `border-soft`, radius `0.625rem`, `--font-mono`, `1rem` padding,
`overflow-x: auto`. Shiki themes: `github-dark` (dark) and `monokai` (sepia), set
in `nuxt.config.ts`.

---

## 5. Layout Principles

**Spacing scale (4px base):** `4, 8, 12, 16, 24, 32, 48, 64, 96`.
Nothing off-scale. If a gap "needs" 18px, the layout is wrong.

| Region | Rule |
|:---|:---|
| Page gutter | `1rem` mobile · `2rem` tablet · `4rem` desktop |
| Content max width | `1280px` for app chrome, `68ch` for prose |
| Card grid | `repeat(auto-fill, minmax(280px, 1fr))`, gap `1.5rem` |
| Section rhythm | `4rem` between major sections, `1.5rem` within |
| Card padding | `1.5rem`; dense list rows `0.75rem 1rem` |

Whitespace separates; borders only appear where two surfaces genuinely meet.

---

## 6. Depth & Elevation

Three levels, no more. Shadows are re-tuned per theme — dark mode needs opacity,
not blur.

| Token | Light | Dark | Use |
|:---|:---|:---|:---|
| `--shadow-sm` | `0 1px 2px rgb(15 23 42 / 0.05)` | `0 1px 3px rgb(0 0 0 / 0.3)` | Cards at rest |
| `--shadow-md` | `0 4px 12px -2px rgb(15 23 42 / 0.08)` | `0 6px 16px rgb(0 0 0 / 0.4)` | Hover, dropdowns |
| `--shadow-lg` | `0 12px 28px -4px rgb(15 23 42 / 0.12)` | `0 14px 36px rgb(0 0 0 / 0.5)` | Modals, command palette |

Elevation order: `bg` → `bg-soft` → `surface` → `bg-card` → shadowed overlay.

---

## 7. Do's and Don'ts

**Do**

- Reference tokens (`rgb(var(--color-text))`), never literals.
- Design the dark theme at the same time as the light one.
- Give every interactive element a visible `:focus-visible` ring.
- Keep one primary action per view.
- Pair colour with a second signal (icon, weight, indicator) for every state.
- Let content set the height; avoid fixed heights on text containers.

**Don't**

- Don't introduce a new accent without a semantic meaning and a token.
- Don't use `--color-text-muted` for body copy — it is metadata-only.
- Don't animate `width`, `height`, `top`, or `left`. Only `transform` and `opacity`.
- Don't stack more than two shadow levels in one view.
- Don't ship a hover-only affordance — touch devices have no hover.
- Don't use emoji as product iconography (Lucide icons are already installed).
- Don't exceed 220ms on any interaction transition.

---

## 8. Responsive Behaviour

| Breakpoint | Width | Behaviour |
|:---|:---|:---|
| `base` | `0px` | Single column, stacked nav, full-bleed cards |
| `sm` | `576px` | Two-up card grid |
| `md` | `768px` | Persistent sidebar appears |
| `lg` | `992px` | Three-up grid, docs table-of-contents rail |
| `xl` | `1200px` | Max content width reached |
| `2xl` | `1440px` | Gutters grow; content width stays fixed |

- Touch targets are ≥`44×44px` below `md`.
- Tables and diagrams scroll inside their own `overflow-x: auto` container; the
  page body never scrolls horizontally.
- Respect `prefers-reduced-motion: reduce` by dropping to opacity-only transitions.

---

## 9. Agent Prompt Guide

When asking an agent for UI in this repository:

> Build `<component>` following `DESIGN.md`. Use the CSS custom properties from
> `learning-doc/assets/css/courses.css` — never hardcoded colours. Card surfaces
> use `.surface-card`. Accent is `--color-accent-blue`. Support light and dark via
> the existing `.dark` class. Icons come from `lucide-vue-next`. Spacing must land
> on the 4px scale. Keep transitions ≤220ms using `--ease-smooth`.

**Quick reference for prompts**

- Primary: `rgb(var(--color-accent-blue))` — `#2563EB`
- Page ground: `#F8F9FC` light · `#0F111A` dark
- Card: `#FFFFFF` light · `#1A1E2E` dark
- Body text: `#0F172A` light · `#F8FAFC` dark
- Border: `#E2E8F0` light · `#2D354E` dark
- Radius: `0.875rem` cards · `0.625rem` controls · `9999px` chips
- Fonts: `Inter` (UI) · `JetBrains Mono` (code)

**Review gate.** Before a UI change merges, it must satisfy the checklist in
[`.claude/agents/ui-finish-gate.md`](.claude/agents/ui-finish-gate.md).
