<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
    error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
    <div class="error-container">
        <div class="bear-link-wrapper">
            <a class="bear-link" href="https://codeberg.org/ibra-kdbra/Live_Wallpapers" target="_blank"
                rel="noreferrer noopener">
                <svg class="w-9" viewBox="0 0 969 955" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="161.191" cy="320.191" r="133.191" stroke="currentColor" stroke-width="20"></circle>
                    <circle cx="806.809" cy="320.191" r="133.191" stroke="currentColor" stroke-width="20"></circle>
                    <circle cx="695.019" cy="587.733" r="31.4016" fill="currentColor"></circle>
                    <circle cx="272.981" cy="587.733" r="31.4016" fill="currentColor"></circle>
                    <path
                        d="M564.388 712.083C564.388 743.994 526.035 779.911 483.372 779.911C440.709 779.911 402.356 743.994 402.356 712.083C402.356 680.173 440.709 664.353 483.372 664.353C526.035 664.353 564.388 680.173 564.388 712.083Z"
                        fill="currentColor"></path>
                    <rect x="310.42" y="448.31" width="343.468" height="51.4986" fill="#FF1E1E"></rect>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M745.643 288.24C815.368 344.185 854.539 432.623 854.539 511.741H614.938V454.652C614.938 433.113 597.477 415.652 575.938 415.652H388.37C366.831 415.652 349.37 433.113 349.37 454.652V511.741L110.949 511.741C110.949 432.623 150.12 344.185 219.845 288.24C289.57 232.295 384.138 200.865 482.744 200.865C581.35 200.865 675.918 232.295 745.643 288.24Z"
                        fill="currentColor"></path>
                </svg>
            </a>
        </div>

        <h1>
            {{ error?.statusCode === 404 ? '404' : error?.statusCode || 'Error' }}
            <span aria-hidden="true">{{ error?.statusCode === 404 ? '404' : error?.statusCode || 'Error' }}</span>
        </h1>
        <div class="cloak__wrapper">
            <div class="cloak__container">
                <div class="cloak"></div>
            </div>
        </div>
        <div class="info">
            <p v-if="error?.statusCode === 404">
                We're fairly sure that page used to be here, but seems to have gone
                missing. We do apologise on it's behalf.
            </p>
            <p v-else>
                {{ error?.statusMessage || 'An unexpected runtime error occurred.' }}
            </p>
            <div class="flex items-center justify-center gap-4 mt-4">
                <button @click="handleError" class="follow cursor-pointer bg-transparent">Go Home</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@800&family=Roboto:wght@100;300&display=swap');

/* Extracting variables and globals to a container to scope the CSS safely and prevent bleeding */
.error-container {
    --shadow: hsl(0 0% 0% / 0.9);
    --bg: hsl(0 0% 70%);
    --header: hsl(0 0% 65%);
    --lit-header: hsl(0 0% 100%);
    --speed: 2s;
    --ease: linear(0 0%,
            0.0036 9.62%,
            0.0185 16.66%,
            0.0489 23.03%,
            0.0962 28.86%,
            0.1705 34.93%,
            0.269 40.66%,
            0.3867 45.89%,
            0.5833 52.95%,
            0.683 57.05%,
            0.7829 62.14%,
            0.8621 67.46%,
            0.8991 70.68%,
            0.9299 74.03%,
            0.9545 77.52%,
            0.9735 81.21%,
            0.9865 85%,
            0.9949 89.15%,
            1 100%);
    color-scheme: dark only;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 1rem;
    background: var(--bg);
    font-family: 'Roboto', 'SF Pro Text', 'SF Pro Icons', 'AOS Icons',
        'Helvetica Neue', Helvetica, Arial, sans-serif, system-ui;
    perspective: 1200px;
    position: relative;
    z-index: 10;
    overflow: hidden;
}

.error-container::before {
    --size: 45px;
    --line: color-mix(in lch, canvas, transparent 85%);
    content: '';
    height: 100vh;
    width: 100vw;
    position: fixed;
    background: linear-gradient(90deg,
            var(--line) 1px,
            transparent 1px var(--size)) 50% 50% / var(--size) var(--size),
        linear-gradient(var(--line) 1px, transparent 1px var(--size)) 50% 50% / var(--size) var(--size);
    -webkit-mask: linear-gradient(-35deg, transparent 30%, white);
    mask: linear-gradient(-35deg, transparent 30%, white);
    top: 0;
    left: 0;
    transform-style: flat;
    pointer-events: none;
    z-index: -1;
}

