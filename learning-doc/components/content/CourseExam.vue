<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useProgress } from '~/composables/useProgress';
import { useExam } from '~/composables/useExam';
import { Trophy, Lock, ChevronRight, CheckCircle2, AlertCircle, Sparkles, BrainCircuit } from 'lucide-vue-next';

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
}>();

const { fetchExamQuestions, submitExamResult, getExamResults, loading, error, questions } = useExam();
const auth = useAuth();
const progress = useProgress();

const step = ref<'intro' | 'quiz' | 'result'>('intro');
const currentIndex = ref(0);
const score = ref(0);
const revealed = ref(false);
const prevResults = ref<any[]>([]);

const progressPercent = computed(() => {
    if (!questions.value.length) return 0;
    return Math.round((currentIndex.value / questions.value.length) * 100);
});

// Gate: only unlock if all lessons are marked as viewed/complete
const isLocked = computed(() => {
    // For now, let's say "complete" means viewed in progressStore
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
    if (currentIndex.value < questions.value.length - 1) {
        currentIndex.value++;
        revealed.value = false;
    } else {
        await submitResult();
        step.value = 'result';
    }
};

const submitResult = async () => {
    try {
        await submitExamResult(props.courseId, score.value, questions.value.length);
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
    <div class="exam-container my-16 relative">
        <!-- Background Decorative Glow -->
        <div class="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 opacity-50 blur-[100px]" />

        <!-- Locked State -->
        <div v-if="isLocked" class="glass-card !p-12 !rounded-[3rem] text-center space-y-8 border-2 border-slate-200/50 dark:border-slate-800/50 shadow-2xl animate-fade-up">
            <div class="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto shadow-inner border border-slate-200 dark:border-slate-700">
                <Lock :size="40" class="text-slate-400" />
            </div>
            <div class="space-y-4">
                <h2 class="text-4xl font-black tracking-tight dark:text-white">Exam Locked</h2>
                <p class="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Complete all <span class="font-black text-indigo-500">{{ totalLessons }} lessons</span> in the {{ courseName || 'track' }} curriculum to unlock the professional certification exam.
                </p>
            </div>
            <div class="flex items-center justify-center gap-4 pt-4">
                <div v-for="i in 5" :key="i" class="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" :style="{ animationDelay: `${i * 150}ms` }" />
            </div>
        </div>

        <!-- Not Logged In -->
        <div v-else-if="!auth.isLoggedIn" class="glass-card !p-12 !rounded-[3rem] text-center space-y-6 border-2 border-blue-500/20 shadow-2xl animate-fade-up">
            <div class="w-20 h-20 rounded-[2rem] bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500 border border-blue-500/20 shadow-xl">
                <AlertCircle :size="32" />
            </div>
            <h2 class="text-3xl font-black tracking-tight dark:text-white">Sign In to Take the Exam</h2>
            <p class="text-slate-500 dark:text-slate-400">Your results and certifications need to be saved to your profile.</p>
            <NuxtLink to="/auth" class="inline-flex h-12 items-center justify-center px-8 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20">
                Go to Authentication
            </NuxtLink>
        </div>

        <!-- Main Exam Flow -->
        <div v-else class="glass-card !p-0 !rounded-[3rem] overflow-hidden border-2 border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/10 animate-fade-up">
            <!-- Header -->
            <div class="p-8 border-b-2 border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-lg">
                        <Trophy :size="24" />
                    </div>
                    <div>
                        <h3 class="font-black tracking-tight text-xl dark:text-white">Certification Exam</h3>
                        <p class="text-xs font-black uppercase tracking-widest text-slate-400">{{ courseId.replace(/-/g, ' ') }}</p>
                    </div>
                </div>
                <div v-if="step === 'quiz'" class="flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Question</p>
                        <p class="font-black text-lg">{{ currentIndex + 1 }}/{{ questions.length }}</p>
                    </div>
                    <div class="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative overflow-hidden">
                        <div class="absolute inset-0 bg-indigo-500 origin-bottom transition-all duration-700" :style="{ height: `${progressPercent}%` }" />
                        <span class="relative font-black text-xs mix-blend-difference">{{ progressPercent }}%</span>
                    </div>
                </div>
            </div>

            <!-- Intro Step -->
            <div v-if="step === 'intro'" class="p-12 space-y-10">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div class="space-y-6">
                        <h2 class="text-4xl font-black tracking-tight dark:text-white">Ready for the challenge?</h2>
                        <ul class="space-y-4">
                            <li v-for="(item, idx) in ['70% score required to pass', 'Covers full curriculum', 'Unlimited attempts', 'Earn profile badge']" :key="idx" class="flex items-center gap-3 font-bold text-slate-600 dark:text-slate-300">
                                <CheckCircle2 :size="20" class="text-emerald-500" />
                                {{ item }}
                            </li>
                        </ul>
                        <button @click="startExam" class="h-14 px-10 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20 flex items-center gap-3">
                            Start Assessment <ChevronRight :size="20" />
                        </button>
                    </div>
                    <!-- Previous Results Card -->
                    <div class="bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-200/50 dark:border-slate-700/50 space-y-6">
                        <h4 class="font-black uppercase tracking-widest text-xs text-slate-400">Previous Attempts</h4>
                        <div v-if="prevResults.length > 0" class="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            <div v-for="res in prevResults" :key="res.id" class="flex items-center justify-between p-4 rounded-xl glass-card border">
                                <div>
                                    <p class="font-black" :class="res.passed ? 'text-emerald-500' : 'text-slate-400'">{{ Math.round((res.score / res.total) * 100) }}%</p>
                                    <p class="text-[10px] font-bold opacity-50">{{ formatTime(res.completed_at) }}</p>
                                </div>
                                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm" :class="res.passed ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'">
                                    {{ res.passed ? 'Passed' : 'Failed' }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="text-center py-10 opacity-30 select-none">
                            <BrainCircuit :size="48" class="mx-auto mb-4" />
                            <p class="font-bold text-sm">No attempts yet</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quiz Step -->
            <div v-else-if="step === 'quiz' && questions.length > 0" class="p-12 space-y-10">
                <div class="space-y-6">
                    <h2 class="text-3xl font-black tracking-tight leading-tight dark:text-white min-h-[4rem] animate-fade-up" :key="currentIndex">
                        {{ questions[currentIndex].question }}
                    </h2>
                </div>

                <div class="grid gap-4 animate-fade-up" :key="`options-${currentIndex}`">
                    <div v-if="!revealed" class="glass-card !p-8 !rounded-3xl border-2 border-indigo-500/20 bg-indigo-500/5 text-center space-y-6">
                        <p class="font-bold text-slate-500">Think carefully about the answer...</p>
                        <button @click="revealed = true" class="h-12 px-8 rounded-xl bg-indigo-500 text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20">
                            Reveal Answer
                        </button>
                    </div>
                    <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div class="glass-card !p-8 !rounded-3xl border-2 border-emerald-500 bg-emerald-500/5">
                            <div class="flex items-center gap-3 mb-4 text-emerald-500">
                                <Sparkles :size="20" />
                                <span class="font-black uppercase tracking-widest text-xs">Correct Implementation</span>
                            </div>
                            <p class="text-lg font-bold leading-relaxed dark:text-emerald-100">
                                {{ questions[currentIndex].answer }}
                            </p>
                        </div>
                        <div class="flex items-center justify-between pt-6">
                            <p class="text-sm font-bold text-slate-400">Did you get it right?</p>
                            <div class="flex gap-4">
                                <button @click="handleAnswer(false); nextQuestion()" class="h-12 px-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-black uppercase tracking-widest text-xs hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                                    I missed it
                                </button>
                                <button @click="handleAnswer(true); nextQuestion()" class="h-12 px-8 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 transition-all">
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Result Step -->
            <div v-else-if="step === 'result'" class="p-16 text-center space-y-10 animate-fade-up">
                <div class="relative inline-block">
                    <div class="absolute inset-0 bg-indigo-500/30 blur-[60px] rounded-full animate-pulse" />
                    <div class="relative w-40 h-40 rounded-[3rem] bg-indigo-500 flex items-center justify-center mx-auto shadow-2xl rotate-12 transition-transform duration-700 hover:rotate-0">
                        <span class="text-6xl font-black text-white">{{ Math.round((score / questions.length) * 100) }}%</span>
                    </div>
                </div>
                <div class="space-y-4">
                    <h2 class="text-5xl font-black tracking-tight dark:text-white">{{ score / questions.length >= 0.7 ? 'Assessment Passed!' : 'Needs More training' }}</h2>
                    <p class="text-xl text-slate-500 font-medium">You scored {{ score }} out of {{ questions.length }} correct answers.</p>
                </div>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                    <button @click="startExam" class="h-14 px-10 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20">
                        Retake Assessment
                    </button>
                    <NuxtLink to="/profile" class="h-14 px-10 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black uppercase tracking-widest flex items-center justify-center transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                        View Certifications
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.exam-container {
    perspective: 1000px;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(var(--color-accent-blue), 0.2);
    border-radius: 10px;
}
</style>
