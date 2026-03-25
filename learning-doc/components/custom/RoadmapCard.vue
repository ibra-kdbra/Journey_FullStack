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
    <div class="py-16 md:py-24 overflow-hidden">
        <!-- Header -->
        <div v-if="title || description" class="space-y-4 mb-20 text-center relative z-10" v-motion-fade-visible-once>
            <h3
                class="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent inline-block pb-4 pt-2"
                :class="!color ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400' : ''"
                :style="{ backgroundImage: color ? `linear-gradient(to right, ${color}, ${color}CC)` : '' }">
                {{ title }}
            </h3>
            <p v-if="description" class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                {{ description }}
            </p>
        </div>

        <!-- Flowchart Container -->
        <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Slot for arbitrary content if steps are missing -->
            <div v-if="!steps || steps.length === 0" class="relative z-10 prose prose-slate dark:prose-invert max-w-none">
                <slot />
            </div>

            <!-- Central Line (Desktop) / Left Line (Mobile) -->
            <div v-else
                class="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/20 via-blue-500/50 to-blue-500/20 dark:from-blue-500/10 dark:via-blue-500/30 dark:to-blue-500/10 transform md:-translate-x-1/2 rounded-full">
            </div>

            <div class="space-y-16">
                <!-- Each Step -->
                <div v-for="(step, idx) in steps" :key="idx"
                    class="relative flex flex-col md:flex-row items-center md:items-start md:justify-between w-full group"
                    :class="[idx % 2 === 0 ? 'md:flex-row-reverse' : '']" v-motion :initial="{ opacity: 0, y: 50 }"
                    :visible-once="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 12, delay: 50 } }">

                    <!-- Content Card Container -->
                    <div class="w-full md:w-5/12 ml-16 md:ml-0 relative z-10 pt-2 md:pt-0">

                        <!-- Content Card -->
                        <div
                            class="p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 hover:ring-blue-500/50 dark:hover:ring-blue-500/50 shadow-xl dark:shadow-2xl dark:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">

                            <div class="flex items-center gap-5 mb-4">
                                <!-- Step Number Badge -->
                                <div
                                    class="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-xl md:text-2xl shadow-inner border border-blue-100/50 dark:border-blue-800/50 group-hover:scale-110 transition-transform duration-300">
                                    {{ idx + 1 }}
                                </div>
                                <h4 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{{ step.title
                                    }}</h4>
                            </div>

                            <!-- Connecting Line (Desktop) -->
                            <div class="hidden md:block absolute top-10 w-12 h-[2px] bg-gradient-to-r from-blue-500/50 to-indigo-500/50 transition-all duration-300 group-hover:w-14 group-hover:bg-blue-500"
                                :class="idx % 2 === 0 ? '-left-12' : '-right-12'"></div>

                            <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-base md:text-lg pl-0">
                                {{ step.description }}
                            </p>
                        </div>
                    </div>

                    <!-- Center Node (Dot) on the Line -->
                    <div class="absolute left-8 md:left-1/2 top-10 w-6 h-6 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-950 transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-20 transition-all duration-500 group-hover:scale-[1.5] group-hover:bg-indigo-400"
                        v-motion-pop-visible-once="{ delay: 200 }">
                        <div class="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-500"></div>
                        <div class="w-2 h-2 rounded-full bg-white dark:bg-slate-950 m-[8px]"></div>
                    </div>

                    <!-- Spacer for layout balance -->
                    <div class="hidden md:block w-5/12"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Smooth rendering for motions */
.v-motion {
    will-change: transform, opacity;
}
</style>
