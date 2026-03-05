<template>
    <code class="prose-inline-code">
        <slot />
    </code>
</template>

<style scoped>
.prose-inline-code {
    font-family: var(--font-mono);
    font-size: 0.85em;
    font-weight: 500;
    padding: 0.15em 0.45em;
    border-radius: 0.375rem;
    background: rgba(var(--color-accent-blue), 0.07);
    color: rgb(var(--color-accent-blue));
    border: 1px solid rgba(var(--color-accent-blue), 0.12);
    transition: all var(--duration-fast) var(--ease-smooth);
    white-space: nowrap;
}

.prose-inline-code:hover {
    background: rgba(var(--color-accent-blue), 0.12);
    border-color: rgba(var(--color-accent-blue), 0.2);
    box-shadow: 0 0 8px rgba(var(--color-accent-blue), 0.08);
}
</style>
