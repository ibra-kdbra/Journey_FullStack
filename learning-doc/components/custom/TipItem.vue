<script setup lang="ts">
import { CheckCircle2 } from "lucide-vue-next";

defineProps<{
    title: string;
    description: string;
}>();
</script>

<template>
    <div
        class="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm transition-all hover:shadow-md">
        <div
            class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 :size="20" />
        </div>
        <div class="space-y-1">
            <h4 class="font-bold text-slate-900 dark:text-white">{{ title }}</h4>
            <p class="text-sm text-muted-foreground leading-relaxed">
                {{ description }}
            </p>
        </div>
    </div>
</template>
