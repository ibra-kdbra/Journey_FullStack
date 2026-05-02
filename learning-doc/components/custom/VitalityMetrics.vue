<script setup lang="ts">
import { useProgress } from "~/composables/useProgress";
import { 
    Zap, 
    Flame, 
    Trophy, 
    Calendar,
    Activity,
    Info,
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
    return xpInCurrentLevel.value; // Since each level is 100 XP
});

// Mock heatmap data for visual excellence if log is empty
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
    if (count === 0) return 'bg-surface-soft opacity-20';
    if (count < 2) return 'bg-accent-blue opacity-40';
    if (count < 5) return 'bg-accent-blue opacity-70';
    return 'bg-accent-blue opacity-100';
};

const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
</script>

<template>
    <div v-if="vitality" class="space-y-6">
        <!-- Main Vitality Header Card -->
        <div class="glass-card !p-8 relative overflow-hidden group">
            <!-- Background Decorative Elements -->
            <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                :style="{ background: `rgb(var(--color-accent-blue))` }" />
            
            <div class="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <!-- Level Circle -->
                <div class="relative flex-shrink-0">
                    <svg class="w-32 h-32 transform -rotate-90">
                        <circle
                            cx="64" cy="64" r="58"
                            stroke="currentColor"
                            stroke-width="8"
                            fill="transparent"
                            class="text-surface-soft opacity-10"
                        />
                        <circle
                            cx="64" cy="64" r="58"
                            stroke="currentColor"
                            stroke-width="8"
                            fill="transparent"
                            stroke-dasharray="364.4"
                            :stroke-dashoffset="364.4 - (364.4 * progressToNextLevel) / 100"
                            class="text-accent-blue transition-all duration-1000 ease-out"
                            stroke-linecap="round"
                        />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-xs font-bold uppercase tracking-tighter opacity-60">Level</span>
                        <span class="text-4xl font-black text-white">{{ vitalityLevel }}</span>
                    </div>
                </div>

                <!-- Stats Info -->
                <div class="flex-grow space-y-4 text-center md:text-left">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2"
                            :style="{ background: `rgba(var(--color-accent-blue), 0.1)`, color: `rgb(var(--color-accent-blue))` }">
                            <Sparkles :size="10" />
                            Vitality Standing
                        </div>
                        <h3 class="text-2xl font-black text-white">System Vitality</h3>
                        <p class="text-sm text-soft mt-1">
                            Your recursive learning engagement score across the ecosystem.
                        </p>
                    </div>

                    <div class="flex flex-wrap justify-center md:justify-start gap-6">
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-blue/10 text-accent-blue">
                                <Zap :size="20" />
                            </div>
                            <div>
                                <div class="text-[10px] font-bold uppercase tracking-wider opacity-50">Total XP</div>
                                <div class="text-lg font-black text-white">{{ vitality.total_xp }}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-orange/10 text-accent-orange">
                                <Flame :size="20" />
                            </div>
                            <div>
                                <div class="text-[10px] font-bold uppercase tracking-wider opacity-50">Streak</div>
                                <div class="text-lg font-black text-white">{{ vitality.streak_count }} Days</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-amber/10 text-accent-amber">
                                <Trophy :size="20" />
                            </div>
                            <div>
                                <div class="text-[10px] font-bold uppercase tracking-wider opacity-50">Best</div>
                                <div class="text-lg font-black text-white">{{ vitality.longest_streak }} Days</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Activity Grid & Breakdown -->
        <div class="grid md:grid-cols-3 gap-6">
            <!-- Heatmap Card -->
            <div class="md:col-span-2 glass-card !p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold flex items-center gap-2 text-white">
                        <Activity :size="18" class="text-accent-blue" />
                        Engagement History
                    </h4>
                    <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Last 28 Days</span>
                </div>

                <div class="flex flex-wrap gap-2">
                    <div 
                        v-for="day in heatmapData" 
                        :key="day.date"
                        class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-help group/day"
                        :class="getIntensityClass(day.count)"
                    >
                        <!-- Tooltip -->
                        <div class="absolute bottom-full mb-2 hidden group-hover/day:block z-50">
                            <div class="bg-surface-card border border-white/10 p-2 rounded-lg shadow-xl text-[10px] whitespace-nowrap">
                                <div class="font-black">{{ formatDateShort(day.date) }}</div>
                                <div class="text-soft">{{ day.count }} actions</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                    <span>Less</span>
                    <div class="flex gap-1">
                        <div class="w-2 h-2 rounded-full bg-surface-soft opacity-20"></div>
                        <div class="w-2 h-2 rounded-full bg-accent-blue opacity-40"></div>
                        <div class="w-2 h-2 rounded-full bg-accent-blue opacity-70"></div>
                        <div class="w-2 h-2 rounded-full bg-accent-blue opacity-100"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>

            <!-- Perks/Status Card -->
            <div class="glass-card !p-6 space-y-4 flex flex-col">
                <h4 class="font-bold flex items-center gap-2 text-white">
                    <Trophy :size="18" class="text-accent-amber" />
                    Next Milestone
                </h4>
                
                <div class="flex-grow flex flex-col justify-center items-center text-center p-4">
                    <div class="w-16 h-16 rounded-3xl bg-surface-soft/30 flex items-center justify-center mb-4 border border-white/5">
                        <Trophy :size="32" class="opacity-30" />
                    </div>
                    <div class="text-sm font-bold text-white">Veteran Scholar</div>
                    <p class="text-[11px] text-soft mt-1">Reach Level 5 to unlock exclusive architecture audits.</p>
                </div>

                <button class="w-full btn-secondary !py-2 !rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    View All Badges
                    <ChevronRight :size="14" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.text-soft {
    color: rgb(var(--color-text-soft));
}
.bg-surface-soft {
    background-color: rgb(var(--color-surface-soft));
}
.text-accent-blue {
    color: rgb(var(--color-accent-blue));
}
.bg-accent-blue {
    background-color: rgb(var(--color-accent-blue));
}
.text-accent-orange {
    color: rgb(234, 88, 12);
}
.bg-accent-orange {
    background-color: rgb(234, 88, 12);
}
.text-accent-amber {
    color: rgb(var(--color-accent-amber));
}
.bg-accent-amber {
    background-color: rgb(var(--color-accent-amber));
}
.bg-surface-card {
    background-color: rgb(var(--color-bg-card));
}
</style>
