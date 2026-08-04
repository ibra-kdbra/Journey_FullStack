<script setup lang="ts">
defineProps<{
    title: string;
    description?: string;
    subtitle?: string;
    accent?: string;
    accentColor?: string;
    icon?: string;
}>();
</script>

<template>
    <div class="relative py-14 px-8 md:px-12 rounded-xl bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] mb-12 shadow-sm">
        <div class="relative z-10 max-w-4xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] mb-6">
                <Icon v-if="icon" :name="icon" class="w-4 h-4 text-[rgb(var(--color-accent-blue))]" />
                <span class="text-xs font-bold text-[rgb(var(--color-accent-blue))]">
                    {{ subtitle || 'Systems Architect Track' }}
                </span>
            </div>
            
            <h1 class="text-4xl md:text-6xl font-black tracking-tight mb-6 text-[rgb(var(--color-text))]">
                {{ title }}
            </h1>
            
            <p v-if="description" class="text-lg md:text-xl text-[rgb(var(--color-text-soft))] max-w-2xl leading-relaxed mb-8">
                {{ description }}
            </p>
            
            <div class="flex flex-wrap gap-4">
               <slot />
            </div>
        </div>
    </div>
</template>
