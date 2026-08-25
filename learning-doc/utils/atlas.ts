import {
    Boxes,
    Layers,
    Zap,
    Network,
    Brain,
    Wrench,
} from "lucide-vue-next";

/**
 * The Atlas registry.
 *
 * This mirrors `.github/projects.json` at the repository root — that file is what
 * CI reads, this one is what the site renders. `hygiene.yml` fails the build when
 * the two disagree, so keep them in step: adding a project means adding an entry
 * here, an entry there, a row in the root README, and a page in `content/atlas/`.
 */

export type TrackId =
    | "clean-architecture"
    | "solid"
    | "edge-runtime"
    | "microservices"
    | "ai-rag"
    | "tooling";

export interface AtlasTrack {
    id: TrackId;
    name: string;
    icon: typeof Boxes;
    /** RGB channels, matching the token format in assets/css/courses.css. */
    color: string;
    tagline: string;
    /** What question this track exists to answer. */
    question: string;
}

export interface AtlasProject {
    /** Directory name at the repository root. Must match projects.json exactly. */
    path: string;
    /**
     * URL segment and the basename of the entry in `content/atlas/`.
     * Explicit rather than derived: `s.o.l.i.d` and `_` do not slugify cleanly,
     * and a route that silently 404s is worse than a field to keep in step.
     */
    slug: string;
    name: string;
    track: TrackId;
    stack: string[];
    /** One sentence, no adjectives: what it demonstrates. */
    summary: string;
    /** Sibling projects worth reading beside this one. */
    compare: string[];
    status: "reference" | "in-progress" | "archived";
}

export const atlasTracks: AtlasTrack[] = [
    {
        id: "clean-architecture",
        name: "Clean Architecture",
        icon: Boxes,
        color: "124, 58, 237",
        tagline: "Layer separation and the dependency rule",
        question:
            "What does the same layered domain look like in Vue, Nuxt, Next, Nest, and React Native?",
    },
    {
        id: "solid",
        name: "SOLID Principles",
        icon: Layers,
        color: "37, 99, 235",
        tagline: "Five principles, worked through in real code",
        question:
            "Do the five principles mean the same thing in a component tree as they do in a service layer?",
    },
    {
        id: "edge-runtime",
        name: "Edge & Modern Runtimes",
        icon: Zap,
        color: "16, 185, 129",
        tagline: "Bun, Hono, SvelteKit, and edge-first data access",
        question:
            "What changes about application structure when the runtime is not Node on a long-lived server?",
    },
    {
        id: "microservices",
        name: "Distributed Systems",
        icon: Network,
        color: "217, 119, 6",
        tagline: "Service decomposition, discovery, and gateways",
        question:
            "Where do bounded contexts actually fall when one domain becomes several deployables?",
    },
    {
        id: "ai-rag",
        name: "AI & Retrieval",
        icon: Brain,
        color: "225, 29, 72",
        tagline: "Retrieval-augmented generation with a separated pipeline",
        question:
            "How do you keep an AI application testable when a model sits in the middle of it?",
    },
    {
        id: "tooling",
        name: "Tooling & Delivery",
        icon: Wrench,
        color: "100, 116, 139",
        tagline: "Build pipelines, content platforms, and operational scripts",
        question:
            "What supporting machinery does a repository of this shape actually need?",
    },
];

