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
    window.addEventListener("scroll", updateProgress);
});

onUnmounted(() => {
    window.removeEventListener("scroll", updateProgress);
});
</script>

<template>
    <div class="fixed top-0 left-0 w-full h-1 z-[100]">
        <div class="h-full bg-blue-600 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
            :style="{ width: `${progress}%` }" />
    </div>
</template>
