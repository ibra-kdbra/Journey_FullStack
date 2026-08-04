<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useProgress } from '~/composables/useProgress';
import { useExam } from '~/composables/useExam';
import { 
    Trophy, Lock, ChevronRight, CheckCircle2, AlertCircle, 
    Sparkles, BrainCircuit, ShieldCheck, GraduationCap,
    RotateCcw, History, Award
} from 'lucide-vue-next';

interface Question {
    id: string;
    question: string;
    answer: string;
    options?: string[];
}

const props = defineProps<{
    courseId: string;
    totalLessons: number;
    courseName?: string;
    questions?: Question[];
}>();

const { fetchExamQuestions, submitExamResult, getExamResults, loading, error, questions: pbQuestions } = useExam();
const auth = useAuth();
const progress = useProgress();

const step = ref<'intro' | 'quiz' | 'result'>('intro');
const currentIndex = ref(0);
const score = ref(0);
const revealed = ref(false);
const prevResults = ref<any[]>([]);

const activeQuestions = computed(() => {
    return props.questions?.length ? props.questions : pbQuestions.value;
});

const progressPercent = computed(() => {
    if (!activeQuestions.value.length) return 0;
    return Math.round(((currentIndex.value) / activeQuestions.value.length) * 100);
});

const isLocked = computed(() => {
    const completed = progress.getUserProgressForCourse(props.courseId).length;
    return completed < props.totalLessons;
});

onMounted(async () => {
    if (auth.isLoggedIn) {
        await Promise.all([
            fetchExamQuestions(props.courseId),
            getExamResults(props.courseId).then(res => prevResults.value = res)
        ]);
    }
});

const startExam = () => {
    step.value = 'quiz';
    currentIndex.value = 0;
    score.value = 0;
    revealed.value = false;
};

const handleAnswer = (isCorrect: boolean) => {
    if (revealed.value) return;
    revealed.value = true;
    if (isCorrect) score.value++;
};

const nextQuestion = async () => {
    if (currentIndex.value < activeQuestions.value.length - 1) {
        currentIndex.value++;
        revealed.value = false;
    } else {
        await submitResult();
        step.value = 'result';
    }
};

const submitResult = async () => {
    try {
        await submitExamResult(props.courseId, score.value, activeQuestions.value.length);
        const res = await getExamResults(props.courseId);
        prevResults.value = res;
    } catch (e) {
        console.error('Submission failed', e);
    }
};

const formatTime = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
</script>

