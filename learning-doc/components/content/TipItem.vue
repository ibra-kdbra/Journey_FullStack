<script setup lang="ts">
import { Lightbulb, Info, AlertTriangle, CheckCircle2 } from "lucide-vue-next";

const props = defineProps<{
    title: string;
    description?: string;
    type?: 'tip' | 'info' | 'warning' | 'success';
}>();

const iconMap = {
    tip: Lightbulb,
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2
};

const colorMap = {
    tip: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
    info: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30',
    warning: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
};

const currentType = props.type || 'tip';
</script>

<template>
    <div class="flex gap-4 p-5 my-6 rounded-lg border" :class="colorMap[currentType]">
        <div class="flex-shrink-0 mt-0.5">
            <component :is="iconMap[currentType]" :size="20" />
        </div>

        <div class="flex-grow space-y-1">
            <h4 class="text-base font-bold tracking-tight">
                {{ title }}
            </h4>
            <div class="text-sm font-normal leading-relaxed opacity-90">
                <slot>
                    {{ description }}
                </slot>
            </div>
        </div>
    </div>
</template>
