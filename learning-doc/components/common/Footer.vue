<script setup lang="ts">
import { Sparkles, Github, MessageCircle } from "lucide-vue-next";

const year = new Date().getFullYear();
</script>

<template>
    <footer class="mt-auto relative overflow-hidden"
        :style="{
            background: `rgb(var(--color-bg-soft))`,
            borderTop: `1px solid rgba(var(--color-border), 0.4)`
        }">
        <!-- Subtle gradient glow at top -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
            :style="{ background: `linear-gradient(to right, transparent, rgba(var(--color-accent-blue), 0.4), transparent)` }" />

        <div class="container py-16">
            <div class="grid grid-cols-1 gap-12 md:grid-cols-4">
                <!-- Brand -->
                <div class="space-y-4 md:col-span-1">
                    <NuxtLink to="/" class="group inline-flex items-center gap-2.5">
                        <div class="flex items-center justify-center w-7 h-7 rounded-md"
                            :style="{ background: `var(--gradient-accent)` }">
                            <Sparkles :size="14" class="text-white" />
                        </div>
                        <span class="text-lg font-extrabold tracking-tight"
                            :style="{ color: `rgb(var(--color-text))` }">
                            Emi
                        </span>
                    </NuxtLink>
                    <p class="text-sm leading-relaxed max-w-xs"
                        :style="{ color: `rgb(var(--color-text-muted))` }">
                        Practical insights & detailed tutorials on modern technologies like
                        Go, Rust, and Next.js.
                    </p>
                </div>

                <!-- Resources -->
                <div>
                    <h3 class="mb-4 text-xs font-bold uppercase tracking-[0.15em]"
                        :style="{ color: `rgb(var(--color-text-soft))` }">
                        Resources
                    </h3>
                    <ul class="space-y-2.5">
                        <li>
                            <NuxtLink to="/courses"
                                class="text-sm transition-all duration-200 hover:translate-x-0.5 inline-block"
                                :style="{ color: `rgb(var(--color-text-muted))` }">
                                All Courses
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/courses/courses/rust/lesson_0"
                                class="text-sm transition-all duration-200 hover:translate-x-0.5 inline-block"
                                :style="{ color: `rgb(var(--color-text-muted))` }">
                                Rust Course
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/courses/courses/golang/lesson_0"
                                class="text-sm transition-all duration-200 hover:translate-x-0.5 inline-block"
                                :style="{ color: `rgb(var(--color-text-muted))` }">
                                Go Course
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <!-- Community -->
                <div>
                    <h3 class="mb-4 text-xs font-bold uppercase tracking-[0.15em]"
                        :style="{ color: `rgb(var(--color-text-soft))` }">
                        Community
                    </h3>
                    <ul class="space-y-2.5">
                        <li>
                            <a href="#"
                                class="inline-flex items-center gap-2 text-sm transition-all duration-200 hover:translate-x-0.5"
                                :style="{ color: `rgb(var(--color-text-muted))` }">
                                <Github :size="14" />
                                GitHub
                            </a>
                        </li>
                        <li>
                            <a href="#"
                                class="inline-flex items-center gap-2 text-sm transition-all duration-200 hover:translate-x-0.5"
                                :style="{ color: `rgb(var(--color-text-muted))` }">
                                <MessageCircle :size="14" />
                                Discord
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Legal -->
                <div>
                    <h3 class="mb-4 text-xs font-bold uppercase tracking-[0.15em]"
                        :style="{ color: `rgb(var(--color-text-soft))` }">
                        Legal
                    </h3>
                    <ul class="space-y-2.5">
                        <li>
                            <NuxtLink to="/privacy"
                                class="text-sm transition-all duration-200 hover:translate-x-0.5 inline-block"
                                :style="{ color: `rgb(var(--color-text-muted))` }">
                                Privacy Policy
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/terms"
                                class="text-sm transition-all duration-200 hover:translate-x-0.5 inline-block"
                                :style="{ color: `rgb(var(--color-text-muted))` }">
                                Terms of Service
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
                :style="{ borderTop: `1px solid rgba(var(--color-border), 0.3)` }">
                <p class="text-xs" :style="{ color: `rgb(var(--color-text-muted))` }">
                    &copy; {{ year }} Emi. All rights reserved.
                </p>
                <p class="text-xs" :style="{ color: `rgb(var(--color-text-muted))` }">
                    Built with Nuxt &amp; Vue.js
                </p>
            </div>
        </div>
    </footer>
</template>
