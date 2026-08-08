<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BookOpen, ArrowRight, Layers, ChevronLeft } from "lucide-vue-next";
import { academyDisciplines, techIcons, techColors, premiumTools } from "../../utils/academy";

const authStore = useAuth();
const progressStore = useProgress();

onMounted(() => {
    if (authStore.isLoggedIn) {
        progressStore.fetchUserProgress();
    }
});

const disciplines = academyDisciplines;

const route = useRoute();
const router = useRouter();
const selectedDiscipline = ref<string | null>(route.query.category as string || null);

watch(selectedDiscipline, (newVal: string | null) => {
    if (newVal) {
        router.push({ query: { ...route.query, category: newVal } });
    } else {
        const query = { ...route.query };
        delete query.category;
        router.push({ query });
    }
});

watch(() => route.query.category, (newVal: any) => {
    if (selectedDiscipline.value !== newVal) {
        selectedDiscipline.value = newVal as string || null;
    }
});

const { data: rawCourses } = await useAsyncData("all-courses", () =>
    queryCollection("content")
        .where("path", "LIKE", "/courses/%")
        .all()
);

const academyData = computed(() => {
    if (!rawCourses.value) return {};
    const structure: Record<string, Record<string, any[]>> = {};

    rawCourses.value.forEach((course) => {
        const parts = course.path?.split("/") || [];
        const discipline = parts[2];
        const tool = parts[3];

        if (!discipline || !tool) return;

        if (!structure[discipline]) structure[discipline] = {};
        if (!structure[discipline][tool]) structure[discipline][tool] = [];

        structure[discipline][tool].push({
            ...course,
            lessonNum: parts[4]?.split('_')[1] || "0"
        });
    });

    for (const d in structure) {
        for (const t in structure[d]) {
            structure[d][t].sort((a, b) => parseInt(a.lessonNum) - parseInt(b.lessonNum));
        }
    }
    return structure;
});

const activeTools = computed(() => {
    if (!selectedDiscipline.value) return {};
    return academyData.value[selectedDiscipline.value] || {};
});

const formatName = (name: string) =>
    name.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
                            Select a discipline to explore our comprehensive learning tracks.
                        </p>
                    </div>
                    <div v-else key="discipline-hero" class="flex flex-col items-center">
                        <button @click="selectedDiscipline = null"
                            class="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-accent-blue))] hover:underline">
                            <ChevronLeft :size="16" />
                            All Categories
                        </button>
                        <div class="w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]"
                            :style="{ color: `rgb(${disciplines.find(d => d.id === selectedDiscipline)?.color})` }">
                            <component :is="disciplines.find(d => d.id === selectedDiscipline)?.icon" :size="28" />
                        </div>
                        <h1 class="text-3xl md:text-5xl font-black tracking-tight text-[rgb(var(--color-text))]">
                            {{ disciplines.find(d => d.id === selectedDiscipline)?.name }}
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
                    <button v-for="d in disciplines" :key="d.id" @click="selectedDiscipline = d.id"
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
                            <span>{{ Object.keys(academyData[d.id] || {}).length }} Tracks Available</span>
                        </div>
                    </button>
                </div>

                <!-- Tool Grid (Inside Discipline) -->
                <div v-else key="tool-grid" class="space-y-16">
                    <div v-for="(lessons, tool) in activeTools" :key="tool" class="space-y-6">
                        <!-- Tool Header -->
                        <div class="flex items-center gap-4 border-b border-[rgb(var(--color-border))] pb-4">
                            <div class="p-3 rounded-lg bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]"
                                :style="{ color: `rgb(${techColors[tool] || '37, 99, 235'})` }">
                                <Icon :name="techIcons[tool] || 'lucide:box'" class="w-7 h-7" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold tracking-tight text-[rgb(var(--color-text))]">
                                    {{ formatName(tool) }}
                                </h2>
                                <p class="text-xs text-[rgb(var(--color-text-soft))]">
                                    {{ lessons.length }} Modules
                                </p>
                            </div>
                        </div>

                        <!-- Lessons Grid -->
                        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <NuxtLink v-for="lesson in (premiumTools.includes(tool) && !authStore.user?.is_premium ? lessons.slice(0, 1) : lessons)"
                                :key="lesson.path" :to="lesson.path"
                                class="surface-card p-6 flex flex-col group">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-xs font-bold text-[rgb(var(--color-accent-blue))]">
                                        Module {{ lesson.lessonNum }}
                                    </span>
                                    <span v-if="premiumTools.includes(tool)"
                                        class="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase">
                                        Premium
                                    </span>
                                </div>

                                <h4 class="text-lg font-bold mb-2 text-[rgb(var(--color-text))] line-clamp-2">
                                    {{ lesson.title }}
                                </h4>

                                <p class="text-xs leading-relaxed text-[rgb(var(--color-text-soft))] line-clamp-3 mb-6">
                                    {{ lesson.description || 'Master professional architectural patterns and real-world engineering modules.' }}
                                </p>

                                <div class="mt-auto pt-4 border-t border-[rgb(var(--color-border))] flex items-center justify-between text-xs font-semibold text-[rgb(var(--color-accent-blue))]">
                                    <span>Start Module</span>
                                    <ArrowRight :size="14" class="transition-transform group-hover:translate-x-1" />
                                </div>
                            </NuxtLink>
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
