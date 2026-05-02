<template>
    <blockquote class="prose-blockquote">
        <div class="quote-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
        </div>
        <div class="quote-content">
            <slot />
        </div>
    </blockquote>
</template>

<style scoped>
.prose-blockquote {
    position: relative;
    margin: 2rem 0;
    padding: 1.25rem 1.5rem 1.25rem 1.75rem;
    border-left: 3px solid transparent;
    border-image: var(--gradient-accent) 1;
    border-radius: 0 var(--card-radius) var(--card-radius) 0;
    background: rgba(var(--color-accent-violet), 0.04);
    backdrop-filter: blur(8px);
    font-style: italic;
    color: rgb(var(--color-text-soft));
    transition: all var(--duration-base) var(--ease-smooth);
}

.prose-blockquote:hover {
    background: rgba(var(--color-accent-violet), 0.07);
}

.quote-icon {
    position: absolute;
    top: -0.75rem;
    right: 1.25rem;
    color: rgba(var(--color-accent-violet), 0.15);
    transform: scaleX(-1);
}

.quote-content :deep(p) {
    margin: 0;
    line-height: 1.7;
}

.quote-content :deep(p + p) {
    margin-top: 0.75rem;
}
</style>