<template>
    <div class="exam-container my-16 relative font-inter">
        <!-- Background Decorative Glow -->
        <div class="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 opacity-50 blur-[120px]" />

        <!-- Locked State -->
        <div v-if="isLocked" 
             v-motion-fade-visible-once
             class="glass-card !p-12 !rounded-[3rem] text-center space-y-8 border-2 border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <div class="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mx-auto shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                <div class="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Lock :size="48" class="text-slate-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div class="space-y-4">
                <h2 class="text-4xl font-black tracking-tight dark:text-white">Forge Entrance Locked</h2>
                <p class="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    A Systems Architect must master the entire stack. Complete all 
                    <span class="font-black text-indigo-500 px-2 py-0.5 bg-indigo-500/10 rounded-lg">{{ totalLessons }} lessons</span> 
                    to unlock the professional certification.
                </p>
            </div>
            <div class="flex items-center justify-center gap-4 pt-4">
                <div v-for="i in 5" :key="i" class="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" :style="{ animationDelay: `${i * 150}ms` }" />
            </div>
        </div>

        <!-- Not Logged In -->
        <div v-else-if="!auth.isLoggedIn" 
             v-motion-fade-visible-once
             class="glass-card !p-12 !rounded-[3rem] text-center space-y-8 border-2 border-blue-500/20 shadow-2xl">
            <div class="w-24 h-24 rounded-[2.2rem] bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500 border border-blue-500/20 shadow-xl relative group">
                <ShieldCheck :size="40" class="group-hover:rotate-12 transition-transform" />
            </div>
            <div class="space-y-4">
                <h2 class="text-3xl font-black tracking-tight dark:text-white">Identity Verification Required</h2>
                <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Certification records are immutable and must be attached to a verified architect profile.</p>
            </div>
            <NuxtLink to="/auth" class="inline-flex h-14 items-center justify-center px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/25">
                Authenticate Identity
            </NuxtLink>
        </div>

        <!-- Main Exam Flow -->
        <div v-else class="glass-card !p-0 !rounded-[3.5rem] overflow-hidden border-2 border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/10 glass-panel">
            <div class="scanline"></div>
            <!-- Header with Stepper -->
            <div class="p-8 border-b-2 border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div class="flex items-center gap-5">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <GraduationCap :size="28" />
                    </div>
                    <div>
                        <h3 class="font-black tracking-tight text-2xl dark:text-white">Architect Certification</h3>
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p class="text-[10px] font-black uppercase tracking-tighter text-slate-400">{{ courseId.replace(/-/g, ' ') }}</p>
                        </div>
                    </div>
                </div>

                <div v-if="step === 'quiz'" class="flex items-center gap-6 w-full sm:w-auto">
                    <!-- Progress Stats -->
                    <div class="text-right hidden sm:block">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Progression</p>
                        <p class="font-black text-xl tabular-nums">{{ currentIndex + 1 }} <span class="text-slate-300 dark:text-slate-700">/</span> {{ activeQuestions.length }}</p>
                    </div>
                    <!-- Radial Progress -->
                    <div class="w-14 h-14 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative overflow-hidden shadow-inner">
                        <div class="absolute inset-0 bg-indigo-500 origin-bottom transition-all duration-1000 ease-out" 
                             :style="{ height: `${progressPercent}%` }" />
                        <span class="relative font-black text-xs mix-blend-difference">{{ progressPercent }}%</span>
                    </div>
                </div>
            </div>

            <!-- Intro Step -->
            <div v-if="step === 'intro'" class="p-12 space-y-12">
                <div class="grid lg:grid-cols-2 gap-16 items-center">
                    <div class="space-y-8">
                        <div class="space-y-4">
                            <h2 class="text-5xl font-black tracking-tighter dark:text-white leading-[1.1]">The Forge of <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">Architects</span></h2>
                            <p class="text-lg text-slate-500 dark:text-slate-400 font-medium">This is a comprehensive evaluation of your mastery over the silicon-level mechanics discussed in the curriculum.</p>
                        </div>
                        
                        <div class="grid gap-4">
                            <div v-for="(item, idx) in [
                                { label: '70% Minimum Threshold', icon: ShieldCheck, color: 'text-emerald-500' },
                                { label: 'Silicon-Level Depth', icon: BrainCircuit, color: 'text-blue-500' },
                                { label: 'Professional Badge', icon: Award, color: 'text-amber-500' }
                            ]" :key="idx" 
                                 class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 transition-transform hover:scale-[1.02]">
                                <component :is="item.icon" :size="24" :class="item.color" />
                                <span class="font-bold text-slate-700 dark:text-slate-200">{{ item.label }}</span>
                            </div>
                        </div>

                        <button @click="startExam" 
                                class="group h-16 px-12 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30 flex items-center gap-4">
                            Begin Assessment 
                            <ChevronRight :size="22" class="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <!-- Previous Results Card -->
                    <div class="bg-slate-50/50 dark:bg-slate-800/40 rounded-[3rem] p-10 border border-slate-200/50 dark:border-slate-700/50 space-y-8 shadow-inner">
                        <div class="flex items-center justify-between">
                            <h4 class="font-black uppercase tracking-widest text-xs text-slate-400 flex items-center gap-2">
                                <History :size="14" /> Attempt History
                            </h4>
                            <span v-if="prevResults.length" class="text-[10px] font-black px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md">
                                {{ prevResults.length }} SESSIONS
                            </span>
                        </div>

                        <div v-if="prevResults.length > 0" class="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                            <div v-for="res in prevResults" :key="res.id" 
                                 class="flex items-center justify-between p-5 rounded-[2rem] glass-card border-2 transition-all hover:border-indigo-500/30 group">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-xl flex items-center justify-center" 
                                         :class="res.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'">
                                        <Trophy v-if="res.passed" :size="20" />
                                        <BrainCircuit v-else :size="20" />
                                    </div>
                                    <div>
                                        <p class="font-black text-xl" :class="res.passed ? 'text-emerald-500' : 'text-slate-500'">
                                            {{ Math.round((res.score / res.total) * 100) }}%
                                        </p>
                                        <p class="text-[10px] font-bold opacity-40 uppercase tracking-widest">{{ formatTime(res.completed_at) }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm inline-block" 
                                          :class="res.passed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-500/20 text-slate-400 border border-slate-500/20'">
                                        {{ res.passed ? 'Passed' : 'Failed' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-16 opacity-30 select-none">
                            <BrainCircuit :size="64" class="mx-auto mb-6 text-indigo-500" />
                            <p class="font-black uppercase tracking-widest text-sm">Synchronizing Intelligence...</p>
                            <p class="text-xs font-bold mt-2">No historical data found</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quiz Step -->
            <div v-else-if="step === 'quiz' && activeQuestions.length > 0" class="p-12 lg:p-20 space-y-12">
                <div class="max-w-4xl mx-auto space-y-12">
                    <div class="space-y-6">
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-1 rounded-full bg-indigo-500" />
                            <span class="font-black uppercase tracking-[0.2em] text-xs text-indigo-500">Mastery Check</span>
                        </div>
                        <h2 class="text-4xl font-black tracking-tight leading-tight dark:text-white animate-fade-up" :key="currentIndex">
                            {{ activeQuestions[currentIndex].question }}
                        </h2>
                    </div>

                    <!-- Interaction Area -->
                    <div class="min-h-[300px] flex flex-col justify-center">
                        <div v-if="!revealed" 
                             v-motion-slide-bottom
                             class="glass-card !p-12 !rounded-[3rem] border-2 border-indigo-500/30 bg-indigo-500/5 text-center space-y-8 shadow-2xl">
                            <div class="space-y-3">
                                <p class="text-2xl font-black dark:text-white">Formulate the Implementation</p>
                                <p class="font-bold text-slate-500">Think deeply about the architectural implications...</p>
                            </div>
                            <button @click="revealed = true" 
                                    class="h-16 px-12 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-600/30">
                                Reveal Correct Response
                            </button>
                        </div>

                        <div v-else 
                             v-motion-slide-bottom
                             class="space-y-10">
                            <div class="glass-card !p-10 !rounded-[3rem] border-2 border-emerald-500 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10 relative overflow-hidden group">
                                <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Sparkles :size="80" class="text-emerald-500" />
                                </div>
                                <div class="flex items-center gap-3 mb-6 text-emerald-500">
                                    <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                        <CheckCircle2 :size="18" />
                                    </div>
                                    <span class="font-black uppercase tracking-widest text-xs">Architectural Standard</span>
                                </div>
                                <p class="text-2xl font-bold leading-relaxed dark:text-emerald-50">
                                    {{ activeQuestions[currentIndex].answer }}
                                </p>
                            </div>

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t-2 border-slate-200/30 dark:border-slate-800/30">
                                <p class="text-lg font-black text-slate-400 italic">Does your mental model align?</p>
                                <div class="flex gap-4 w-full sm:w-auto">
                                    <button @click="handleAnswer(false); nextQuestion()" 
                                            class="flex-1 sm:flex-none h-14 px-10 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black uppercase tracking-widest text-xs hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/30">
                                        I missed it
                                    </button>
                                    <button @click="handleAnswer(true); nextQuestion()" 
                                            class="flex-1 sm:flex-none h-14 px-10 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-600/30 transition-all">
                                        Implementation Matched
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Result Step -->
            <div v-else-if="step === 'result'" 
                 v-motion-fade
                 class="p-16 lg:p-24 text-center space-y-12 relative overflow-hidden">
                <!-- Achievement Background -->
                <div class="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-500/10 to-transparent" />
                
                <div class="relative inline-block">
                    <!-- Glow effect -->
                    <div class="absolute inset-0 bg-indigo-500/40 blur-[80px] rounded-full animate-pulse" />
                    <!-- Badge Hexagon -->
                    <div class="relative w-48 h-48 bg-slate-900 dark:bg-black rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl border-4 border-indigo-500/30 transform hover:rotate-6 transition-transform duration-700">
                        <div class="text-center">
                            <p class="text-5xl font-black text-white tabular-nums">{{ Math.round((score / activeQuestions.length) * 100) }}%</p>
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-2">Rating</p>
                        </div>
                    </div>
                    <!-- Small Trophy icon -->
                    <div class="absolute -top-4 -right-4 w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center text-white shadow-2xl rotate-12">
                        <Trophy :size="28" />
                    </div>
                </div>

                <div class="space-y-6 max-w-2xl mx-auto">
                    <h2 class="text-6xl font-black tracking-tighter dark:text-white">
                        {{ score / activeQuestions.length >= 0.7 ? 'Silicon Mastered' : 'Iteration Required' }}
                    </h2>
                    <p class="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        You successfully resolved <span class="text-indigo-500 font-black">{{ score }}</span> out of <span class="text-slate-800 dark:text-slate-200 font-black">{{ activeQuestions.length }}</span> critical architectural challenges.
                    </p>
                </div>

                <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                    <button @click="startExam" 
                            class="w-full sm:w-auto h-16 px-12 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3">
                        <RotateCcw :size="20" /> Restart Session
                    </button>
                    <NuxtLink to="/profile" 
                              class="w-full sm:w-auto h-16 px-12 rounded-[1.5rem] bg-white dark:bg-slate-800 font-black uppercase tracking-widest flex items-center justify-center transition-all hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
                        View Credentials
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.exam-container {
    perspective: 1500px;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.15);
    border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
}

.scanline {
    width: 100%;
    height: 100px;
    z-index: 10;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0) 100%);
    opacity: 0.1;
    position: absolute;
    bottom: 100%;
    animation: scanline 6s linear infinite;
    pointer-events: none;
}

@keyframes scanline {
    0% { bottom: 100%; }
    80% { bottom: 100%; }
    100% { bottom: -100px; }
}

@keyframes fade-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-up {
    animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.glass-panel {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.dark .glass-panel {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(51, 65, 85, 0.5);
}
</style>
