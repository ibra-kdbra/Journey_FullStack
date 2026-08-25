<script setup lang="ts">
import { ArrowRight, ExternalLink, Github } from "lucide-vue-next";
import {
    atlasTracks,
    atlasProjects,
    projectsByTrack,
    sourceUrl,
    REPO_URL,
} from "~/utils/atlas";

useHead({
    title: "Engineering Atlas",
    meta: [
        {
            name: "description",
            content:
                "What each project in this monorepo demonstrates, and why it was built that way.",
        },
    ],
});

const readingGuide = [
    "What problem shape is this for?",
    "What is the layer map, in real directory names?",
    "Which idea does it demonstrate most clearly?",
    "What does it deliberately not do?",
    "How do you run it?",
];

const referenceCount = atlasProjects.filter((p) => p.status === "reference").length;
const inProgressCount = atlasProjects.filter((p) => p.status === "in-progress").length;
</script>

<template>
    <div class="min-h-screen">
        <!-- ═══ HERO ═══ -->
        <section class="py-16 sm:py-24 border-b border-[rgb(var(--color-border))]">
            <div class="container max-w-6xl mx-auto">
                <div class="max-w-3xl">
                    <p
                        class="inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold mb-6 bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-accent-violet))] border border-[rgb(var(--color-border))]"
                    >
                        {{ atlasProjects.length }} projects · {{ atlasTracks.length }} tracks
                    </p>

                    <h1
                        class="mb-6 text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] text-[rgb(var(--color-text))]"
                    >
                        The Engineering
                        <span class="text-[rgb(var(--color-accent-violet))]">Atlas</span>
                    </h1>

                    <p class="text-lg leading-relaxed text-[rgb(var(--color-text-soft))]">
                        A polyrepo living in one repository. The point is not any single
                        project — it is the comparison between them: the same ideas about
                        dependency inversion, layering, and testable boundaries, worked
                        through in twelve framework cultures.
                    </p>

                    <div class="mt-8 flex flex-wrap items-center gap-3">
                        <a
                            :href="REPO_URL"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn-primary inline-flex items-center gap-2"
                        >
                            <Github :size="16" aria-hidden="true" />
                            Source on GitHub
                        </a>
                        <span class="text-sm text-[rgb(var(--color-text-muted))]">
                            {{ referenceCount }} reference · {{ inProgressCount }} in progress
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- ═══ HOW TO READ ═══ -->
        <section class="py-12 border-b border-[rgb(var(--color-border))]" aria-labelledby="how-to-read">
            <div class="container max-w-6xl mx-auto">
                <h2 id="how-to-read" class="mb-3 text-xl font-bold text-[rgb(var(--color-text))]">
                    How to read an entry
                </h2>
                <p class="mb-6 max-w-2xl text-[rgb(var(--color-text-soft))]">
                    Every entry answers the same five questions, so entries stay comparable
                    across frameworks that otherwise share no vocabulary.
                </p>

                <ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 counter-reset">
                    <li
                        v-for="(question, i) in readingGuide"
                        :key="question"
                        class="rounded-xl border border-[rgb(var(--color-border-soft))] bg-[rgb(var(--color-surface))] p-4"
                    >
                        <span class="mb-1 block text-xs font-bold text-[rgb(var(--color-accent-violet))]">
                            {{ String(i + 1).padStart(2, "0") }}
                        </span>
                        <span class="text-sm text-[rgb(var(--color-text-soft))]">{{ question }}</span>
                    </li>
                </ol>

                <p class="mt-6 max-w-2xl text-sm text-[rgb(var(--color-text-muted))]">
                    Entries are marked <strong>reference</strong> when the code delivers what
                    the name claims, and <strong>in progress</strong> when it does not yet.
                    That distinction is enforced rather than decorative.
                </p>
            </div>
        </section>

        <!-- ═══ TRACKS ═══ -->
        <section class="py-16">
            <div class="container max-w-6xl mx-auto space-y-16">
                <section v-for="track in atlasTracks" :key="track.id" :aria-labelledby="`track-${track.id}`">
                    <header class="mb-6 flex items-start gap-4">
                        <span
                            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                            :style="{ backgroundColor: `rgb(${track.color} / 0.12)` }"
                            aria-hidden="true"
                        >
                            <component :is="track.icon" :size="20" :style="{ color: `rgb(${track.color})` }" />
                        </span>

                        <div class="min-w-0">
                            <h2
                                :id="`track-${track.id}`"
                                class="text-xl font-bold text-[rgb(var(--color-text))]"
                            >
                                {{ track.name }}
                            </h2>
                            <p class="text-sm text-[rgb(var(--color-text-soft))]">
                                {{ track.tagline }}
                            </p>
                            <p class="mt-2 text-sm italic text-[rgb(var(--color-text-muted))]">
                                {{ track.question }}
                            </p>
                        </div>
                    </header>

                    <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
                        <li v-for="project in projectsByTrack(track.id)" :key="project.path">
                            <NuxtLink
                                :to="`/atlas/${project.slug}`"
                                class="surface-card group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent-blue))] focus-visible:ring-offset-2"
                            >
                                <div class="mb-3 flex items-start justify-between gap-3">
                                    <h3 class="font-semibold text-[rgb(var(--color-text))]">
                                        {{ project.name }}
                                    </h3>
                                    <span
                                        v-if="project.status === 'in-progress'"
                                        class="shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide"
                                        :style="{
                                            backgroundColor: 'rgb(var(--color-accent-amber) / 0.12)',
                                            color: 'rgb(var(--color-accent-amber))',
                                        }"
                                    >
                                        In progress
                                    </span>
                                </div>

                                <p class="flex-grow text-sm leading-relaxed text-[rgb(var(--color-text-soft))]">
                                    {{ project.summary }}
                                </p>

                                <ul class="mt-4 flex flex-wrap gap-1.5 list-none p-0">
                                    <li
                                        v-for="tech in project.stack"
                                        :key="tech"
                                        class="rounded-md border border-[rgb(var(--color-border-soft))] bg-[rgb(var(--color-surface))] px-2 py-0.5 text-[0.6875rem] font-medium text-[rgb(var(--color-text-muted))]"
                                    >
                                        {{ tech }}
                                    </li>
                                </ul>

                                <span
                                    class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--color-accent-blue))]"
                                >
                                    Read the entry
                                    <ArrowRight
                                        :size="14"
                                        class="transition-transform duration-200 group-hover:translate-x-0.5"
                                        aria-hidden="true"
                                    />
                                </span>
                            </NuxtLink>
                        </li>
                    </ul>
                </section>
            </div>
        </section>

        <!-- ═══ FULL INDEX ═══ -->
        <section class="py-16 border-t border-[rgb(var(--color-border))]">
            <div class="container max-w-6xl mx-auto">
                <h2 class="mb-6 text-xl font-bold text-[rgb(var(--color-text))]">
                    Every project
                </h2>

                <div class="overflow-x-auto">
                    <table class="w-full min-w-[42rem] border-collapse text-sm">
                        <caption class="sr-only">
                            All projects in the monorepo, with track, stack and source link
                        </caption>
                        <thead>
                            <tr class="border-b border-[rgb(var(--color-border))] text-left">
                                <th scope="col" class="py-3 pr-4 font-semibold text-[rgb(var(--color-text))]">Project</th>
                                <th scope="col" class="py-3 pr-4 font-semibold text-[rgb(var(--color-text))]">Track</th>
                                <th scope="col" class="py-3 pr-4 font-semibold text-[rgb(var(--color-text))]">Stack</th>
                                <th scope="col" class="py-3 font-semibold text-[rgb(var(--color-text))]">Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="project in atlasProjects"
                                :key="project.path"
                                class="border-b border-[rgb(var(--color-border-soft))]"
                            >
                                <td class="py-3 pr-4">
                                    <NuxtLink
                                        :to="`/atlas/${project.slug}`"
                                        class="font-medium text-[rgb(var(--color-accent-blue))] hover:underline"
                                    >
                                        {{ project.path }}
                                    </NuxtLink>
                                </td>
                                <td class="py-3 pr-4 text-[rgb(var(--color-text-soft))]">
                                    {{ project.track }}
                                </td>
                                <td class="py-3 pr-4 text-[rgb(var(--color-text-muted))]">
                                    {{ project.stack.join(", ") }}
                                </td>
                                <td class="py-3">
                                    <a
                                        :href="sourceUrl(project.path)"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="inline-flex items-center gap-1 text-[rgb(var(--color-text-soft))] hover:text-[rgb(var(--color-accent-blue))]"
                                    >
                                        <ExternalLink :size="14" aria-hidden="true" />
                                        <span class="sr-only">Open {{ project.name }} on GitHub</span>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
</template>
