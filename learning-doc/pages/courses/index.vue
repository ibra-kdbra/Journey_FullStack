<script setup lang="ts">
import { BookOpen, ArrowRight, Layers, Search, Filter, ChevronLeft, Globe, Monitor, Server, Database, Cpu, PencilRuler, Smartphone } from "lucide-vue-next";
import { academyDisciplines, techIcons, techColors } from "../../utils/academy";

const authStore = useAuth();
const progressStore = useProgress();

onMounted(() => {
    if (authStore.isLoggedIn) {
        progressStore.fetchUserProgress();
    }
});

// Categories & Disciplines
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

// Fetch courses (all .md files in content/courses)
const { data: rawCourses } = await useAsyncData("all-courses", () =>
    queryCollection("content")
        .where("path", "LIKE", "/courses/%")
        .all()
);

// Build Hierarchical Structure: Discipline -> Tool -> Lessons
const academyData = computed(() => {
    if (!rawCourses.value) return {};
    const structure: Record<string, Record<string, any[]>> = {};

    rawCourses.value.forEach((course) => {
        const parts = course.path?.split("/") || [];
        // Path: /courses/discipline/tool/lesson_x
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

    // Sort tool lessons
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
        <!-- Dynamic Hero -->
        <section class="relative pt-24 pb-20 overflow-hidden"
            :style="{ borderBottom: `1px solid rgba(var(--color-border), 0.4)` }">
            <div class="absolute inset-0 gradient-bg -z-10 opacity-30" />

            <div class="container max-w-5xl mx-auto text-center space-y-8 animate-fade-up">
                <transition name="fade" mode="out-in">
                    <div v-if="!selectedDiscipline" key="main-hero">
                        <div class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mx-auto mb-6 shadow-sm border"
                            :style="{
                                background: `rgba(var(--color-accent-blue), 0.05)`,
                                color: `rgb(var(--color-accent-blue))`,
                                borderColor: `rgba(var(--color-accent-blue), 0.2)`
                            }">
                            <Layers :size="14" />
                            Academy Curriculum
                        </div>
                        <h1 class="text-5xl md:text-7xl font-black tracking-tighter"
                            :style="{ color: `rgb(var(--color-text))` }">
                            Engineering <span class="gradient-text">Mastery</span>
                        </h1>
                        <p class="text-xl leading-relaxed max-w-2xl mx-auto mt-6"
                            :style="{ color: `rgb(var(--color-text-soft))` }">
                            Select a discipline to explore our professional learning tracks and specialized curriculum.
                        </p>
                    </div>
                    <div v-else key="discipline-hero" class="flex flex-col items-center">
                        <button @click="selectedDiscipline = null"
                            class="group mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105"
                            :style="{ color: `rgb(var(--color-text-soft))` }">
                            <ChevronLeft :size="16"
                                class="transition-transform duration-300 group-hover:-translate-x-1" />
                            Back to Categories
                        </button>
                        <div class="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 transform scale-110"
                            :style="{
                                background: `rgba(${disciplines.find(d => d.id === selectedDiscipline)?.color}, 0.1)`,
                                border: `1px solid rgba(${disciplines.find(d => d.id === selectedDiscipline)?.color}, 0.2)`,
                                color: `rgb(${disciplines.find(d => d.id === selectedDiscipline)?.color})`
                            }">
                            <component :is="disciplines.find(d => d.id === selectedDiscipline)?.icon" :size="32" />
                        </div>
                        <h1 class="text-4xl md:text-6xl font-black tracking-tight"
                            :style="{ color: `rgb(var(--color-text))` }">
                            {{disciplines.find(d => d.id === selectedDiscipline)?.name}}
                        </h1>
                    </div>
                </transition>
            </div>
        </section>

        <!-- Main Content -->
        <main class="container max-w-6xl py-16">
            <transition name="list" mode="out-in">
                <!-- Discipline Grid -->
                <div v-if="!selectedDiscipline" key="discipline-grid"
                    class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up">
                    <button v-for="d in disciplines" :key="d.id" @click="selectedDiscipline = d.id"
                        class="group text-left glass-card !p-8 !rounded-[40px] border transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden"
                        :style="{ borderColor: `rgba(var(--color-border), 0.3)` }">

                        <!-- Hover Highlight -->
                        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                            :style="{ background: `radial-gradient(circle at top right, rgba(${d.color}, 0.08), transparent)` }" />

                        <div class="flex items-start justify-between mb-8">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
                                :style="{
                                    background: `rgba(${d.color}, 0.1)`,
                                    border: `1px solid rgba(${d.color}, 0.2)`,
                                    color: `rgb(${d.color})`
                                }">
                                <component :is="d.icon" :size="28" />
                            </div>
                            <div
                                class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                <span class="text-xs font-black uppercase tracking-widest"
                                    :style="{ color: `rgb(${d.color})` }">Explore</span>
                                <ArrowRight :size="14" :style="{ color: `rgb(${d.color})` }" />
                            </div>
                        </div>

                        <h3 class="text-2xl font-black mb-3 leading-tight" :style="{ color: `rgb(var(--color-text))` }">
                            {{ d.name }}
                        </h3>
                        <p class="text-sm leading-relaxed" :style="{ color: `rgb(var(--color-text-soft))` }">
                            {{ d.desc }}
                        </p>

                        <div class="mt-8 pt-6 flex items-center gap-3"
                            :style="{ borderTop: `1px solid rgba(var(--color-border), 0.3)` }">
                            <div class="flex gap-2">
                                <div v-for="tool in Object.keys(academyData[d.id] || {}).slice(0, 3)" :key="tool"
                                    class="w-7 h-7 rounded-lg bg-surface border-2 flex items-center justify-center p-1"
                                    :style="{ borderColor: `rgb(var(--color-background))` }">
                                    <Icon :name="techIcons[tool] || 'lucide:code-2'" class="w-full h-full opacity-70" />
                                </div>
                            </div>
                            <span class="text-xs font-bold" :style="{ color: `rgb(var(--color-text-muted))` }">
                                {{ Object.keys(academyData[d.id] || {}).length }} Specialized Tracks
                            </span>
                        </div>
                    </button>
                </div>

                <!-- Tool Grid (Inside Discipline) -->
                <div v-else key="tool-grid" class="space-y-24 animate-fade-up">
                    <div v-for="(lessons, tool) in activeTools" :key="tool" class="space-y-10">
                        <!-- Tool Header -->
                        <div class="flex items-center gap-6 group">
                            <div class="p-4 rounded-[28px] shadow-2xl transition-all duration-500 transform group-hover:rotate-6 group-hover:scale-110"
                                :style="{
                                    background: `rgba(${techColors[tool] || '59, 130, 246'}, 0.1)`,
                                    border: `1px solid rgba(${techColors[tool] || '59, 130, 246'}, 0.2)`
                                }">
                                <Icon :name="techIcons[tool] || 'lucide:box'" class="w-10 h-10"
                                    :style="{ color: `rgb(${techColors[tool] || '59, 130, 246'})` }" />
                            </div>
                            <div>
                                <h2 class="text-4xl font-black tracking-tighter"
                                    :style="{ color: `rgb(var(--color-text))` }">
                                    {{ formatName(tool) }}
                                </h2>
                                <p class="text-base mt-1 font-medium"
                                    :style="{ color: `rgb(var(--color-text-muted))` }">
                                    {{ lessons.length }} Technical Learning Modules
                                </p>
                            </div>
                        </div>

                        <!-- Lessons Horizontal Scroll -->
                        <div class="flex overflow-x-auto pb-10 -mx-4 px-4 snap-x snap-mandatory gap-6 hide-scrollbar">
                            <NuxtLink v-for="(lesson, idx) in lessons" :key="lesson.path" :to="lesson.path"
                                class="group snap-center glass-card relative flex flex-col flex-none w-[300px] sm:w-[350px] !p-8 !rounded-[32px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border"
                                :style="{ borderColor: `rgba(var(--color-border), 0.3)` }">

                                <div class="flex items-center justify-between mb-8">
                                    <span class="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                                        :style="{
                                            background: `rgba(${techColors[tool] || '59, 130, 246'}, 0.08)`,
                                            color: `rgb(${techColors[tool] || '59, 130, 246'})`
                                        }">
                                        Module {{ lesson.lessonNum }}
                                    </span>
                                    <div v-if="tool === 'software-engineering' && lesson.lessonNum > 0"
                                        class="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                        Premium
                                    </div>
                                </div>

                                <h4 class="text-xl font-black mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
                                    :style="{
                                        color: `rgb(var(--color-text))`,
                                        backgroundImage: `linear-gradient(to right, rgb(${techColors[tool] || '59, 130, 246'}), rgb(var(--color-text-soft)))`
                                    }">
                                    {{ lesson.title }}
                                </h4>

                                <p class="text-sm leading-relaxed line-clamp-3 mb-8"
                                    :style="{ color: `rgb(var(--color-text-soft))` }">
                                    {{ lesson.description || `Deep dive into advanced implementation patterns and
                                    technical architecture.` }}
                                </p>

                                <div class="mt-auto flex items-center justify-between pt-6 border-t"
                                    :style="{ borderColor: `rgba(var(--color-border), 0.2)` }">
                                    <span class="text-sm font-bold"
                                        :style="{ color: `rgb(var(--color-text-muted))` }">Start Training</span>
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                                        :style="{
                                            background: `rgba(${techColors[tool] || '59, 130, 246'}, 0.1)`,
                                            color: `rgb(${techColors[tool] || '59, 130, 246'})`
                                        }">
                                        <ArrowRight :size="18" />
                                    </div>
                                </div>
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </transition>
        </main>
    </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

.list-enter-active,
.list-leave-active {
    transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: scale(0.98) translateY(20px);
}
</style>
