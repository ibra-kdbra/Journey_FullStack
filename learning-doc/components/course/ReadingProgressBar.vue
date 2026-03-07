<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const progress = ref(0);

const updateProgress = () => {
    const currentProgress = window.scrollY;
    const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight) {
        progress.value = Number((currentProgress / scrollHeight).toFixed(2)) * 100;
    }
};

onMounted(() => {
    window.addEventListener("scroll", updateProgress, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener("scroll", updateProgress);
});
</script>

<template>
    <div class="fixed top-0 left-0 w-full h-[3px] z-[100]">
        <div class="h-full transition-all duration-150 ease-out"
            :style="{
                width: `${progress}%`,
                background: `var(--gradient-hero)`,
                boxShadow: `0 0 ${8 + progress * 0.2}px rgba(var(--color-accent-blue), ${0.3 + progress * 0.005}),
                             0 0 ${15 + progress * 0.3}px rgba(var(--color-accent-violet), ${0.15 + progress * 0.003})`
            }" />
    </div>
</template>
