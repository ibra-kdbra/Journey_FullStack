<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BookOpen, ArrowRight, Layers, ChevronLeft } from "@lucide/vue";
import {
    academyDisciplines,
    academyCourses,
    coursesByDiscipline,
    parseLessonPath,
    formatSegment,
} from "~/utils/academy";

const route = useRoute();
const router = useRouter();
const selectedDiscipline = ref<string | null>((route.query.category as string) || null);

watch(selectedDiscipline, (newVal: string | null) => {
    const query = { ...route.query };
    if (newVal) query.category = newVal;
    else delete query.category;
    router.push({ query });
});

watch(() => route.query.category, (newVal) => {
    const next = (newVal as string) || null;
    if (selectedDiscipline.value !== next) selectedDiscipline.value = next;
});

const { data: rawCourses } = await useAsyncData("all-courses", () =>
    queryCollection("content").where("path", "LIKE", "/courses/%").all()
);

/**
 * Lessons keyed by course id, then by group. Ten courses have a single empty
 * group; `korean` has one group per KIIP book. Both fall out of the same shape
 * rather than needing a branch.
 */
const lessonsByCourse = computed(() => {
    const out: Record<string, Record<string, any[]>> = {};
    for (const page of rawCourses.value ?? []) {
        const ref_ = parseLessonPath(page.path ?? "");
        if (!ref_) continue;
        out[ref_.course] ??= {};
        out[ref_.course][ref_.group] ??= [];
        out[ref_.course][ref_.group].push({ ...page, ...ref_ });
    }
    for (const course of Object.values(out)) {
        for (const group of Object.values(course)) {
            group.sort((a, b) => a.order - b.order);
        }
    }
    return out;
});

const lessonCount = (courseId: string) =>
    Object.values(lessonsByCourse.value[courseId] ?? {}).reduce((n, g) => n + g.length, 0);

const disciplineCourseCount = (disciplineId: string) =>
    coursesByDiscipline(disciplineId).filter((c) => lessonCount(c.id) > 0).length;

const activeCourses = computed(() =>
    selectedDiscipline.value ? coursesByDiscipline(selectedDiscipline.value) : []
);

const activeDiscipline = computed(() =>
    academyDisciplines.find((d) => d.id === selectedDiscipline.value)
);

const totalLessons = computed(() =>
    academyCourses.reduce((n, c) => n + lessonCount(c.id), 0)
);
</script>

