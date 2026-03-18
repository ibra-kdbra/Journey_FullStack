<script setup lang="ts">
import { LucideBook, LucideClock, LucideZap, LucideTerminal } from 'lucide-vue-next';

interface Stat {
    label: string;
    value: string;
    icon: 'book' | 'clock' | 'zap' | 'terminal';
}

defineProps<{
    stats: Stat[];
}>();

const iconMap = {
    book: LucideBook,
    clock: LucideClock,
    zap: LucideZap,
    terminal: LucideTerminal
};
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div v-for="(stat, idx) in stats" :key="idx" 
             class="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-500 group"
             v-motion
             :initial="{ opacity: 0, y: 20 }"
             :visible-once="{ opacity: 1, y: 0, transition: { delay: idx * 100 } }">
            
            <div class="mb-6 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <component :is="iconMap[stat.icon]" class="w-7 h-7" />
            </div>
            
            <div class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {{ stat.value }}
            </div>
            
            <div class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                {{ stat.label }}
            </div>
        </div>
    </div>
</template>