@property --swing-x {
    initial-value: 0;
    inherits: false;
    syntax: '<integer>';
}

@property --swing-y {
    initial-value: 0;
    inherits: false;
    syntax: '<integer>';
}

.error-container p {
    font-weight: 100;
}

.error-container h1 {
    -webkit-animation: swing var(--speed) infinite alternate var(--ease);
    animation: swing var(--speed) infinite alternate var(--ease);
    font-size: clamp(5rem, 40vmin, 20rem);
    font-family: 'Open Sans', sans-serif;
    margin: 0;
    letter-spacing: 1rem;
    transform: translate3d(0, 0, 0vmin);
    --x: calc(50% + (var(--swing-x) * 0.5) * 1%);
    background: radial-gradient(var(--lit-header), var(--header) 45%) var(--x) 100%/200% 200%;
    -webkit-background-clip: text;
    color: transparent;
    position: relative;
    z-index: 1;
}

.error-container h1 span {
    -webkit-animation: swing var(--speed) infinite alternate var(--ease);
    animation: swing var(--speed) infinite alternate var(--ease);
    position: absolute;
    top: 0;
    left: 0;
    color: var(--shadow);
    filter: blur(1.5vmin);
    transform: scale(1.05) translate3d(0, 12%, -10vmin) translate(calc((var(--swing-x) * 0.05) * 1%),
            calc((var(--swing-y) * -0.025) * 1%));
}

.cloak {
    animation: swing var(--speed) infinite alternate-reverse var(--ease);
    height: 100%;
    width: 100%;
    transform-origin: 50% 25%;
    transform: rotate(calc(var(--swing-x) * -0.25deg));
    background: radial-gradient(40% 40% at 50% calc(42% + (var(--swing-y) * 0.01%)),
            transparent,
            hsl(0 0% 2% / 0.94) 38vmax);
}

.cloak__wrapper {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
}

.cloak__container {
    height: 250vmax;
    width: 250vmax;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.info {
    color: color-mix(in lch, canvasText, transparent 75%);
    text-align: center;
    line-height: 1.5;
    width: 44ch;
    max-width: calc(100% - 2rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: color 0.25s var(--ease);
    z-index: 2;
    position: relative;
}

.info:is(:hover, :focus-within) {
    color: canvasText;
}

.info p {
    --x: calc(50% + (var(--swing-x) * 0.5) * 1%);
    animation: swing var(--speed) infinite alternate-reverse var(--ease);
    background: radial-gradient(50% 250% at var(--x) -50%,
            color-mix(in lch, canvasText, transparent 25%),
            color-mix(in lch, canvasText, transparent 75%));
    -webkit-background-clip: text;
    color: transparent;
}

.error-container p::-moz-selection {
    background: hotpink;
    color: canvas;
}

.error-container p::selection {
    background: hotpink;
    color: canvas;
}

.follow {
    border-radius: 6px;
    border: 1px solid currentColor;
    padding: 0.75rem 4rem;
    text-decoration: none;
    color: currentColor;
    align-self: center;
    outline-color: currentColor;
    transition: all 0.3s ease;
}

.follow:hover {
    background: rgba(255, 255, 255, 0.1);
}

@-webkit-keyframes swing {
    0% {
        --swing-x: -100;
        --swing-y: -100;
    }

    50% {
        --swing-y: 0;
    }

    100% {
        --swing-y: -100;
        --swing-x: 100;
    }
}

@keyframes swing {
    0% {
        --swing-x: -100;
        --swing-y: -100;
    }

    50% {
        --swing-y: 0;
    }

    100% {
        --swing-y: -100;
        --swing-x: 100;
    }
}

/* Theming */
.bear-link-wrapper {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 20;
}

.bear-link {
    color: canvas;
    width: 48px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    opacity: 0.8;
}

:where(.x-link, .bear-link):is(:hover, :focus-visible) {
    opacity: 1;
}

.bear-link svg {
    width: 75%;
}
</style>
