<script setup lang="ts">
import { Sparkles, Code2, Zap, Users, Shield, Rocket, Heart, ArrowRight } from "lucide-vue-next";
import { onMounted, ref } from 'vue';

const isVisible = ref({
    hero: false,
    mission: false,
    values: false,
    cta: false
});

onMounted(() => {
    Object.keys(isVisible.value).forEach((key, index) => {
        setTimeout(() => {
            isVisible.value[key as keyof typeof isVisible.value] = true;
        }, index * 200);
    });
});
</script>

<template>
    <div class="relative overflow-hidden pb-32">
        <!-- Floating Blobs Background -->
        <div class="absolute top-0 right-0 w-[500px] h-[500px] blob -z-10 opacity-30"
            :style="{ background: `rgba(var(--color-accent-blue), 0.15)` }" />
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] blob -z-10 opacity-30"
            :style="{ background: `rgba(var(--color-accent-violet), 0.12)`, animationDelay: '2s' }" />

        <!-- Hero Section -->
        <header class="relative pt-32 pb-24 border-b" :style="{ borderColor: `rgba(var(--color-border), 0.4)` }">
            <div class="container max-w-5xl mx-auto space-y-8 text-center transition-all duration-1000 transform"
                :class="isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'">
                <div class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mx-auto shadow-sm"
                    :style="{
                        background: `rgba(var(--color-accent-violet), 0.1)`,
                        color: `rgb(var(--color-accent-violet))`,
                        border: `1px solid rgba(var(--color-accent-violet), 0.2)`
                    }">
                    <Sparkles :size="14" />
                    The Story Behind Emi
                </div>
                <h1 class="text-5xl md:text-7xl font-black tracking-tighter"
                    :style="{ color: `rgb(var(--color-text))` }">
                    Empowering Next-Gen <br class="hidden md:block" />
                    <span class="gradient-text">Developers</span>
                </h1>
                <p class="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto"
                    :style="{ color: `rgb(var(--color-text-soft))` }">
                    Emi is more than just a platform. It's a modern, interactive journey into the depths of
                    high-performance computing, web technologies, and software architecture.
                </p>
                <div class="pt-6">
                    <NuxtLink to="/courses"
                        class="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        :style="{ background: `var(--gradient-accent)`, boxShadow: `var(--shadow-glow-violet)` }">
                        Start Learning
                        <ArrowRight :size="20" />
                    </NuxtLink>
                </div>
            </div>
        </header>

        <!-- Mission & Vision Section (Alternating) -->
        <section class="py-32 container max-w-6xl mx-auto space-y-32">
            <!-- Mission -->
            <div class="flex flex-col md:flex-row items-center gap-16 transition-all duration-1000 transform"
                :class="isVisible.mission ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'">
                <div class="flex-1 space-y-8 relative">
                    <div class="absolute -left-8 -top-8 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl z-0" />
                    <h2 class="text-4xl font-black tracking-tight relative z-10"
                        :style="{ color: `rgb(var(--color-text))` }">
                        Our Mission
                    </h2>
                    <p class="text-lg leading-relaxed relative z-10" :style="{ color: `rgb(var(--color-text-soft))` }">
                        We aim to bridge the gap between theoretical knowledge and practical execution.
                        By providing high-quality, deeply integrated tutorials on cutting-edge stacks like
                        <strong class="font-bold text-inherit">Rust, Go, Nuxt, ReactJS, and Kotlin</strong>, we help developers
                        transition from
                        beginners to architects effortlessly.
                    </p>
                    <div class="flex gap-4 relative z-10">
                        <div class="flex flex-col gap-2">
                            <span class="text-3xl font-black"
                                :style="{ color: `rgb(var(--color-accent-blue))` }">10+</span>
                            <span class="text-sm font-bold uppercase tracking-wider"
                                :style="{ color: `rgb(var(--color-text-muted))` }">Curated Tracks</span>
                        </div>
                        <div class="w-px h-16" :style="{ background: `rgba(var(--color-border), 0.5)` }" />
                        <div class="flex flex-col gap-2">
                            <span class="text-3xl font-black"
                                :style="{ color: `rgb(var(--color-accent-violet))` }">500+</span>
                            <span class="text-sm font-bold uppercase tracking-wider"
                                :style="{ color: `rgb(var(--color-text-muted))` }">Lessons</span>
                        </div>
                    </div>
                </div>
                <div class="flex-1 relative group w-full">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-3xl transform rotate-3 opacity-20 group-hover:rotate-6 transition-all duration-500 blur-sm" />
                    <div
                        class="glass-card !p-8 relative z-10 
                                transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-xl">
                        <Code2 :size="48" class="mb-6" :style="{ color: `rgb(var(--color-accent-blue))` }" />
                        <h3 class="text-2xl font-bold mb-4" :style="{ color: `rgb(var(--color-text))` }">Built for
                            Builders</h3>
                        <p class="text-base leading-relaxed" :style="{ color: `rgb(var(--color-text-soft))` }">
                            Every lesson ends with a practical capstone. Stop reading endless theory and start shipping
                            real products.
                            Our markdown rendering engine is specifically tuned for optimal code readability.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Vision -->
            <div class="flex flex-col md:flex-row-reverse items-center gap-16 transition-all duration-1000 delay-300 transform"
                :class="isVisible.mission ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'">
                <div class="flex-1 space-y-8 relative">
                    <div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl z-0" />
                    <h2 class="text-4xl font-black tracking-tight relative z-10"
                        :style="{ color: `rgb(var(--color-text))` }">
                        The Vision
                    </h2>
                    <p class="text-lg leading-relaxed relative z-10" :style="{ color: `rgb(var(--color-text-soft))` }">
                        We envision a highly interactive learning space. Rather than disconnected tutorials scattered
                        across the web, Emi centralizes deep technical knowledge with collaborative community features.
                    </p>
                </div>
                <div class="flex-1 relative group w-full">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl transform -rotate-3 opacity-20 group-hover:-rotate-6 transition-all duration-500 blur-sm" />
                    <div
                        class="glass-card !p-8 relative z-10 
                                transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-xl">
                        <Users :size="48" class="mb-6" :style="{ color: `rgb(var(--color-accent-emerald))` }" />
                        <h3 class="text-2xl font-bold mb-4" :style="{ color: `rgb(var(--color-text))` }">Community
                            Driven</h3>
                        <p class="text-base leading-relaxed" :style="{ color: `rgb(var(--color-text-soft))` }">
                            Integrated comments, real-time collaboration, and community-sourced technical docs ensure
                            the material is never outdated and always evolving.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Core Values Grid -->
        <section class="py-24 relative"
            :style="{ background: `rgba(var(--color-surface), 0.3)`, borderTop: `1px solid rgba(var(--color-border), 0.4)`, borderBottom: `1px solid rgba(var(--color-border), 0.4)` }">
            <div class="container max-w-6xl mx-auto space-y-16 transition-all duration-1000 transform"
                :class="isVisible.values ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'">
                <div class="text-center max-w-2xl mx-auto">
                    <h2 class="text-3xl md:text-4xl font-black tracking-tight mb-4"
                        :style="{ color: `rgb(var(--color-text))` }">
                        Core Values
                    </h2>
                    <p class="text-lg" :style="{ color: `rgb(var(--color-text-soft))` }">
                        The fundamental principles that dictate how we build, teach, and interact.
                    </p>
                </div>

                <div class="grid md:grid-cols-3 gap-6">
                    <div
                        class="glass-card !p-8 group hover:bg-white/5 dark:hover:bg-white/5 transition-colors duration-300">
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                            :style="{ background: `rgba(var(--color-accent-blue), 0.1)` }">
                            <Zap :size="24" :style="{ color: `rgb(var(--color-accent-blue))` }" />
                        </div>
                        <h3 class="font-bold text-xl mb-3" :style="{ color: `rgb(var(--color-text))` }">Performance
                            First</h3>
                        <p class="text-sm leading-relaxed" :style="{ color: `rgb(var(--color-text-soft))` }">
                            Every byte sent over the network is meticulously measured. Emi is built to be blazing fast,
                            ensuring zero friction in learning.
                        </p>
                    </div>
                    <div
                        class="glass-card !p-8 group hover:bg-white/5 dark:hover:bg-white/5 transition-colors duration-300">
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                            :style="{ background: `rgba(var(--color-accent-violet), 0.1)` }">
                            <Shield :size="24" :style="{ color: `rgb(var(--color-accent-violet))` }" />
                        </div>
                        <h3 class="font-bold text-xl mb-3" :style="{ color: `rgb(var(--color-text))` }">Quality Assured
                        </h3>
                        <p class="text-sm leading-relaxed" :style="{ color: `rgb(var(--color-text-soft))` }">
                            No outdated code, no broken dependencies. Content is regularly audited against the latest
                            stable releases of languages.
                        </p>
                    </div>
                    <div
                        class="glass-card !p-8 group hover:bg-white/5 dark:hover:bg-white/5 transition-colors duration-300">
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                            :style="{ background: `rgba(var(--color-accent-rose), 0.1)` }">
                            <Heart :size="24" :style="{ color: `rgb(var(--color-accent-rose))` }" />
                        </div>
                        <h3 class="font-bold text-xl mb-3" :style="{ color: `rgb(var(--color-text))` }">Accessible</h3>
                        <p class="text-sm leading-relaxed" :style="{ color: `rgb(var(--color-text-soft))` }">
                            High quality education should be available to everyone. Our design system supports
                            high-contrast themes and precise formatting.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Call to Action -->
        <section class="py-24 text-center container max-w-4xl mx-auto transition-all duration-1000 transform"
            :class="isVisible.cta ? 'opacity-100 scale-100' : 'opacity-0 scale-95'">
            <div class="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-8 shadow-xl"
                :style="{ background: `var(--gradient-accent)` }">
                <Rocket :size="28" class="text-white" />
            </div>
            <h2 class="text-4xl font-black mb-6" :style="{ color: `rgb(var(--color-text))` }">Ready to Accelerate?</h2>
            <p class="text-lg mb-10" :style="{ color: `rgb(var(--color-text-soft))` }">
                Join thousands of developers leveling up their stack today.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <NuxtLink to="/auth/sign-up"
                    class="w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-bold transition-all duration-300 hover:scale-105"
                    :style="{ background: `var(--gradient-accent)` }">
                    Create Account
                </NuxtLink>
                <NuxtLink to="/courses"
                    class="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold transition-all duration-300 hover:bg-white/5"
                    :style="{
                        color: `rgb(var(--color-text))`,
                        border: `1px solid rgba(var(--color-text-muted), 0.4)`
                    }">
                    Browse Library
                </NuxtLink>
            </div>
        </section>
    </div>
</template>