export const atlasProjects: AtlasProject[] = [
    // ── Clean Architecture ────────────────────────────────────────────────────
    {
        path: "vue3-clean-architecture",
        slug: "vue3-clean-architecture",
        name: "Vue 3 Clean Architecture",
        track: "clean-architecture",
        stack: ["Vue 3", "TypeScript", "Vite", "Pinia", "Vitest"],
        summary:
            "The same layering as the Nuxt project, in a plain Vite SPA with no meta-framework.",
        compare: ["nuxt-clean-architecture", "rn_clean_architecture"],
        status: "reference",
    },
    {
        path: "nuxt-clean-architecture",
        slug: "nuxt-clean-architecture",
        name: "Nuxt Clean Architecture",
        track: "clean-architecture",
        stack: ["Nuxt 3", "TypeScript", "Vitest"],
        summary:
            "A six-stage refactor from a naive component to a use case behind a repository interface, each stage its own Nuxt layer with its own tests.",
        compare: ["rn_clean_architecture", "vue3-clean-architecture"],
        status: "reference",
    },
    {
        path: "rn_clean_architecture",
        slug: "rn-clean-architecture",
        name: "React Native Clean Architecture",
        track: "clean-architecture",
        stack: ["React Native", "TypeScript", "styled-components"],
        summary:
            "The most literal layer map in the repository: domain, data, presentation, di and common as sibling directories.",
        compare: ["vue3-clean-architecture", "react-s.o.l.i.d"],
        status: "reference",
    },
    {
        path: "nestjs-s.o.l.i.d",
        slug: "nestjs-solid",
        name: "NestJS SOLID & Clean Architecture",
        track: "clean-architecture",
        stack: ["NestJS", "Prisma", "PostgreSQL", "TypeScript"],
        summary:
            "Modules named after the principle each one demonstrates, on a framework whose DI container makes inversion the default.",
        compare: ["nodejs-s.o.l.i.d", "API_s.o.l.i.d_TS"],
        status: "reference",
    },
    {
        path: "next-prisma-starter",
        slug: "next-prisma-starter",
        name: "Next.js + Prisma Starter",
        track: "clean-architecture",
        stack: ["Next.js 16", "Prisma", "Redux Toolkit", "Tailwind v4"],
        summary:
            "Full-stack Next.js where the data layer is generated, which puts pressure on where the domain boundary sits.",
        compare: ["nuxt-clean-architecture", "sveltekit"],
        status: "reference",
    },

    // ── SOLID ─────────────────────────────────────────────────────────────────
    {
        path: "react-s.o.l.i.d",
        slug: "react-solid",
        name: "React SOLID",
        track: "solid",
        stack: ["React 19", "TypeScript", "TanStack Query", "Tailwind v4"],
        summary:
            "Each principle rendered as an interactive demo, so the difference between the violating and conforming version is visible.",
        compare: ["vue.js-s.o.l.i.d", "angular-s.o.l.i.d-advanced"],
        status: "reference",
    },
    {
        path: "vue.js-s.o.l.i.d",
        slug: "vue-solid",
        name: "Vue SOLID",
        track: "solid",
        stack: ["Vue", "Vite"],
        summary:
            "The smallest treatment of the five principles here — useful as a first read before the React or Angular versions.",
        compare: ["react-s.o.l.i.d", "vue3-clean-architecture"],
        status: "reference",
    },
    {
        path: "angular-s.o.l.i.d-advanced",
        slug: "angular-solid",
        name: "Angular SOLID (Advanced)",
        track: "solid",
        stack: ["Angular 22", "TypeScript", "RxJS", "Karma"],
        summary:
            "Enterprise patterns in a framework with opinionated DI, where interface segregation has real ergonomic consequences.",
        compare: ["react-s.o.l.i.d", "nestjs-s.o.l.i.d"],
        status: "reference",
    },
    {
        path: "nodejs-s.o.l.i.d",
        slug: "nodejs-solid",
        name: "Node.js SOLID",
        track: "solid",
        stack: ["Node.js", "Express", "Sequelize", "TypeScript"],
        summary:
            "SOLID without a framework doing the work for you — including an export handler that is the clearest Open/Closed example in the repository.",
        compare: ["nestjs-s.o.l.i.d", "API_s.o.l.i.d_TS"],
        status: "reference",
    },
    {
        path: "API_s.o.l.i.d_TS",
        slug: "api-solid-ts",
        name: "Car Registration API",
        track: "solid",
        stack: ["Node.js", "TypeORM", "Tsyringe", "TypeScript"],
        summary:
            "A domain with genuine business rules, which is what makes its use-case boundaries worth arguing about.",
        compare: ["nodejs-s.o.l.i.d", "nestjs-s.o.l.i.d"],
        status: "reference",
    },
    {
        path: "solid-flask-web-app",
        slug: "solid-flask-web-app",
        name: "SOLID Flask Web App",
        track: "solid",
        stack: ["Python", "Flask", "Docker", "Nginx"],
        summary:
            "The same principles in a dynamically typed language, where dependency inversion is a convention rather than a compiler-checked contract.",
        compare: ["nodejs-s.o.l.i.d", "RAG-streamlit"],
        status: "reference",
    },

    // ── Edge & modern runtimes ────────────────────────────────────────────────
    {
        path: "Hono-Postgres",
        slug: "hono-postgres",
        name: "Hono + Postgres",
        track: "edge-runtime",
        stack: ["Hono", "Bun", "Drizzle", "Biome"],
        summary:
            "A minimal API on a runtime that executes TypeScript directly, so there is no build step to hide structure behind.",
        compare: ["sveltekit", "nodejs-s.o.l.i.d"],
        status: "reference",
    },
    {
        path: "sveltekit",
        slug: "sveltekit",
        name: "SvelteKit Platform Starter",
        track: "edge-runtime",
        stack: ["Svelte 5", "Drizzle", "Turso", "R2"],
        summary:
            "Auth, teams, and object storage against edge-hosted SQLite — the most operationally complete frontend project here.",
        compare: ["next-prisma-starter", "Hono-Postgres"],
        status: "in-progress",
    },

    // ── Distributed systems ───────────────────────────────────────────────────
    {
        path: "hospital-management",
        slug: "hospital-management",
        name: "Hospital Management",
        track: "microservices",
        stack: ["Java", "Spring Boot", "Eureka", "Spring Cloud Gateway"],
        summary:
            "One clinical domain split across patient, scheduling, billing, and clinical services behind a gateway and a discovery server.",
        compare: ["nestjs-s.o.l.i.d"],
        status: "in-progress",
    },

    // ── AI & retrieval ────────────────────────────────────────────────────────
    {
        path: "RAG-streamlit",
        slug: "rag-streamlit",
        name: "RAG Streamlit",
        track: "ai-rag",
        stack: ["Python", "Streamlit", "Poetry", "Docker"],
        summary:
            "Retrieval, backend, and frontend kept as three separate Poetry projects so the ingestion pipeline can be run and tested on its own.",
        compare: ["solid-flask-web-app"],
        status: "reference",
    },

    // ── Tooling ───────────────────────────────────────────────────────────────
    {
        path: "astro-starter",
        slug: "astro-starter",
        name: "Astro Starter",
        track: "tooling",
        stack: ["Astro 7", "React", "Tailwind v4", "Sitemap"],
        summary:
            "Content-first rendering with islands, where the interesting constraint is how little JavaScript reaches the browser.",
        compare: ["sveltekit", "learning-doc"],
        status: "reference",
    },
    {
        path: "learning-doc",
        slug: "learning-doc",
        name: "Engineering Atlas",
        track: "tooling",
        stack: ["Nuxt 4", "Nuxt Content", "Tailwind", "PocketBase"],
        summary:
            "This site: the documentation platform that renders the Atlas and the course material, backed by a local PocketBase instance.",
        compare: ["astro-starter", "nuxt-clean-architecture"],
        status: "reference",
    },
    {
        path: "vercel-cleaner",
        slug: "vercel-cleaner",
        name: "Vercel Cleaner",
        track: "tooling",
        stack: ["Node.js"],
        summary:
            "A single operational script that deletes failed Vercel deployments — included because small tools are part of the real toolchain.",
        compare: [],
        status: "reference",
    },
];

export const trackById = (id: TrackId): AtlasTrack | undefined =>
    atlasTracks.find((t) => t.id === id);

export const projectsByTrack = (id: TrackId): AtlasProject[] =>
    atlasProjects.filter((p) => p.track === id);

export const projectByPath = (path: string): AtlasProject | undefined =>
    atlasProjects.find((p) => p.path === path);

export const projectBySlug = (slug: string): AtlasProject | undefined =>
    atlasProjects.find((p) => p.slug === slug);

/** Base URL for deep links back into the source on GitHub. */
export const REPO_URL = "https://github.com/ibra-kdbra/Journey_FullStack";

export const sourceUrl = (path: string): string =>
    `${REPO_URL}/tree/main/${path}`;
