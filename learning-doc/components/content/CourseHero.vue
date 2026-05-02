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
    <div class="relative py-24 px-6 md:px-12 rounded-[3rem] overflow-hidden mb-16 shadow-2xl transition-all duration-500 hover:shadow-blue-500/30 hover:-translate-y-1" v-motion-fade-visible-once>
        <!-- Background Orbs -->
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
        
        <!-- Main Content -->
        <div class="relative z-10 max-w-4xl">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 overflow-hidden group">
                <div v-if="icon" class="flex items-center gap-2">
                    <Icon :name="icon" class="w-4 h-4 text-blue-500" />
                </div>
                <div v-else class="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                <span class="text-xs font-bold tracking-widest uppercase text-slate-800 dark:text-blue-300">
                    {{ subtitle || 'Principal Architect Curriculum' }}
                </span>
            </div>
            
            <h1 class="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
                <span class="bg-clip-text text-transparent inline-block pb-8 pt-2 bg-gradient-to-r from-slate-950 via-blue-800 to-slate-900 dark:from-white dark:via-blue-300 dark:to-slate-400"
                    :style="{ backgroundImage: accent ? `linear-gradient(to right, ${accent}, ${accent}CC)` : '' }">
                    {{ title }}
                </span>
            </h1>
            
            <p v-if="description" class="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-10">
                {{ description }}
            </p>
            
            <div class="flex flex-wrap gap-4">
               <slot />
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-pulse {
    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.1; transform: scale(1); }
    50% { opacity: 0.2; transform: scale(1.1); }
}
</style>
