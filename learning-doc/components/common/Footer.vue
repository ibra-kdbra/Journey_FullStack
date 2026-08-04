<script setup lang="ts">
import { BookOpen, Github, MessageCircle } from "lucide-vue-next";

const year = new Date().getFullYear();
</script>

<template>
    <footer class="mt-auto bg-[rgb(var(--color-bg-soft))] border-t border-[rgb(var(--color-border))]">
        <div class="container py-14">
            <div class="grid grid-cols-1 gap-10 md:grid-cols-4">
                <!-- Brand -->
                <div class="space-y-3 md:col-span-1">
                    <NuxtLink to="/" class="inline-flex items-center gap-2.5">
                        <div class="flex items-center justify-center w-7 h-7 rounded-md bg-[rgb(var(--color-accent-blue))] text-white">
                            <BookOpen :size="15" />
                        </div>
                        <span class="text-lg font-black tracking-tight text-[rgb(var(--color-text))]">
                            Journey Doc
                        </span>
                    </NuxtLink>
                    <p class="text-xs leading-relaxed text-[rgb(var(--color-text-soft))] max-w-xs">
                        High-density software engineering curricula covering Systems, Distributed Backends, Frontend Architecture, and CS Fundamentals.
                    </p>
                </div>

                <!-- Resources -->
                <div>
                    <h3 class="mb-3 text-xs font-bold text-[rgb(var(--color-text))] uppercase tracking-wider">
                        Resources
                    </h3>
                    <ul class="space-y-2">
                        <li>
                            <NuxtLink to="/courses"
                                class="text-xs text-[rgb(var(--color-text-soft))] hover:text-[rgb(var(--color-accent-blue))] transition-colors">
                                All Courses
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/courses/systems/rust/lesson_0"
                                class="text-xs text-[rgb(var(--color-text-soft))] hover:text-[rgb(var(--color-accent-blue))] transition-colors">
                                Rust Architecture
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/courses/systems/clang/lesson_0"
                                class="text-xs text-[rgb(var(--color-text-soft))] hover:text-[rgb(var(--color-accent-blue))] transition-colors">
                                C Systems Architect
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <!-- Community -->
                <div>
                    <h3 class="mb-3 text-xs font-bold text-[rgb(var(--color-text))] uppercase tracking-wider">
                        Community
                    </h3>
                    <ul class="space-y-2">
                        <li>
                            <a href="https://github.com" target="_blank" rel="noopener"
                                class="inline-flex items-center gap-1.5 text-xs text-[rgb(var(--color-text-soft))] hover:text-[rgb(var(--color-accent-blue))] transition-colors">
                                <Github :size="13" />
                                GitHub
                            </a>
                        </li>
                        <li>
                            <a href="#"
                                class="inline-flex items-center gap-1.5 text-xs text-[rgb(var(--color-text-soft))] hover:text-[rgb(var(--color-accent-blue))] transition-colors">
                                <MessageCircle :size="13" />
                                Discord
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Legal -->
                <div>
                    <h3 class="mb-3 text-xs font-bold text-[rgb(var(--color-text))] uppercase tracking-wider">
                        Legal
                    </h3>
                    <ul class="space-y-2">
                        <li>
                            <NuxtLink to="/privacy"
                                class="text-xs text-[rgb(var(--color-text-soft))] hover:text-[rgb(var(--color-accent-blue))] transition-colors">
                                Privacy Policy
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/terms"
                                class="text-xs text-[rgb(var(--color-text-soft))] hover:text-[rgb(var(--color-accent-blue))] transition-colors">
                                Terms of Service
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[rgb(var(--color-border))] text-xs text-[rgb(var(--color-text-soft))]">
                <p>&copy; {{ year }} Journey Doc. All rights reserved.</p>
                <p>Built with Nuxt 4 &amp; Vue 3</p>
            </div>
        </div>
    </footer>
</template>