<template>
    <div class="min-h-screen pb-24">
        <!-- Header -->
        <section class="py-16 border-b border-[rgb(var(--color-border))]">
            <div class="container max-w-5xl mx-auto text-center space-y-4">
                <Transition name="fade" mode="out-in">
                    <div v-if="!selectedDiscipline" key="main-hero">
                        <div class="inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider mx-auto mb-4 bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-accent-blue))] border border-[rgb(var(--color-border))]">
                            <Layers :size="14" />
                            Curriculum Catalog
                        </div>
                        <h1 class="text-4xl md:text-6xl font-black tracking-tight text-[rgb(var(--color-text))]">
                            Engineering Disciplines
                        </h1>
                        <p class="text-base sm:text-lg max-w-xl mx-auto mt-3 text-[rgb(var(--color-text-soft))]">
                            {{ totalLessons }} lessons across {{ academyCourses.length }} courses.
                            Select a discipline to explore its tracks.
                        </p>
                    </div>
                    <div v-else key="discipline-hero" class="flex flex-col items-center">
                        <button @click="selectedDiscipline = null"
                            class="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-accent-blue))] hover:underline">
                            <ChevronLeft :size="16" />
                            All Categories
                        </button>
                        <div class="w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]"
                            :style="{ color: `rgb(${activeDiscipline?.color})` }">
                            <component :is="activeDiscipline?.icon" :size="28" />
                        </div>
                        <h1 class="text-3xl md:text-5xl font-black tracking-tight text-[rgb(var(--color-text))]">
                            {{ activeDiscipline?.name }}
                        </h1>
                    </div>
                </Transition>
            </div>
        </section>

        <!-- Main Content -->
        <main class="container max-w-6xl py-12">
            <Transition name="list" mode="out-in">
                <!-- Discipline Grid -->
                <div v-if="!selectedDiscipline" key="discipline-grid"
                    class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button v-for="d in academyDisciplines" :key="d.id" @click="selectedDiscipline = d.id"
                        class="surface-card p-7 text-left flex flex-col group">
                        <div class="flex items-center justify-between mb-6">
                            <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]"
                                :style="{ color: `rgb(${d.color})` }">
                                <component :is="d.icon" :size="24" />
                            </div>
                            <div class="flex items-center gap-1 text-xs font-bold text-[rgb(var(--color-accent-blue))] opacity-0 group-hover:opacity-100 transition-opacity">
                                View Tracks <ArrowRight :size="14" />
                            </div>
                        </div>

                        <h3 class="text-xl font-bold mb-2 text-[rgb(var(--color-text))]">
                            {{ d.name }}
                        </h3>
                        <p class="text-sm leading-relaxed text-[rgb(var(--color-text-soft))] mb-6">
                            {{ d.desc }}
                        </p>

                        <div class="mt-auto pt-4 flex items-center justify-between border-t border-[rgb(var(--color-border))] text-xs font-semibold text-[rgb(var(--color-text-muted))]">
                            <span>{{ disciplineCourseCount(d.id) }} Tracks Available</span>
                        </div>
                    </button>
                </div>

                <!-- Course Grid (inside a discipline) -->
                <div v-else key="course-grid" class="space-y-16">
                    <div v-for="course in activeCourses" :key="course.id" class="space-y-6">
                        <!-- Course Header -->
                        <div class="flex items-center gap-4 border-b border-[rgb(var(--color-border))] pb-4">
                            <div class="p-3 rounded-lg bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]"
                                :style="{ color: `rgb(${course.color})` }">
                                <Icon :name="course.icon" class="w-7 h-7" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold tracking-tight text-[rgb(var(--color-text))]">
                                    {{ course.name }}
                                </h2>
                                <p class="text-xs text-[rgb(var(--color-text-soft))]">
                                    {{ lessonCount(course.id) }} Modules — {{ course.desc }}
                                </p>
                            </div>
                        </div>

                        <div v-for="(lessons, group) in lessonsByCourse[course.id] ?? {}" :key="group" class="space-y-4">
                            <h3 v-if="group" class="text-sm font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
                                {{ formatSegment(group.split('/').pop() ?? group) }}
                            </h3>

                            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                <NuxtLink v-for="lesson in lessons" :key="lesson.path" :to="lesson.path"
                                    class="surface-card p-6 flex flex-col group">
                                    <div class="flex items-center justify-between mb-4">
                                        <span class="text-xs font-bold text-[rgb(var(--color-accent-blue))]">
                                            Module {{ lesson.order }}
                                        </span>
                                        <BookOpen :size="14" class="text-[rgb(var(--color-text-muted))]" />
                                    </div>

                                    <h4 class="text-lg font-bold mb-2 text-[rgb(var(--color-text))] line-clamp-2">
                                        {{ lesson.title || formatSegment(lesson.lesson) }}
                                    </h4>

                                    <p class="text-xs leading-relaxed text-[rgb(var(--color-text-soft))] line-clamp-3 mb-6">
                                        {{ lesson.description || `Module ${lesson.order} of the ${course.name} track.` }}
                                    </p>

                                    <div class="mt-auto pt-4 border-t border-[rgb(var(--color-border))] flex items-center justify-between text-xs font-semibold text-[rgb(var(--color-accent-blue))]">
                                        <span>Start Module</span>
                                        <ArrowRight :size="14" class="transition-transform group-hover:translate-x-1" />
                                    </div>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </main>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.list-enter-active,
.list-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(6px);
}
</style>
