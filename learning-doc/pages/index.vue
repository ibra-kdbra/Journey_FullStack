<script setup lang="ts">
import {
    Server,
    Smartphone,
    Binary,
    Sparkles,
    Target,
    BookOpen,
    ArrowRight,
    Rocket,
    Zap,
    Code2,
    Layers,
    Cpu,
    Monitor,
} from "lucide-vue-next";
import { ref } from "vue";
import { atlasTracks, atlasProjects, projectsByTrack } from "~/utils/atlas";

const technologies = [
    {
        name: "Low-Level Systems",
        iconName: "lucide:cpu",
        href: "/courses?category=systems",
        icon: Cpu,
        color: "rgb(217, 119, 6)",
        description: "Systems programming, C, Rust, and memory safety",
    },
    {
        name: "Distributed Backend",
        iconName: "lucide:server",
        href: "/courses?category=backend",
        icon: Server,
        color: "rgb(8, 145, 178)",
        description: "High-scale microservices, Go, Node.js, and APIs",
    },
    {
        name: "Algorithm Engineering",
        iconName: "lucide:binary",
        href: "/courses?category=general",
        icon: Binary,
        color: "rgb(124, 58, 237)",
        description: "Data structures, algorithms, and core CS fundamentals",
    },
    {
        name: "Modern Frontend",
        iconName: "lucide:monitor",
        href: "/courses?category=frontend",
        icon: Monitor,
        color: "rgb(14, 165, 233)",
        description: "Web architecture, Vue, Nuxt, and performance",
    },
    {
        name: "Mobile Ecosystems",
        iconName: "lucide:smartphone",
        href: "/courses?category=mobile",
        icon: Smartphone,
        color: "rgb(192, 38, 211)",
        description: "Kotlin, Flutter, and native mobile architecture",
    },
];

const learningPaths = [
    {
        title: "Systems Architect",
        description: "Master bare-metal memory management, concurrency, pointers, and hardware assembly limits.",
        iconName: "lucide:cpu",
        link: "/courses?category=systems",
        color: "217, 119, 6",
    },
    {
        title: "Backend Architect",
        description: "Design high-throughput distributed engines, microservices, gRPC, and resilient databases.",
        iconName: "lucide:server",
        link: "/courses?category=backend",
        color: "8, 145, 178",
    },
    {
        title: "Software Architect",
        description: "Master algorithm patterns, system invariants, and enterprise-grade maintainable structures.",
        iconName: "lucide:binary",
        link: "/courses?category=general",
        color: "124, 58, 237",
    },
    {
        title: "Frontend Engineer",
        description: "Build state-of-the-art web applications with focus on rendering speed and accessibility.",
        iconName: "lucide:monitor",
        link: "/courses?category=frontend",
        color: "14, 165, 233",
    },
    {
        title: "Mobile Architect",
        description: "Construct native high-performance experiences with Kotlin, Flutter, and platform APIs.",
        iconName: "lucide:smartphone",
        link: "/courses?category=mobile",
        color: "192, 38, 211",
    },
];

const tips = [
    {
        title: "Escape Tutorial Hell",
        description: "Build real projects while learning, then rebuild them from scratch without referencing guides.",
        icon: Zap,
    },
    {
        title: "Consistent Daily Execution",
        description: "Commit to regular focused sessions. 45 minutes of daily practice beats weekend marathon coding.",
        icon: Target,
    },
    {
        title: "Mechanical Sympathy",
        description: "Understand how your code maps to physical hardware registers, caches, and memory buses.",
        icon: Rocket,
    },
    {
        title: "Production Invariants",
        description: "Enforce strict linting, type safety, unit tests, and boundary validation from Day 1.",
        icon: Code2,
    },
];

const tabMap: Record<string, { label: string, icon: string, link: string }> = {
    rust: { label: "Rust", icon: "simple-icons:rust", link: "/courses/systems/rust/lesson_0" },
    golang: { label: "Go", icon: "simple-icons:go", link: "/courses/backend/golang/lesson_0" },
    clang: { label: "C Language", icon: "simple-icons:c", link: "/courses/systems/clang/lesson_0" },
    reactjs: { label: "ReactJS", icon: "simple-icons:react", link: "/courses/frontend/reactjs/lesson_0" },
    kotlin: { label: "Kotlin", icon: "simple-icons:kotlin", link: "/courses/mobile/kotlin/lesson_0" },
    nodejs: { label: "Node.js", icon: "simple-icons:nodedotjs", link: "/courses/backend/nodejs/lesson_0" },
};

