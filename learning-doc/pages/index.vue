<script setup lang="ts">
import {
    Braces,
    Globe2,
    Server,
    Smartphone,
    Binary,
    Sparkles,
    Target,
    BookOpen,
    CheckCircle2,
    ArrowRight,
    Rocket,
    Zap,
    Code2,
    Layers,
} from "lucide-vue-next";
import { ref } from "vue";

const technologies = [
    {
        name: "Rust",
        iconName: "simple-icons:rust",
        href: "/courses/systems/rust/lesson_0",
        icon: Braces,
        bg: "rgba(234, 88, 12, 0.9)",
        glow: "rgba(234, 88, 12, 0.25)",
        description: "Systems programming with memory safety",
    },
    {
        name: "Go",
        iconName: "simple-icons:go",
        href: "/courses/backend/golang/lesson_0",
        icon: Server,
        bg: "rgba(6, 182, 212, 0.9)",
        glow: "rgba(6, 182, 212, 0.25)",
        description: "Simple, fast, and reliable backend development",
    },
    {
        name: "DSA",
        iconName: "lucide:brain",
        href: "/courses/general/dsa/lesson_0",
        icon: Binary,
        bg: "rgba(147, 51, 234, 0.9)",
        glow: "rgba(147, 51, 234, 0.25)",
        description: "Computer science fundamentals",
    },
    {
        name: "ReactJS",
        iconName: "simple-icons:react",
        href: "/courses/frontend/reactjs/lesson_0",
        icon: Layers,
        bg: "rgba(34, 211, 238, 0.9)",
        glow: "rgba(34, 211, 238, 0.25)",
        description: "Build dynamic, reactive user interfaces",
    },
    {
        name: "Kotlin",
        iconName: "simple-icons:kotlin",
        href: "/courses/mobile/kotlin/lesson_0",
        icon: Smartphone,
        bg: "rgba(168, 85, 247, 0.9)",
        glow: "rgba(168, 85, 247, 0.25)",
        description: "Concise, safe, and interoperable programming",
    },
];

const learningPaths = [
    {
        title: "Systems Architecture",
        description:
            "Design robust, safe system software with Rust. Perfect for performance-critical infrastructure.",
        iconName: "simple-icons:rust",
        link: "/courses/systems/rust/lesson_0",
        color: "234, 88, 12",
    },
    {
        title: "Distributed Backend",
        description:
            "Architect scalable backends and cloud services with Go's simplicity and high concurrency.",
        iconName: "simple-icons:go",
        link: "/courses/backend/golang/lesson_0",
        color: "6, 182, 212",
    },
    {
        title: "Core Engineering",
        description:
            "Master software engineering principles, technical patterns, and algorithmic thinking.",
        iconName: "lucide:layers",
        link: "/courses/general/software-engineering/lesson_0",
        color: "251, 191, 36",
    },
    {
        title: "Frontend Architecture",
        description:
            "Scale large-scale React applications with modern design systems and state management.",
        iconName: "simple-icons:react",
        link: "/courses/frontend/reactjs/lesson_0",
        color: "34, 211, 238",
    },
    {
        title: "Native Systems",
        description:
            "Develop safe, performance-oriented mobile and cross-platform systems with Kotlin.",
        iconName: "simple-icons:kotlin",
        link: "/courses/backend/kotlin/lesson_0",
        color: "168, 85, 247",
    },
];

const tips = [
    {
        title: "Avoid Tutorial Hell",
        description:
            "Don't get stuck in tutorial hell. Build projects while learning, then rebuild them from scratch without the tutorial.",
        icon: Zap,
    },
    {
        title: "Consistent Study Habits",
        description:
            "Commit to regular sessions. 30 minutes daily beats 10 hours weekly.",
        icon: Target,
    },
    {
        title: "Set Clear Goals",
        description:
            "Establish meaningful goals that motivate you — a company, app, or project.",
        icon: Rocket,
    },
    {
        title: "Build Projects",
        description:
            "The best way to learn is by doing. Start building as soon as possible.",
        icon: Code2,
    },
    {
        title: "Join a Community",
        description:
            "Connect with other learners on Discord, Reddit, or local coding groups.",
        icon: Layers,
    },
];

const activeTab = ref("rust");

const tabMap: Record<string, { label: string, icon: string }> = {
    rust: { label: "Rust", icon: "simple-icons:rust" },
    golang: { label: "Go", icon: "simple-icons:go" },
    reactjs: { label: "ReactJS", icon: "simple-icons:react" },
    kotlin: { label: "Kotlin", icon: "simple-icons:kotlin" },
};
</script>

