<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
    transition: all 0.3s var(--ease-smooth);
}

.page-enter-from {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(4px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-4px);
    filter: blur(4px);
}
</style>
