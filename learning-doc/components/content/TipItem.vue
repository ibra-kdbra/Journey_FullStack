<script setup lang="ts">
import { Lightbulb, Info, AlertTriangle, CheckCircle2 } from "lucide-vue-next";

const props = defineProps<{
    title: string;
    description: string;
    type?: 'tip' | 'info' | 'warning' | 'success';
}>();

const iconMap = {
    tip: Lightbulb,
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2
};

const colorMap = {
    tip: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    info: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    warning: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    success: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
};

const currentType = props.type || 'tip';
</script>

<template>
    <div
        class="group relative overflow-hidden flex gap-5 p-6 my-8 rounded-[2rem] border transition-all duration-500 hover:-translate-y-1"
        :class="[
            colorMap[currentType],
            'glass-card bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-2xl'
        ]"
    >
        <!-- Decorative background glow -->
        <div class="absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 rounded-full"
            :class="colorMap[currentType].split(' ')[1]" />

        <div class="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
            :class="colorMap[currentType].split(' ').slice(1).join(' ')">
            <component :is="iconMap[currentType]" :size="24" />
        </div>

        <div class="flex-grow space-y-2">
            <h4 class="text-lg font-black tracking-tight" :class="colorMap[currentType].split(' ')[0]">
                {{ title }}
            </h4>
            <div class="text-sm font-medium leading-relaxed opacity-80 dark:text-slate-300">
                <slot>
                    {{ description }}
                </slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
.glass-card {
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
}

dark .glass-card {
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
}
</style>
