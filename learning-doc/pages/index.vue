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
    Cpu,
    Monitor,
} from "lucide-vue-next";
import { ref } from "vue";

const technologies = [
    {
        name: "Low-Level",
        iconName: "lucide:cpu",
        href: "/courses?category=systems",
        icon: Cpu,
        bg: "rgba(234, 88, 12, 0.9)",
        glow: "rgba(234, 88, 12, 0.25)",
        description: "Systems programming and memory safety",
    },
    {
        name: "Backend",
        iconName: "lucide:server",
        href: "/courses?category=backend",
        icon: Server,
        bg: "rgba(6, 182, 212, 0.9)",
        glow: "rgba(6, 182, 212, 0.25)",
        description: "High-level distributed systems and APIs",
    },
    {
        name: "Engineering",
        iconName: "lucide:binary",
        href: "/courses?category=general",
        icon: Binary,
        bg: "rgba(147, 51, 234, 0.9)",
        glow: "rgba(147, 51, 234, 0.25)",
        description: "Algorithm mastery and core principles",
    },
    {
        name: "Frontend",
        iconName: "lucide:monitor",
        href: "/courses?category=frontend",
        icon: Monitor,
        bg: "rgba(34, 211, 238, 0.9)",
        glow: "rgba(34, 211, 238, 0.25)",
        description: "Modern web architecture and UI patterns",
    },
    {
        name: "Mobile",
        iconName: "lucide:smartphone",
        href: "/courses?category=mobile",
        icon: Smartphone,
        bg: "rgba(168, 85, 247, 0.9)",
        glow: "rgba(168, 85, 247, 0.25)",
        description: "Native ecosystems and mobile systems",
    },
];

const learningPaths = [
    {
        title: "Systems Engineer",
        description:
            "Master memory management, concurrency, and low-level optimizations. Build the foundation of software.",
        iconName: "lucide:cpu",
        link: "/courses?category=systems",
        color: "234, 88, 12",
    },
    {
        title: "Backend Architect",
        description:
            "Design highly scalable distributed systems, microservices, and high-performance communication layers.",
        iconName: "lucide:server",
        link: "/courses?category=backend",
        color: "6, 182, 212",
    },
    {
        title: "Software Architect",
        description:
            "Master design patterns, SOLID principles, and clean architecture to build maintainable enterprise systems.",
        iconName: "lucide:layers",
        link: "/courses?category=general",
        color: "251, 191, 36",
    },
    {
        title: "Frontend Engineer",
        description:
            "Build sophisticated web applications with focus on performance, accessibility, and modern UI patterns.",
        iconName: "lucide:monitor",
        link: "/courses?category=frontend",
        color: "34, 211, 238",
    },
    {
        title: "Mobile Architect",
        description:
            "Create high-performance native experiences and master cross-platform architectural ecosystems.",
        iconName: "lucide:smartphone",
        link: "/courses?category=mobile",
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

// You can dynamically add tools here! 
const tabMap: Record<string, { label: string, icon: string, link: string }> = {
    rust: { label: "Rust", icon: "simple-icons:rust", link: "/courses/systems/rust/lesson_0" },
    golang: { label: "Go", icon: "simple-icons:go", link: "/courses/backend/golang/lesson_0" },
    reactjs: { label: "ReactJS", icon: "simple-icons:react", link: "/courses/frontend/reactjs/lesson_0" },
    kotlin: { label: "Kotlin", icon: "simple-icons:kotlin", link: "/courses/mobile/kotlin/lesson_0" },
    nodejs: { label: "Node.js", icon: "simple-icons:nodedotjs", link: "/courses/backend/nodejs/lesson_0" },
    docker: { label: "Docker", icon: "simple-icons:docker", link: "/courses/systems/docker/lesson_0" },
};
// Use Object.keys(tabMap) instead of a hardcoded array so it's dynamic
const ecosystemTools = Object.keys(tabMap).slice(0, 4); // Take top four tools for rendering
const activeTab = ref(ecosystemTools[0]);
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
                        <span :style="{ color: `rgb(var(--color-text))` }">Master Engineering</span>
                        <br />
                        <span class="gradient-text">Paradigms</span>
                    </h1>

                    <p class="mb-12 text-lg md:text-xl leading-relaxed max-w-2xl"
                        :style="{ color: `rgb(var(--color-text-soft))` }">
                        Master the core disciplines of software engineering. From low-level memory safety
                        to distributed backend architectures and sophisticated frontend systems.
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

                        <div class="grid sm:grid-cols-2 gap-4">
                            <div v-for="(tip, index) in tips" :key="index"
                                class="group glass-card flex flex-col gap-4 !p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-up"
                                :class="`delay-${index + 1}`"
                                :style="{ borderColor: `rgba(var(--color-accent-emerald), 0.15)` }">
                                <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                    :style="{
                                        background: `rgba(var(--color-accent-emerald), 0.1)`,
                                        color: `rgb(var(--color-accent-emerald))`
                                    }">
                                    <component :is="tip.icon" :size="24" />
                                </div>
                                <div class="space-y-2">
                                    <h4 class="font-black text-base tracking-tight"
                                        :style="{ color: `rgb(var(--color-text))` }">
                                        {{ tip.title }}
                                    </h4>
                                    <p class="text-sm leading-relaxed opacity-80"
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
                    <button v-for="t in ecosystemTools" :key="t" @click="activeTab = t"
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
                        <NuxtLink :to="tabMap[activeTab]?.link"
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
