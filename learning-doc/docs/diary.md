# Project Implementation Diary

This diary tracks the progress of improvements and new features implemented for the **Learning Doc** project.

## Project Hierarchy & Overview

The project is a modern documentation platform built with:

- **Frontend**: Next.js 15 (App Router), React 19, Nextra 4.
- **Styling**: Tailwind CSS 4, Shadcn UI.
- **Backend**: PocketBase (Private instance).
- **Internationalization**: react-i18next.

### Core Structure

- `src/content/`: MDX lesson files.
- `src/app/docs/`: Dynamic routing for documentation.
- `src/features/`: Feature-based logic (Auth, Comments).
- `src/components/`: Reusable UI components.
- `pocketbase-docker/`: Local backend environment.

---

## Phases of Implementation

### Phase 0: Infrastructure & Environment Setup

- [x] Create `docs/diary.md`
- [x] Refactor services to use `NEXT_PUBLIC_POCKETBASE_URL`
- [x] Update Docker setup to use official PocketBase image/binary

### Phase 1: Technical Refinement & Type Safety

- [x] Implement strict TypeScript interfaces for all services
- [x] Improve error handling and loading states in UI

### Phase 2: Playwright Testing

- [x] Install and configure Playwright
- [x] Implement E2E tests for navigation, Auth, and Comments

### Phase 3: Nuxt.js Migration (In Progress)

- [x] Rename `src` to `src_legacy`
- [x] Initialize Nuxt 3 project (Content template)
- [x] Install core Nuxt modules (Content, Tailwind, Pinia)
- [x] Migrate all course content to `content/` directory
- [x] Port Auth and Comment services/composables to Nuxt
- [x] Implement modern Navbar and Footer components in Vue
- [x] Create modern page layouts and index/auth/profile/docs pages

### Phase 4: Final Polish & Testing (Nuxt)

- [x] Add "Copy Code" button to MDX code blocks
- [x] Add Reading Progress bar
- [x] Add Search shortcut (Cmd/Ctrl + K)
- [x] Rebranded project from "VieVlog" to "Emi"
- [x] Optimized MDX loading performance by disabling LaTeX in `next.config.js`
- [x] Fixed `@tailwindcss/typography` dependency and stabilized Nuxt build
- [x] Implemented Vue-based Comment Section with PocketBase integration
- [x] Cleaned up legacy Next.js configuration files
- [x] Created missing pages for About, Privacy Policy, and Terms of Service to complete routing.
- [x] Migrated all custom components (RoadmapCard, ColorWheel, TipItem) to Vue.
- [x] Migrated core UI components (Accordion, Avatar, AspectRatio, Separator, Tabs, etc.) to Vue.
- [x] Migrated all global types, utils, and legacy documentation styles.

---

## Log

### 2026-01-15: Initialization

- Created `docs/diary.md` to track progress.
- Defined project hierarchy and implementation phases.

### 2026-01-15: Phase 0 - Infrastructure

- Refactored `authClient.ts` and `comments.ts` to use `process.env.NEXT_PUBLIC_POCKETBASE_URL`.
- Created custom `Dockerfile` for PocketBase.
- Updated `docker-compose.yml` to build from local `Dockerfile`.
- Added environment variable support with default to `http://127.0.0.1:8090`.

### 2026-01-15: Phase 1 - Technical Refinement

- Implemented strict TypeScript interfaces (`User`, `Session`, `Comment`) for `authClient.ts` and `comments.ts`.
- Removed `any` type usage from service layers to improve type safety.
- Verified and improved error handling/loading states in Sign-in and Sign-up components.

### 2026-01-15: Phase 2 - Playwright Testing

- Installed `@playwright/test` and initialized browsers.
- Created `playwright.config.ts` for E2E testing.
- Implemented `tests/smoke.spec.ts` to verify core landing page and navigation functionality.

### 2026-01-15: Phase 3 - UI/UX & Rebranding

- Implemented `CopyButton` component and integrated it into `mdx-components.tsx` for all code blocks.
- Created `ReadingProgressBar` and added it to documentation layouts.
- Added `SearchShortcut` component to support `Cmd+K` / `Ctrl+K` for global search.
- Performed a global rebranding, replacing "VieVlog" with "Emi" across all components, metadata, and content.

### 2026-01-15: Bug Fixes & Backend Connectivity

- Fixed PocketBase connectivity by aligning Docker ports (8090) and updating service URLs.
- Updated `authClient.ts` and `comments.ts` to support fallback environment variables (`NEXT_PUBLIC_API_URL`).
- Resolved collection error by ensuring the frontend points to the correct local backend instance.

### 2026-01-15: Backend Setup Documentation

- Created `docs/backend-config.md` with detailed requirements for `users_tbl` and `doc_comments_tbl`.
- Documented all fields, types, and API Rules for local development setup.

### 2026-01-21: Performance Optimization

- Identified slow MDX loading times in development.
- Optimized `next.config.js` by setting `latex: false` to reduce MDX processing overhead.
- Confirmed use of Turbopack for development to improve compilation speed.

### 2026-01-21: High Resource Usage Troubleshooting

- Addressed `NetworkError` and 6GB RAM usage issues during compilation.
- Further optimized `next.config.js` by disabling search indexing in development mode (`search: isDev ? false : ...`).
- Disabled `staticImage` in Nextra configuration to reduce memory usage during development.
- These aggressive optimizations aim to significantly reduce the memory footprint and background processing during development.

### 2026-01-22: Phase 2 - Content Migration (Nuxt.js)

- Migrated all course content from `src_legacy/content/courses` to the new Nuxt `content/` directory.
- Updated `nuxt.config.ts` to include core modules (`@nuxt/content`, `@nuxtjs/tailwindcss`, `@pinia/nuxt`).
- Configured Nuxt Content to use `github-dark` highlighting theme.
- Enabled Nuxt 4 compatibility version for future-proofing.

### 2026-01-22: Phase 3 - Component & Logic Migration

- Created PocketBase service and Nuxt composables (`useAuth`, `useComments`) for backend integration.
- Developed modern Vue components for Navbar and Footer with responsive design.
- Implemented core pages: Home (with technology cards), Auth (Sign-in/Sign-up), Profile, and a dynamic Documentation viewer using Nuxt Content.
- Applied a fresh, modern aesthetic with refined Tailwind colors and typography.

### 2026-01-22: Phase 4 - Stabilization & Fixes

- Resolved critical dependency errors by ensuring `@tailwindcss/typography` is correctly installed.
- Stabilized the Nuxt build environment using `nuxi prepare`.
- Verified the complete migration path from Next.js to Nuxt 3.
- Refined project structure by moving `app.vue` to root and removing redundant `app/` directory to ensure custom pages are correctly rendered.
- Migrated PostCSS configuration into `nuxt.config.ts`.
- Implemented core documentation features in Vue: Reading Progress Bar, Copy Code utility, and Interactive Comments.
- Fixed 404 routing issue in documentation viewer by correctly mapping URL paths to the `content/` directory structure.
- Performed a major cleanup of legacy configuration files (Next.js, Biome, Knip, etc.) to finalize the migration.
