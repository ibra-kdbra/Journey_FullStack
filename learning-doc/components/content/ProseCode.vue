<template>
    <code class="prose-inline-code">
        <slot />
    </code>
</template>

<style scoped>
.prose-inline-code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    font-weight: 700;
    padding: 0.2em 0.5em;
    border-radius: 0.5rem;
    background: rgba(var(--color-accent-blue), 0.08);
    color: rgb(var(--color-accent-blue));
    border: 1px solid rgba(var(--color-accent-blue), 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
}

.prose-inline-code:hover {
    background: rgba(var(--color-accent-blue), 0.15);
    border-color: rgba(var(--color-accent-blue), 0.3);
    box-shadow: 0 4px 12px rgba(var(--color-accent-blue), 0.1);
    transform: translateY(-1px);
}
</style>
