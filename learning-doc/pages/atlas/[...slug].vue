<script setup lang="ts">
import { ArrowLeft, ExternalLink, GitCompare } from "@lucide/vue";
import {
    atlasProjects,
    projectByPath,
    trackById,
    sourceUrl,
    type AtlasProject,
} from "~/utils/atlas";

const route = useRoute();
const slug = route.params.slug;
const path = Array.isArray(slug) ? slug.join("/") : String(slug ?? "");

const { data: page } = await useAsyncData(`atlas-${path}`, () =>
    queryCollection("atlas").path(`/atlas/${path}`).first(),
);

if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: "Atlas entry not found" });
}

/** The `project:` frontmatter field ties an entry back to .github/projects.json. */
const project = computed(() =>
    page.value?.project ? projectByPath(page.value.project as string) : undefined,
);

const track = computed(() =>
    project.value ? trackById(project.value.track) : undefined,
);

const related = computed<AtlasProject[]>(() =>
    (project.value?.compare ?? [])
        .map((p) => atlasProjects.find((x) => x.path === p))
        .filter((p): p is AtlasProject => Boolean(p)),
);

useHead(() => ({
    title: `${page.value?.title ?? "Atlas"} · Engineering Atlas`,
    meta: [{ name: "description", content: (page.value?.description as string) ?? "" }],
}));
</script>

<template>
    <div class="container max-w-6xl py-8">
        <NuxtLink
            to="/atlas"
            class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-soft))] transition-colors hover:text-[rgb(var(--color-accent-blue))]"
        >
            <ArrowLeft :size="16" aria-hidden="true" />
            Back to the Atlas
        </NuxtLink>

        <div class="flex flex-col gap-10 lg:flex-row">
            <!-- ═══ CONTENT ═══ -->
            <article class="min-w-0 flex-grow">
                <header class="mb-8 border-b border-[rgb(var(--color-border))] pb-8">
                    <div v-if="track" class="mb-4 flex flex-wrap items-center gap-3">
                        <span
                            class="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide"
                            :style="{
                                backgroundColor: `rgb(${track.color} / 0.12)`,
                                color: `rgb(${track.color})`,
                            }"
                        >
                            {{ track.name }}
                        </span>
                        <span
                            v-if="project?.status === 'in-progress'"
                            class="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide"
                            :style="{
                                backgroundColor: 'rgb(var(--color-accent-amber) / 0.12)',
                                color: 'rgb(var(--color-accent-amber))',
                            }"
                        >
                            In progress
                        </span>
                    </div>

                    <h1
                        class="mb-4 text-3xl font-black tracking-tight text-[rgb(var(--color-text))] sm:text-4xl"
                    >
                        {{ page.title }}
                    </h1>

                    <p
                        v-if="page.description"
                        class="text-lg leading-relaxed text-[rgb(var(--color-text-soft))]"
                    >
                        {{ page.description }}
                    </p>
                </header>

                <div
                    class="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-a:text-[rgb(var(--color-accent-blue))]"
                >
                    <ContentRenderer :value="page" />
                </div>
            </article>

            <!-- ═══ RAIL ═══ -->
            <aside class="lg:w-64 lg:flex-shrink-0">
                <div class="space-y-8 lg:sticky lg:top-24">
                    <nav v-if="page.body?.toc?.links?.length" aria-labelledby="atlas-toc">
                        <h2
                            id="atlas-toc"
                            class="mb-4 text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-text-muted))]"
                        >
                            On this page
                        </h2>
                        <ul class="list-none space-y-3 p-0 text-sm">
                            <li v-for="link in page.body.toc.links" :key="link.id">
                                <a
                                    :href="`#${link.id}`"
                                    class="text-[rgb(var(--color-text-soft))] transition-colors hover:text-[rgb(var(--color-accent-blue))]"
                                >
                                    {{ link.text }}
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <section v-if="project">
                        <h2
                            class="mb-4 text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-text-muted))]"
                        >
                            Stack
                        </h2>
                        <ul class="flex list-none flex-wrap gap-1.5 p-0">
                            <li
                                v-for="tech in project.stack"
                                :key="tech"
                                class="rounded-md border border-[rgb(var(--color-border-soft))] bg-[rgb(var(--color-surface))] px-2 py-0.5 text-[0.6875rem] font-medium text-[rgb(var(--color-text-muted))]"
                            >
                                {{ tech }}
                            </li>
                        </ul>

                        <a
                            :href="sourceUrl(project.path)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-accent-blue))] hover:underline"
                        >
                            <ExternalLink :size="14" aria-hidden="true" />
                            View source
                        </a>
                    </section>

                    <section v-if="related.length">
                        <h2
                            class="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-text-muted))]"
                        >
                            <GitCompare :size="13" aria-hidden="true" />
                            Read alongside
                        </h2>
                        <ul class="list-none space-y-3 p-0 text-sm">
                            <li v-for="sibling in related" :key="sibling.path">
                                <NuxtLink
                                    :to="`/atlas/${sibling.slug}`"
                                    class="text-[rgb(var(--color-text-soft))] transition-colors hover:text-[rgb(var(--color-accent-blue))]"
                                >
                                    {{ sibling.name }}
                                </NuxtLink>
                            </li>
                        </ul>
                    </section>
                </div>
            </aside>
        </div>
    </div>
</template>
