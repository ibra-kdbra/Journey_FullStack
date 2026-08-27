<script setup lang="ts">
import { BookOpen, Code2, Users, Zap, Shield, Heart, ArrowRight } from "@lucide/vue";

useHead({
    title: 'About — Journey Doc',
    meta: [
        { name: 'description', content: 'Practical insights and high-density software engineering curricula.' }
    ]
});
</script>

<template>
    <div class="min-h-screen pb-24">
        <!-- Header -->
        <section class="py-20 border-b border-[rgb(var(--color-border))]">
            <div class="container max-w-4xl mx-auto text-center space-y-4">
                <div class="inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider mx-auto mb-2 bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-accent-blue))] border border-[rgb(var(--color-border))]">
                    <BookOpen :size="14" />
                    Engineering Purpose
                </div>
                <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-[rgb(var(--color-text))]">
                    Empowering Systems Architects
                </h1>
                <p class="text-base sm:text-lg text-[rgb(var(--color-text-soft))] max-w-2xl mx-auto leading-relaxed">
                    Journey Doc provides high-density, zero-fluff interactive documentation covering low-level memory physics, distributed systems, algorithms, and web engines.
                </p>
                <div class="pt-4">
                    <NuxtLink to="/courses" class="btn-primary">
                        Explore All Curricula <ArrowRight :size="16" />
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- Mission & Vision -->
        <section class="py-16 border-b border-[rgb(var(--color-border))]">
            <div class="container max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                <div class="surface-card p-8 space-y-4">
                    <div class="w-10 h-10 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-blue))]">
                        <Code2 :size="20" />
                    </div>
                    <h2 class="text-2xl font-bold text-[rgb(var(--color-text))]">
                        Built for Production Engineers
                    </h2>
                    <p class="text-sm leading-relaxed text-[rgb(var(--color-text-soft))]">
                        We bridge the gap between theoretical computer science and high-throughput production realities. Every module contains deep technical overviews, architectural rules, capstone challenges, and 25-question exams.
                    </p>
                </div>

                <div class="surface-card p-8 space-y-4">
                    <div class="w-10 h-10 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-emerald))]">
                        <Users :size="20" />
                    </div>
                    <h2 class="text-2xl font-bold text-[rgb(var(--color-text))]">
                        Zero Fluff, Maximum Density
                    </h2>
                    <p class="text-sm leading-relaxed text-[rgb(var(--color-text-soft))]">
                        No endless video tutorials or superficial overviews. Our structured markdown documentation provides immediate, copy-paste-free mechanical insights designed for self-directed engineering mastery.
                    </p>
                </div>
            </div>
        </section>

        <!-- Core Values -->
        <section class="py-16">
            <div class="container max-w-5xl mx-auto">
                <h2 class="text-2xl font-bold text-[rgb(var(--color-text))] mb-8 text-center">
                    Core Principles
                </h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="surface-card p-6 space-y-3">
                        <div class="w-9 h-9 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-blue))]">
                            <Zap :size="18" />
                        </div>
                        <h3 class="font-bold text-base text-[rgb(var(--color-text))]">
                            Performance Focus
                        </h3>
                        <p class="text-xs leading-relaxed text-[rgb(var(--color-text-soft))]">
                            Zero heavy animations, fast page rendering, and zero-distraction layout tuned for deep technical work.
                        </p>
                    </div>

                    <div class="surface-card p-6 space-y-3">
                        <div class="w-9 h-9 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-violet))]">
                            <Shield :size="18" />
                        </div>
                        <h3 class="font-bold text-base text-[rgb(var(--color-text))]">
                            Production Standard
                        </h3>
                        <p class="text-xs leading-relaxed text-[rgb(var(--color-text-soft))]">
                            All materials reflect real C, Rust, Go, and systems standards verified against current release tools.
                        </p>
                    </div>

                    <div class="surface-card p-6 space-y-3">
                        <div class="w-9 h-9 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-rose))]">
                            <Heart :size="18" />
                        </div>
                        <h3 class="font-bold text-base text-[rgb(var(--color-text))]">
                            Universal Readability
                        </h3>
                        <p class="text-xs leading-relaxed text-[rgb(var(--color-text-soft))]">
                            Optimized typography line-lengths, high contrast ratios (≥4.5:1), and full keyboard navigation.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