const ecosystemTools = Object.keys(tabMap);
const activeTab = ref(ecosystemTools[0]);
</script>

<template>
    <div class="min-h-screen">
        <!-- ═══ HERO SECTION ═══ -->
        <section class="py-20 sm:py-28 border-b border-[rgb(var(--color-border))]">
            <div class="container max-w-6xl mx-auto px-4">
                <div class="max-w-3xl">
                    <div class="inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold mb-6 bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-accent-violet))] border border-[rgb(var(--color-border))]">
                        <Layers :size="14" aria-hidden="true" />
                        {{ atlasProjects.length }} applications · {{ atlasTracks.length }} tracks · 5 ecosystems
                    </div>

                    <h1 class="mb-6 text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-[rgb(var(--color-text))]">
                        One set of ideas,<br />
                        <span class="text-[rgb(var(--color-accent-violet))]">twelve framework cultures</span>
                    </h1>

                    <p class="mb-10 text-base sm:text-lg leading-relaxed max-w-2xl text-[rgb(var(--color-text-soft))]">
                        A polyrepo living in one repository. Dependency inversion, layer
                        separation, and testable boundaries — worked through in React, Vue,
                        Nuxt, Angular, Svelte, Astro, React Native, NestJS, Express, Hono,
                        Flask, and Spring Boot. Where they land differently, the difference
                        is the lesson.
                    </p>

                    <div class="flex flex-wrap items-center gap-3">
                        <NuxtLink to="/atlas" class="btn-primary inline-flex items-center gap-2">
                            Open the Atlas
                            <ArrowRight :size="16" aria-hidden="true" />
                        </NuxtLink>
                        <NuxtLink
                            to="/courses"
                            class="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-card))] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--color-text))] transition-colors hover:border-[rgb(var(--color-accent-blue))]"
                        >
                            <BookOpen :size="16" aria-hidden="true" />
                            Browse courses
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </section>

        <!-- ═══ ATLAS TRACKS ═══ -->
        <section class="py-20 border-b border-[rgb(var(--color-border))]" aria-labelledby="atlas-tracks">
            <div class="container max-w-6xl mx-auto px-4">
                <div class="mb-12 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 id="atlas-tracks" class="text-3xl font-black tracking-tight mb-3 text-[rgb(var(--color-text))]">
                            The Engineering Atlas
                        </h2>
                        <p class="text-base text-[rgb(var(--color-text-soft))] max-w-xl">
                            Every project in this repository, grouped by the question it
                            exists to answer.
                        </p>
                    </div>
                    <NuxtLink
                        to="/atlas"
                        class="inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--color-accent-blue))] hover:underline"
                    >
                        All {{ atlasProjects.length }} projects
                        <ArrowRight :size="14" aria-hidden="true" />
                    </NuxtLink>
                </div>

                <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
                    <li v-for="track in atlasTracks" :key="track.id">
                        <NuxtLink
                            :to="`/atlas#track-${track.id}`"
                            class="surface-card group flex h-full flex-col p-6"
                        >
                            <div class="mb-4 flex items-center justify-between">
                                <span
                                    class="flex h-11 w-11 items-center justify-center rounded-lg"
                                    :style="{ backgroundColor: `rgb(${track.color} / 0.12)` }"
                                    aria-hidden="true"
                                >
                                    <component :is="track.icon" :size="20" :style="{ color: `rgb(${track.color})` }" />
                                </span>
                                <span class="text-xs font-semibold text-[rgb(var(--color-text-muted))]">
                                    {{ projectsByTrack(track.id).length }}
                                    {{ projectsByTrack(track.id).length === 1 ? "project" : "projects" }}
                                </span>
                            </div>

                            <h3 class="mb-2 text-lg font-bold text-[rgb(var(--color-text))]">
                                {{ track.name }}
                            </h3>
                            <p class="mb-4 text-sm leading-relaxed text-[rgb(var(--color-text-soft))]">
                                {{ track.question }}
                            </p>

                            <span
                                class="mt-auto flex items-center gap-1 border-t border-[rgb(var(--color-border))] pt-3 text-xs font-semibold text-[rgb(var(--color-accent-blue))]"
                            >
                                Explore track
                                <ArrowRight
                                    :size="12"
                                    class="transition-transform duration-200 group-hover:translate-x-0.5"
                                    aria-hidden="true"
                                />
                            </span>
                        </NuxtLink>
                    </li>
                </ul>
            </div>
        </section>

        <!-- ═══ LEARNING PATHS SECTION ═══ -->
        <section class="py-20 border-b border-[rgb(var(--color-border))]">
            <div class="container max-w-6xl mx-auto px-4">
                <div class="mb-12">
                    <h2 class="text-3xl font-black tracking-tight mb-3 text-[rgb(var(--color-text))]">
                        Course Paths
                    </h2>
                    <p class="text-base text-[rgb(var(--color-text-soft))] max-w-xl">
                        Long-form material, separate from the Atlas: low-level systems,
                        distributed APIs, algorithms, and frontend architecture.
                    </p>
                </div>

                <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <NuxtLink v-for="path in learningPaths" :key="path.title" :to="path.link"
                        class="surface-card flex flex-col p-6 group">
                        <div class="flex items-center justify-between mb-4">
                            <div class="p-2.5 rounded-lg bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]">
                                <Icon :name="path.iconName" class="w-6 h-6" :style="{ color: `rgb(${path.color})` }" />
                            </div>
                            <ArrowRight :size="16" class="text-[rgb(var(--color-text-muted))] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[rgb(var(--color-accent-blue))]" />
                        </div>
                        <h3 class="text-lg font-bold mb-2 text-[rgb(var(--color-text))]">
                            {{ path.title }}
                        </h3>
                        <p class="text-sm leading-relaxed text-[rgb(var(--color-text-soft))] mb-4">
                            {{ path.description }}
                        </p>
                        <div class="mt-auto pt-3 border-t border-[rgb(var(--color-border))] text-xs font-semibold text-[rgb(var(--color-accent-blue))] flex items-center gap-1">
                            Explore Track <ArrowRight :size="12" />
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- ═══ TIPS SECTION ═══ -->
        <section class="py-20 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-soft))]">
            <div class="container max-w-6xl mx-auto px-4">
                <div class="mb-12">
                    <h2 class="text-3xl font-black tracking-tight mb-3 text-[rgb(var(--color-text))]">
                        Engineering Principles
                    </h2>
                    <p class="text-base text-[rgb(var(--color-text-soft))] max-w-xl">
                        Proven methodologies to transition from tutorial consumer to self-sufficient Principal Architect.
                    </p>
                </div>

                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div v-for="(tip, index) in tips" :key="index" class="surface-card p-6 flex flex-col gap-3">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-accent-blue))]">
                            <component :is="tip.icon" :size="20" />
                        </div>
                        <h3 class="font-bold text-base tracking-tight text-[rgb(var(--color-text))]">
                            {{ tip.title }}
                        </h3>
                        <p class="text-sm leading-relaxed text-[rgb(var(--color-text-soft))]">
                            {{ tip.description }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ═══ ECOSYSTEMS TABS ═══ -->
        <section class="py-20">
            <div class="container max-w-6xl mx-auto px-4">
                <div class="mb-10">
                    <h2 class="text-3xl font-black tracking-tight mb-3 text-[rgb(var(--color-text))]">
                        Featured Systems Tracks
                    </h2>
                    <p class="text-base text-[rgb(var(--color-text-soft))]">
                        Select a track to launch directly into the lessons.
                    </p>
                </div>

                <div class="flex flex-wrap gap-2 mb-8">
                    <button v-for="t in ecosystemTools" :key="t" @click="activeTab = t"
                        class="px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 border"
                        :class="activeTab === t
                            ? 'bg-[rgb(var(--color-accent-blue))] text-white border-[rgb(var(--color-accent-blue))]'
                            : 'bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-soft))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-soft))]'
                        ">
                        <Icon :name="tabMap[t]?.icon || 'lucide:code-2'" class="w-4 h-4" />
                        {{ tabMap[t]?.label || t.toUpperCase() }}
                    </button>
                </div>

                <div class="surface-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h3 class="text-xl font-bold mb-2 text-[rgb(var(--color-text))]">
                            {{ tabMap[activeTab]?.label }} Systems Track
                        </h3>
                        <p class="text-sm text-[rgb(var(--color-text-soft))] max-w-xl">
                            Dive deep into memory safety, performance benchmarks, concurrency mechanics, and production patterns in {{ tabMap[activeTab]?.label }}.
                        </p>
                    </div>
                    <NuxtLink :to="tabMap[activeTab]?.link" class="btn-primary whitespace-nowrap">
                        Start Lesson 0 <ArrowRight :size="16" />
                    </NuxtLink>
                </div>
            </div>
        </section>
    </div>
</template>