<template>
    <div class="min-h-screen">
        <!-- ═══ HERO SECTION ═══ -->
        <section class="relative overflow-hidden py-24 sm:py-36">
            <!-- Hero Background Gradient -->
            <div class="absolute inset-0 gradient-bg -z-10" />
            <div class="absolute top-20 right-10 w-72 h-72 blob -z-10"
                :style="{ background: `rgba(var(--color-accent-blue), 0.15)` }" />
            <div class="absolute bottom-10 left-10 w-56 h-56 blob -z-10" style="animation-delay: -3s;"
                :style="{ background: `rgba(var(--color-accent-violet), 0.12)` }" />

            <div class="container max-w-6xl mx-auto px-4">
                <div class="max-w-3xl animate-fade-up">
                    <div class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-8 glass-card !rounded-full !p-0 !px-4 !py-1.5"
                        :style="{ color: `rgb(var(--color-accent-blue))` }">
                        <Sparkles :size="14" />
                        Modern Development Platform
                    </div>

                    <h1 class="mb-6 text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
                        <span :style="{ color: `rgb(var(--color-text))` }">Master Modern</span>
                        <br />
                        <span class="gradient-text">Development</span>
                    </h1>

                    <p class="mb-12 text-lg md:text-xl leading-relaxed max-w-2xl"
                        :style="{ color: `rgb(var(--color-text-soft))` }">
                        Focus on five powerful technologies that will define the future of
                        software engineering. High-performance, memory-safe, and scalable.
                    </p>

                    <div class="flex flex-wrap gap-3">
                        <NuxtLink v-for="(tech, i) in technologies" :key="tech.name" :to="tech.href"
                            class="tech-badge animate-fade-up text-white" :class="`delay-${i + 1}`" :style="{
                                background: tech.bg,
                                boxShadow: `0 4px 14px ${tech.glow}`,
                            }">
                            <Icon :name="tech.iconName" class="w-4 h-4" /> {{ tech.name }}
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </section>

        <!-- ═══ LEARNING PATHS SECTION ═══ -->
        <section class="py-24 relative">
            <div class="container max-w-6xl mx-auto px-4">
                <div class="mb-16 animate-fade-up">
                    <div class="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-widest mb-4"
                        :style="{
                            background: `rgba(var(--color-accent-blue), 0.1)`,
                            color: `rgb(var(--color-accent-blue))`
                        }">
                        <Target :size="13" />
                        Learning Paths
                    </div>
                    <h2 class="text-4xl font-black tracking-tight mb-4" :style="{ color: `rgb(var(--color-text))` }">
                        Choose Your Path
                    </h2>
                    <p class="text-lg" :style="{ color: `rgb(var(--color-text-soft))` }">
                        Master modern technologies for different domains of software development.
                    </p>
                </div>

                <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <NuxtLink v-for="(path, i) in learningPaths" :key="path.title" :to="path.link"
                        class="group glass-card flex flex-col p-7 animate-fade-up" :class="`delay-${i + 1}`">
                        <div class="flex items-start justify-between mb-5">
                            <div class="p-3 rounded-xl transition-all duration-300" :style="{
                                background: `rgba(${path.color}, 0.08)`,
                            }">
                                <Icon :name="path.iconName" class="w-7 h-7" :style="{ color: `rgb(${path.color})` }" />
                            </div>
                            <ArrowRight :size="18" class="transition-all duration-300 group-hover:translate-x-1"
                                :style="{ color: `rgb(var(--color-text-muted))` }" />
                        </div>
                        <h3 class="text-lg font-bold mb-2" :style="{ color: `rgb(var(--color-text))` }">
                            {{ path.title }}
                        </h3>
                        <p class="text-sm leading-relaxed" :style="{ color: `rgb(var(--color-text-soft))` }">
                            {{ path.description }}
                        </p>
                        <!-- Accent bar -->
                        <div class="mt-auto pt-5">
                            <div class="h-0.5 w-12 rounded-full transition-all duration-300 group-hover:w-full"
                                :style="{ background: `rgb(${path.color})` }" />
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- ═══ TIPS SECTION ═══ -->
        <section class="py-24 relative">
            <div class="absolute inset-0 gradient-bg -z-10" />

            <div class="container max-w-6xl mx-auto px-4">
                <div class="grid lg:grid-cols-2 gap-16 items-start">
                    <div class="space-y-8 animate-fade-up">
                        <div class="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-widest"
                            :style="{
                                background: `rgba(var(--color-accent-emerald), 0.1)`,
                                color: `rgb(var(--color-accent-emerald))`
                            }">
                            <Rocket :size="13" />
                            Getting Started
                        </div>
                        <h2 class="text-4xl font-black tracking-tight" :style="{ color: `rgb(var(--color-text))` }">
                            Tips for Beginners
                        </h2>
                        <p class="text-lg" :style="{ color: `rgb(var(--color-text-soft))` }">
                            Learning to code can be overwhelming. Here are our top
                            recommendations to stay on track.
                        </p>

                        <div class="space-y-3">
                            <div v-for="(tip, index) in tips" :key="index"
                                class="glass-card flex gap-4 !p-5 animate-fade-up" :class="`delay-${index + 1}`">
                                <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" :style="{
                                    background: `rgba(var(--color-accent-emerald), 0.1)`,
                                    color: `rgb(var(--color-accent-emerald))`
                                }">
                                    <component :is="tip.icon" :size="20" />
                                </div>
                                <div class="space-y-1 min-w-0">
                                    <h4 class="font-bold text-sm" :style="{ color: `rgb(var(--color-text))` }">
                                        {{ tip.title }}
                                    </h4>
                                    <p class="text-sm leading-relaxed"
                                        :style="{ color: `rgb(var(--color-text-soft))` }">
                                        {{ tip.description }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Decorative Visual -->
                    <div class="relative hidden lg:flex items-center justify-center">
                        <div class="absolute inset-0 rounded-full"
                            :style="{ background: `radial-gradient(circle, rgba(var(--color-accent-blue), 0.08) 0%, transparent 70%)` }" />
                        <div class="relative glass-card !p-10 !rounded-[2.5rem] animate-float">
                            <div class="w-48 h-48 rounded-[2rem] flex items-center justify-center"
                                :style="{ background: `rgba(var(--color-surface), 0.8)` }">
                                <BookOpen :size="80" :style="{ color: `rgb(var(--color-accent-blue))` }"
                                    class="animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ═══ ECOSYSTEMS TABS ═══ -->
        <section class="py-24">
            <div class="container max-w-6xl mx-auto px-4">
                <div class="text-center max-w-2xl mx-auto mb-16 space-y-4 animate-fade-up">
                    <h2 class="text-4xl font-black tracking-tight" :style="{ color: `rgb(var(--color-text))` }">
                        Technology Ecosystems
                    </h2>
                    <p :style="{ color: `rgb(var(--color-text-soft))` }">
                        Deep dive into frameworks, tools, and best practices for each technology.
                    </p>
                </div>

                <div class="flex flex-wrap justify-center gap-2 mb-12">
                    <button v-for="t in ['rust', 'golang', 'reactjs', 'kotlin']" :key="t" @click="activeTab = t"
                        class="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2"
                        :style="activeTab === t
                            ? {
                                background: `var(--gradient-accent)`,
                                color: 'white',
                                boxShadow: `0 4px 14px rgba(var(--color-accent-blue), 0.3)`
                            }
                            : {
                                background: `rgba(var(--color-surface), 0.8)`,
                                color: `rgb(var(--color-text-soft))`,
                                border: `1px solid rgba(var(--color-border), 0.4)`
                            }
                            ">
                        <Icon :name="tabMap[t]?.icon || 'lucide:code-2'" class="w-4 h-4" />
                        {{ tabMap[t]?.label || t.toUpperCase() }}
                    </button>
                </div>

                <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <div v-for="i in 3" :key="i" class="glass-card !p-7 animate-fade-up" :class="`delay-${i}`">
                        <h4 class="font-bold mb-2" :style="{ color: `rgb(var(--color-text))` }">
                            Fundamental Concepts
                        </h4>
                        <p class="text-sm leading-relaxed mb-6 line-clamp-2"
                            :style="{ color: `rgb(var(--color-text-soft))` }">
                            Master ownership, concurrency, and memory safety in
                            {{ tabMap[activeTab]?.label || activeTab }}.
                        </p>
                        <NuxtLink :to="`/courses/courses/${activeTab}/lesson_0`"
                            class="inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200"
                            :style="{ color: `rgb(var(--color-accent-blue))` }">
                            Learn more
                            <ArrowRight :size="14" />
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
