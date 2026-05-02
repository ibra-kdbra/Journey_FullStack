<template>
    <figure class="prose-img-wrapper" @click="toggleZoom">
        <img :src="src" :alt="alt" :width="width" :height="height" class="prose-img" :class="{ zoomed }"
            loading="lazy" />
        <figcaption v-if="alt" class="prose-img-caption">{{ alt }}</figcaption>

        <!-- Lightbox -->
        <Teleport to="body">
            <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="zoomed" class="lightbox" @click.self="toggleZoom">
                    <img :src="src" :alt="alt" class="lightbox-img" />
                    <button @click="toggleZoom" class="lightbox-close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </Transition>
        </Teleport>
    </figure>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
    src: { type: String, default: "" },
    alt: { type: String, default: "" },
    width: { type: [String, Number], default: undefined },
    height: { type: [String, Number], default: undefined },
});

const zoomed = ref(false);

const toggleZoom = () => {
    zoomed.value = !zoomed.value;
    if (zoomed.value) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};
</script>

<style scoped>
.prose-img-wrapper {
    margin: 2rem 0;
    cursor: zoom-in;
}

.prose-img {
    border-radius: var(--card-radius);
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(var(--color-border), 0.3);
    transition: all var(--duration-base) var(--ease-smooth);
    width: 100%;
    height: auto;
}

.prose-img:hover {
    box-shadow: var(--shadow-lg);
    border-color: rgba(var(--color-accent-blue), 0.2);
}

.prose-img-caption {
    text-align: center;
    margin-top: 0.75rem;
    font-size: 0.8125rem;
    color: rgb(var(--color-text-muted));
    font-style: italic;
}

/* Lightbox */
.lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    padding: 2rem;
    cursor: zoom-out;
}

.lightbox-img {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: var(--card-radius);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    object-fit: contain;
}

.lightbox-close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: white;
    opacity: 0.7;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-smooth);
}

.lightbox-close:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
}
</style>
