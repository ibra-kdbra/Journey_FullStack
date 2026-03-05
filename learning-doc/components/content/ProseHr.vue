<template>
    <hr class="prose-hr" />
</template>

<style scoped>
.prose-hr {
    border: none;
    height: 1px;
    margin: 3rem 0;
    background: linear-gradient(to right,
            transparent,
            rgba(var(--color-accent-blue), 0.3),
            rgba(var(--color-accent-violet), 0.3),
            transparent);
    position: relative;
}

.prose-hr::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gradient-accent);
    opacity: 0.5;
}
</style>
