<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BookOpen, ArrowRight, Layers, Search, Filter, ChevronLeft, Globe, Monitor, Server, Database, Cpu, PencilRuler, Smartphone } from "lucide-vue-next";
import { academyDisciplines, techIcons, techColors, premiumTools } from "../../utils/academy";

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
                    class="grid md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade-up">
                    <button v-for="d in disciplines" :key="d.id" @click="selectedDiscipline = d.id"
                        class="group text-left glass-card !p-10 !rounded-[48px] border-2 transition-all duration-700 hover:-translate-y-3 relative overflow-hidden"
                        :style="{ 
                            borderColor: `rgba(var(--color-border), 0.2)`,
                            '--hover-glow': `rgba(${d.color}, 0.15)` 
                        }"
                        :class="'hover:shadow-[0_15px_45px_-5px_var(--hover-glow)]'">

                        <!-- Premium Highlight Effect -->
                        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
                            :style="{ background: `radial-gradient(120% 120% at 0% 0%, rgba(${d.color}, 0.12) 0%, transparent 50%)` }" />
                        
                        <div class="absolute -bottom-20 -right-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000 -z-10"
                            :style="{ background: `rgb(${d.color})` }" />

                        <div class="flex items-start justify-between mb-10">
                            <div class="w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl relative"
                                :style="{
                                    background: `rgba(${d.color}, 0.15)`,
                                    border: `2px solid rgba(${d.color}, 0.3)`,
                                    color: `rgb(${d.color})`
                                }">
                                <component :is="d.icon" :size="32" />
                            </div>
                            <div
                                class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                <span class="text-xs font-black uppercase tracking-[0.2em]"
                                    :style="{ color: `rgb(${d.color})` }">Go Deep</span>
                                <ArrowRight :size="16" :style="{ color: `rgb(${d.color})` }" />
                            </div>
                        </div>

                        <h3 class="text-3xl font-black mb-4 tracking-tighter leading-none" :style="{ color: `rgb(var(--color-text))` }">
                            {{ d.name }}
                        </h3>
                        <p class="text-base font-medium leading-relaxed opacity-70 mb-8" :style="{ color: `rgb(var(--color-text-soft))` }">
                            {{ d.desc }}
                        </p>

                        <div class="pt-8 flex items-center justify-between border-t-2"
                            :style="{ borderColor: `rgba(var(--color-border), 0.1)` }">
                            <!-- Tool Scroller (Invisible) -->
                            <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-2 px-2 py-1 flex-1">
                                <div v-for="tool in Object.keys(academyData[d.id] || {})" :key="tool"
                                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-card border flex-shrink-0 flex items-center justify-center p-1.5 transition-transform duration-500 hover:z-10 hover:-translate-y-1"
                                    :style="{ borderColor: `rgba(var(--color-border), 0.1)` }">
                                    <Icon :name="techIcons[tool] || 'lucide:code-2'" class="w-full h-full opacity-80" />
                                </div>
                            </div>
                            <span class="text-xs font-black uppercase tracking-widest opacity-60" :style="{ color: `rgb(var(--color-text))` }">
                                {{ Object.keys(academyData[d.id] || {}).length }} Tracks
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
                        <div class="flex overflow-x-auto pb-12 -mx-4 px-4 snap-x snap-mandatory gap-8 hide-scrollbar">
                            <NuxtLink v-for="(lesson, idx) in (premiumTools.includes(tool) && !authStore.user?.is_premium ? lessons.slice(0, 1) : lessons)" :key="lesson.path" :to="lesson.path"
                                class="group snap-center glass-card relative flex flex-col flex-none w-[320px] sm:w-[380px] !p-10 !rounded-[40px] transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-2"
                                :style="{ borderColor: `rgba(var(--color-border), 0.2)` }">

                                <div class="flex items-center justify-between mb-10">
                                    <div class="flex items-center gap-3">
                                        <div class="w-2 h-2 rounded-full animate-pulse" :style="{ background: `rgb(${techColors[tool] || '59, 130, 246'})` }" />
                                        <span class="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                                            Module {{ lesson.lessonNum }}
                                        </span>
                                    </div>
                                    <div v-if="premiumTools.includes(tool)"
                                        class="text-[10px] bg-gradient-to-br from-amber-400 to-orange-500 text-black px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg">
                                        Premium Track
                                    </div>
                                </div>

                                <h4 class="text-2xl font-black mb-6 leading-[1.1] transition-all duration-500 group-hover:tracking-tight"
                                    :style="{
                                        color: `rgb(var(--color-text))`
                                    }">
                                    {{ lesson.title }}
                                </h4>

                                <p class="text-base font-medium leading-relaxed opacity-60 line-clamp-3 mb-10"
                                    :style="{ color: `rgb(var(--color-text-soft))` }">
                                    {{ lesson.description || `Master professional architectural patterns and real-world engineering modules.` }}
                                </p>

                                <div class="mt-auto flex items-center justify-between pt-8 border-t-2"
                                    :style="{ borderColor: `rgba(var(--color-border), 0.1)` }">
                                    <span class="text-sm font-black uppercase tracking-widest transition-all duration-500 group-hover:translate-x-1"
                                        :style="{ color: `rgb(${techColors[tool] || '59, 130, 246'})` }">
                                        Begin Training
                                    </span>
                                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-inner"
                                        :style="{
                                            background: `rgba(${techColors[tool] || '59, 130, 246'}, 0.1)`,
                                            color: `rgb(${techColors[tool] || '59, 130, 246'})`
                                        }">
                                        <ArrowRight :size="20" />
                                    </div>
                                </div>

                                <!-- Ambient Background Element -->
                                <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
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
