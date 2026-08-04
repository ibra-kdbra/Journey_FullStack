<script setup lang="ts">
interface Step {
    title: string;
    description: string;
    icon?: any;
    status?: "complete" | "current" | "upcoming";
}

defineProps<{
    title: string;
    description?: string;
    steps?: Step[];
    color?: string;
}>();
</script>

<template>
    <div class="py-12 md:py-16">
        <!-- Header -->
        <div v-if="title || description" class="space-y-3 mb-16 text-center">
            <h3 class="text-3xl md:text-4xl font-black tracking-tight text-[rgb(var(--color-text))]">
                {{ title }}
            </h3>
            <p v-if="description" class="text-base md:text-lg text-[rgb(var(--color-text-soft))] max-w-2xl mx-auto px-4">
                {{ description }}
            </p>
        </div>

        <!-- Flowchart Container -->
        <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Slot for arbitrary content if steps are missing -->
            <div v-if="!steps || steps.length === 0" class="prose max-w-none">
                <slot />
            </div>

            <!-- Central Line (Desktop) / Left Line (Mobile) -->
            <div v-else
                class="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-[rgb(var(--color-border))] transform md:-translate-x-1/2 rounded-full">
            </div>

            <div class="space-y-12">
                <!-- Each Step -->
                <div v-for="(step, idx) in steps" :key="idx"
                    class="relative flex flex-col md:flex-row items-center md:items-start md:justify-between w-full group"
                    :class="[idx % 2 === 0 ? 'md:flex-row-reverse' : '']">

                    <!-- Content Card Container -->
                    <div class="w-full md:w-5/12 ml-16 md:ml-0 relative z-10 pt-2 md:pt-0">
                        <div class="surface-card p-6 md:p-7">
                            <div class="flex items-center gap-4 mb-3">
                                <!-- Step Number Badge -->
                                <div class="flex-shrink-0 w-10 h-10 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-blue))] font-black text-lg">
                                    {{ idx + 1 }}
                                </div>
                                <h4 class="text-lg md:text-xl font-bold text-[rgb(var(--color-text))]">
                                    {{ step.title }}
                                </h4>
                            </div>

                            <p class="text-[rgb(var(--color-text-soft))] leading-relaxed text-sm md:text-base">
                                {{ step.description }}
                            </p>
                        </div>
                    </div>

                    <!-- Center Node (Dot) on the Line -->
                    <div class="absolute left-8 md:left-1/2 top-8 w-4 h-4 rounded-full bg-[rgb(var(--color-accent-blue))] border-2 border-[rgb(var(--color-bg))] transform -translate-x-1/2 -translate-y-1/2 z-20">
                    </div>

                    <!-- Spacer for layout balance -->
                    <div class="hidden md:block w-5/12"></div>
                </div>
            </div>
        </div>
    </div>
</template>
