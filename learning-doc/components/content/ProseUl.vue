<template>
    <ul class="prose-ul">
        <slot />
    </ul>
</template>

<style scoped>
.prose-ul {
    margin: 1.25rem 0;
    padding-left: 0;
    list-style: none;
}

.prose-ul :deep(> li) {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.75;
    color: rgb(var(--color-text-soft));
}

.prose-ul :deep(> li)::before {
    content: '';
    position: absolute;
    left: 0.25rem;
    top: 0.7em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gradient-accent);
    opacity: 0.7;
    transition: opacity var(--duration-fast) var(--ease-smooth),
        transform var(--duration-fast) var(--ease-smooth);
}

.prose-ul :deep(> li):hover::before {
    opacity: 1;
    transform: scale(1.3);
}

/* Nested lists */
.prose-ul :deep(ul) {
    margin: 0.5rem 0;
    padding-left: 0;
    list-style: none;
}

.prose-ul :deep(ul > li)::before {
    border-radius: 1px;
    width: 5px;
    height: 5px;
    background: none;
    border: 1.5px solid rgb(var(--color-accent-violet));
    opacity: 0.5;
}

.prose-ul :deep(ul > li):hover::before {
    opacity: 0.8;
}
</style>
