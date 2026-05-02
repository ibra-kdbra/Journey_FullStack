<template>
    <div class="table-wrapper">
        <table class="prose-table">
            <slot />
        </table>
    </div>
</template>

<style scoped>
.table-wrapper {
    margin: 1.5rem 0;
    overflow-x: auto;
    border-radius: var(--card-radius);
    border: 1px solid rgba(var(--color-border), 0.4);
    background: rgba(var(--color-bg-card), 0.5);
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow-sm);
    -webkit-overflow-scrolling: touch;
}

.prose-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9375rem;
}

.prose-table :deep(thead) {
    background: rgba(var(--color-surface), 0.7);
}

.prose-table :deep(thead th) {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    text-align: left;
    color: rgb(var(--color-text-soft));
    border-bottom: 1px solid rgba(var(--color-border), 0.4);
    white-space: nowrap;
}

.prose-table :deep(tbody td) {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(var(--color-border), 0.2);
    color: rgb(var(--color-text-soft));
    line-height: 1.6;
}

.prose-table :deep(tbody tr:last-child td) {
    border-bottom: none;
}

.prose-table :deep(tbody tr) {
    transition: background var(--duration-fast) var(--ease-smooth);
}

.prose-table :deep(tbody tr:nth-child(even)) {
    background: rgba(var(--color-surface), 0.3);
}

.prose-table :deep(tbody tr:hover) {
    background: rgba(var(--color-accent-blue), 0.04);
}
</style>
