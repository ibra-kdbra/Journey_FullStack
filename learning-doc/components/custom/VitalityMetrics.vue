<script setup lang="ts">
import { useProgress } from "~/composables/useProgress";
import { 
    Zap, 
    Flame, 
    Trophy, 
    Activity,
    ChevronRight,
    Sparkles
} from "lucide-vue-next";
import { computed } from "vue";

const progress = useProgress();

const vitality = computed(() => progress.vitality);

const vitalityLevel = computed(() => {
    if (!vitality.value) return 1;
    return Math.floor(vitality.value.total_xp / 100) + 1;
});

const xpInCurrentLevel = computed(() => {
    if (!vitality.value) return 0;
    return vitality.value.total_xp % 100;
});

const progressToNextLevel = computed(() => {
    return xpInCurrentLevel.value;
});

const heatmapData = computed(() => {
    if (!vitality.value) return [];
    
    const data = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = vitality.value.activity_log[dateStr] || 0;
        data.push({ date: dateStr, count });
    }
    return data;
});

const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]';
    if (count < 2) return 'bg-blue-500/30 border border-blue-500/40 text-blue-600';
    if (count < 5) return 'bg-blue-500/60 border border-blue-500/70 text-white';
    return 'bg-blue-600 text-white font-bold';
};

const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
</script>

<template>
    <div v-if="vitality" class="space-y-6">
        <!-- Main Vitality Header Card -->
        <div class="surface-card p-6 md:p-8">
            <div class="flex flex-col md:flex-row gap-6 items-center">
                <!-- Level Circle -->
                <div class="relative flex-shrink-0">
                    <svg class="w-28 h-28 transform -rotate-90">
                        <circle
                            cx="56" cy="56" r="48"
                            stroke="currentColor"
                            stroke-width="7"
                            fill="transparent"
                            class="text-[rgb(var(--color-border))]"
                        />
                        <circle
                            cx="56" cy="56" r="48"
                            stroke="currentColor"
                            stroke-width="7"
                            fill="transparent"
                            stroke-dasharray="301.5"
                            :stroke-dashoffset="301.5 - (301.5 * progressToNextLevel) / 100"
                            class="text-[rgb(var(--color-accent-blue))] transition-all duration-700 ease-out"
                            stroke-linecap="round"
                        />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">Level</span>
                        <span class="text-3xl font-black text-[rgb(var(--color-text))]">{{ vitalityLevel }}</span>
                    </div>
                </div>

                <!-- Stats Info -->
                <div class="flex-grow space-y-3 text-center md:text-left">
                    <div>
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5 bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-accent-blue))] border border-[rgb(var(--color-border))]">
                            <Sparkles :size="10" />
                            Vitality Metrics
                        </div>
                        <h3 class="text-xl font-bold text-[rgb(var(--color-text))]">Systems Learning Score</h3>
                        <p class="text-xs text-[rgb(var(--color-text-soft))] mt-0.5">
                            Track your active study consistency and XP progression across disciplines.
                        </p>
                    </div>

                    <div class="flex flex-wrap justify-center md:justify-start gap-5">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-blue))]">
                                <Zap :size="16" />
                            </div>
                            <div>
                                <div class="text-[10px] font-bold uppercase text-[rgb(var(--color-text-muted))]">Total XP</div>
                                <div class="text-base font-black text-[rgb(var(--color-text))]">{{ vitality.total_xp }}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-amber-600">
                                <Flame :size="16" />
                            </div>
                            <div>
                                <div class="text-[10px] font-bold uppercase text-[rgb(var(--color-text-muted))]">Active Streak</div>
                                <div class="text-base font-black text-[rgb(var(--color-text))]">{{ vitality.streak_count }} Days</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-emerald-600">
                                <Trophy :size="16" />
                            </div>
                            <div>
                                <div class="text-[10px] font-bold uppercase text-[rgb(var(--color-text-muted))]">Longest Streak</div>
                                <div class="text-base font-black text-[rgb(var(--color-text))]">{{ vitality.longest_streak }} Days</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Activity Grid & Breakdown -->
        <div class="grid md:grid-cols-3 gap-6">
            <!-- Heatmap Card -->
            <div class="md:col-span-2 surface-card p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold flex items-center gap-2 text-sm text-[rgb(var(--color-text))]">
                        <Activity :size="16" class="text-[rgb(var(--color-accent-blue))]" />
                        28-Day Study Heatmap
                    </h4>
                </div>

                <div class="flex flex-wrap gap-1.5">
                    <div 
                        v-for="day in heatmapData" 
                        :key="day.date"
                        class="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-help text-[10px] font-semibold"
                        :class="getIntensityClass(day.count)"
                        :title="`${formatDateShort(day.date)}: ${day.count} activities`"
                    >
                        {{ day.count > 0 ? day.count : '' }}
                    </div>
                </div>
            </div>

            <!-- Perks/Status Card -->
            <div class="surface-card p-6 space-y-3 flex flex-col justify-between">
                <h4 class="font-bold flex items-center gap-2 text-sm text-[rgb(var(--color-text))]">
                    <Trophy :size="16" class="text-amber-500" />
                    Next Rank Target
                </h4>
                
                <div class="text-center p-3">
                    <div class="text-sm font-bold text-[rgb(var(--color-text))]">Systems Architect Tier</div>
                    <p class="text-xs text-[rgb(var(--color-text-soft))] mt-1">Reach 500 XP to unlock Principal Exam Certifications.</p>
                </div>

                <button class="btn-secondary w-full !py-2 text-xs">
                    View Achievement Badges <ChevronRight :size="14" />
                </button>
            </div>
        </div>
    </div>
</template>
