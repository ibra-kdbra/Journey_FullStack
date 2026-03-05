<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
    items: { name: string; color: string; description: string }[];
}>();

const activeIndex = ref(0);
</script>

<template>
    <div class="relative flex flex-col items-center gap-12 py-12">
        <div class="relative w-64 h-64 md:w-80 md:h-80">
            <!-- Simple CSS-based color wheel implementation -->
            <div class="absolute inset-0 rounded-full border-8 border-slate-100 dark:border-slate-800" />
            <div v-for="(item, idx) in items" :key="idx"
                class="absolute w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer transition-all hover:scale-110 shadow-lg flex items-center justify-center text-white font-bold"
                :style="{
                    backgroundColor: item.color,
                    top: `${50 - 40 * Math.cos((2 * Math.PI * idx) / items.length)}%`,
                    left: `${50 + 40 * Math.sin((2 * Math.PI * idx) / items.length)}%`,
                    transform: `translate(-50%, -50%) ${activeIndex === idx ? 'scale(1.2)' : ''}`,
                }" @click="activeIndex = idx">
                {{ idx + 1 }}
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                    <div class="text-3xl font-black text-primary">
                        {{ items[activeIndex]?.name }}
                    </div>
                    <div class="text-xs uppercase tracking-widest text-muted-foreground">
                        Active
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-md text-center animate-in fade-in slide-in-from-bottom-2 duration-300" :key="activeIndex">
            <p class="text-lg text-muted-foreground">
                {{ items[activeIndex]?.description }}
            </p>
        </div>
    </div>
</template>
