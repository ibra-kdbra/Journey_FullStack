<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

onMounted(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            // In Nuxt Content / standard apps, search is usually a custom trigger or /search route
            // For now, let's redirect to a search page or focus a search input if it exists
            const searchInput = document.querySelector<HTMLInputElement>(
                'input[type="search"]',
            );
            if (searchInput) {
                searchInput.focus();
            } else {
                navigateTo("/search");
            }
        }
    };

    window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
    // Logic to remove listener would go here if we used a named function
});
</script>

<template>
    <!-- Invisible component -->
    <div />
</template>
