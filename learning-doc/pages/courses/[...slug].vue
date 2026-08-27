<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ArrowLeft, List, Clock, ChevronLeft, ChevronRight } from "@lucide/vue";
import { courseById, parseLessonPath, formatSegment } from "~/utils/academy";

const route = useRoute();
const slug = route.params.slug;
const path = Array.isArray(slug) ? slug.join("/") : String(slug ?? "");
const fullPath = `/courses/${path}`;

const { data: lesson } = await useAsyncData(`lesson-${path}`, () =>
    queryCollection("content").path(fullPath).first()
);

if (!lesson.value) {
    throw createError({ statusCode: 404, statusMessage: "Lesson not found" });
}

const ref_ = computed(() => parseLessonPath(fullPath));
const course = computed(() => courseById(ref_.value?.course ?? ""));

/**
 * Siblings are the lessons sharing this lesson's course *and* group. Scoping to
 * the group matters for `korean`, where two KIIP books sit under one course and
 * would otherwise interleave their lesson numbers.
 */
const { data: siblings } = await useAsyncData(`siblings-${path}`, async () => {
    const parent = fullPath.slice(0, fullPath.lastIndexOf("/"));
    const pages = await queryCollection("content")
        .where("path", "LIKE", `${parent}/%`)
        .all();

    return pages
        .map((p) => ({ page: p, ref: parseLessonPath(p.path ?? "") }))
        .filter((e) => e.ref && e.ref.group === parseLessonPath(fullPath)?.group)
        .sort((a, b) => (a.ref!.order) - (b.ref!.order))
        .map((e) => ({ path: e.page.path, title: e.page.title, order: e.ref!.order }));
});

const currentIndex = computed(() =>
    (siblings.value ?? []).findIndex((s) => s.path === fullPath)
);

const prevLesson = computed(() =>
    currentIndex.value > 0 ? siblings.value![currentIndex.value - 1] : null
);

const nextLesson = computed(() => {
    const list = siblings.value ?? [];
    return currentIndex.value >= 0 && currentIndex.value < list.length - 1
        ? list[currentIndex.value + 1]
        : null;
});

const toc = computed(() => lesson.value?.body?.toc?.links ?? []);

/**
 * Nuxt Content 3 exposes the body as an AST, not as raw markdown — there is no
 * `rawbody` to count. Walking the text leaves is what gives a reading time that
 * tracks the actual lesson rather than always reporting one minute.
 */
function countWords(node: any): number {
    if (node == null) return 0;
    if (typeof node === "string") return node.split(/\s+/).filter(Boolean).length;
    if (Array.isArray(node)) return node.reduce((n, child) => n + countWords(child), 0);
    if (typeof node === "object") return countWords(node.value) + countWords(node.children);
    return 0;
}

const readingTime = computed(() =>
    Math.max(1, Math.round(countWords(lesson.value?.body?.value ?? lesson.value?.body?.children) / 200))
);

const activeTocId = ref("");

onMounted(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) activeTocId.value = entry.target.id;
            }
        },
        { rootMargin: "-80px 0px -70% 0px" }
    );

    document.querySelectorAll("article h2[id], article h3[id]").forEach((el) => {
        observer.observe(el);
    });
});
</script>

<template>
    <div class="flex-grow flex flex-col md:flex-row container py-10 gap-10">
        <!-- Sidebar / TOC -->
        <aside class="md:w-60 flex-shrink-0 space-y-6">
            <div class="sticky top-24">
                <div class="flex items-center gap-2 mb-4 text-[rgb(var(--color-text-soft))]">
                    <List :size="14" />
                    <h4 class="text-xs font-bold uppercase tracking-wider">
                        On this page
                    </h4>
                </div>
                <ul class="space-y-1">
                    <li v-for="link in toc" :key="link.id">
                        <a :href="`#${link.id}`"
                            class="block px-3 py-1.5 rounded-md text-xs transition-colors border-l-2" :class="[
                                activeTocId === link.id
                                    ? 'text-[rgb(var(--color-accent-blue))] border-[rgb(var(--color-accent-blue))] font-semibold bg-[rgb(var(--color-bg-soft))]'
                                    : 'text-[rgb(var(--color-text-soft))] border-transparent hover:text-[rgb(var(--color-text))]'
                            ]">
                            {{ link.text }}
                        </a>
                    </li>
                </ul>

                <div class="mt-8 pt-4 border-t border-[rgb(var(--color-border))]">
                    <NuxtLink :to="course ? `/courses?category=${course.discipline}` : '/courses'"
                        class="inline-flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--color-accent-blue))] hover:underline">
                        <ArrowLeft :size="14" />
                        Back to {{ course?.name ?? 'courses' }}
                    </NuxtLink>
                </div>
            </div>
        </aside>

        <!-- Content Area -->
        <article class="flex-grow max-w-none prose prose-headings:scroll-mt-24">
            <div class="not-prose flex flex-wrap items-center gap-3 mb-6 text-xs text-[rgb(var(--color-text-soft))]">
                <div v-if="course"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]">
                    <Icon :name="course.icon" class="w-3.5 h-3.5" />
                    <span>{{ course.name }}</span>
                </div>
                <div v-if="ref_?.group"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]">
                    <span>{{ formatSegment(ref_.group.split('/').pop() ?? '') }}</span>
                </div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]">
                    <Clock :size="14" />
                    <span>{{ readingTime }} min read</span>
                </div>
            </div>

            <ContentRenderer :value="lesson" />

            <!-- Prev / Next Navigation -->
            <nav v-if="prevLesson || nextLesson"
                class="not-prose mt-14 pt-8 grid gap-4 items-stretch border-t border-[rgb(var(--color-border))]"
                :class="prevLesson && nextLesson ? 'grid-cols-2' : 'grid-cols-1'">
                <NuxtLink v-if="prevLesson" :to="prevLesson.path"
                    class="surface-card p-5 flex items-center gap-3 group"
                    :class="{ 'col-start-1': !nextLesson }">
                    <ChevronLeft :size="18"
                        class="flex-shrink-0 text-[rgb(var(--color-text-muted))] transition-transform group-hover:-translate-x-1" />
                    <div class="flex-grow">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))] mb-1">
                            Previous Module
                        </div>
                        <div class="text-xs sm:text-sm font-bold text-[rgb(var(--color-text))] line-clamp-1">
                            {{ prevLesson.title || `Module ${prevLesson.order}` }}
                        </div>
                    </div>
                </NuxtLink>
                <div v-else />
                <NuxtLink v-if="nextLesson" :to="nextLesson.path"
                    class="surface-card p-5 flex items-center justify-end gap-3 text-right group"
                    :class="{ 'col-start-2': !prevLesson }">
                    <div class="flex-grow">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))] mb-1">
                            Next Module
                        </div>
                        <div class="text-xs sm:text-sm font-bold text-[rgb(var(--color-text))] line-clamp-1">
                            {{ nextLesson.title || `Module ${nextLesson.order}` }}
                        </div>
                    </div>
                    <ChevronRight :size="18"
                        class="flex-shrink-0 text-[rgb(var(--color-text-muted))] transition-transform group-hover:translate-x-1" />
                </NuxtLink>
            </nav>
        </article>
    </div>
</template>
