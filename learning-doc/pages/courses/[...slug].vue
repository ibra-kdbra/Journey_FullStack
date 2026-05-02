<script setup lang="ts">
import { ArrowLeft, ArrowRight, List, Clock, ChevronLeft, ChevronRight, Lock } from "lucide-vue-next";
import { premiumTools } from "../../utils/academy";

const route = useRoute();
const progressStore = useProgress();
const authStore = useAuth();
const slug = route.params.slug;
const path = Array.isArray(slug) ? slug.join("/") : slug;
const contentPath = "/courses/" + path;

const pathParts = contentPath.split("/");
const toolName = pathParts[3];

const { data: page } = await useAsyncData(`content-${path}`, () => {
    return queryCollection("content").path(contentPath).first();
});

if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" });
}

// Reading time estimation
const readingTime = computed(() => {
    if (!page.value?.body) return 0;
    // rough estimate: 200 words per minute
    const text = JSON.stringify(page.value.body);
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
});

// Prev / Next lesson navigation
const { data: siblings } = await useAsyncData(`siblings-${path}`, async () => {
    const pPath = pathParts.slice(0, -1).join("/");
    const docs = await queryCollection("content")
        .where("path", "LIKE", pPath + "/%")
        .all();

    return docs.sort((a: any, b: any) => {
        const aNum = parseInt(a.path?.match(/lesson_(\d+)/)?.[1] || "0");
        const bNum = parseInt(b.path?.match(/lesson_(\d+)/)?.[1] || "0");
        return aNum - bNum;
    });
});

const currentIndex = computed(() => {
    if (!siblings.value || !page.value) return -1;
    return siblings.value.findIndex(
        (s: any) => s.path === page.value!.path
    );
});

const prevLesson = computed(() => {
    if (!siblings.value || currentIndex.value <= 0) return null;
    return siblings.value[currentIndex.value - 1];
});

const isPremiumLocked = computed(() => {
    if (!page.value?.path) return false;
    const isPremiumTrack = premiumTools.includes(toolName);
    if (!isPremiumTrack) return false;

    // Allow lesson_0 to be viewed by everyone (syllabus)
    if (page.value.path.endsWith("lesson_0")) return false;

    // Check auth
    return !authStore.user?.is_premium;
});

const nextLesson = computed(() => {
    if (!siblings.value || currentIndex.value < 0 || currentIndex.value >= siblings.value.length - 1) return null;
    
    // Harden: If current is Lesson 0 and track is premium and user is not premium, no Next button.
    const isPremiumTrack = premiumTools.includes(toolName);
    if (isPremiumTrack && !authStore.user?.is_premium && page.value?.path?.endsWith("lesson_0")) {
        return null;
    }

    return siblings.value[currentIndex.value + 1];
});

const formatName = (name: string) =>
    name.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Active TOC tracking
const activeTocId = ref("");

onMounted(() => {
    // Record progress
    if (authStore.isLoggedIn) {
        const pathParts = contentPath.split("/");
        // New structure: /courses/[discipline]/[tool]/[lesson]
        const toolName = pathParts[3];
        if (toolName) {
            progressStore.markLessonViewed(toolName, contentPath);
        }
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    activeTocId.value = entry.target.id;
                }
            }
        },
        { rootMargin: "-80px 0px -70% 0px" }
    );

    document.querySelectorAll("article h2[id], article h3[id]").forEach((el) => {
        observer.observe(el);
    });
});
</script>

<template>
    <div class="flex-grow flex flex-col md:flex-row container py-10 gap-10">
        <!-- Sidebar / TOC -->
        <aside class="md:w-60 flex-shrink-0 space-y-6">
            <div class="sticky top-24">
                <div class="flex items-center gap-2 mb-5" :style="{ color: `rgb(var(--color-text-muted))` }">
                    <List :size="14" />
                    <h4 class="text-xs font-bold uppercase tracking-widest">
                        On this page
                    </h4>
                </div>
                <ul class="space-y-1">
                    <li v-for="link in page.body?.toc?.links" :key="link.id">
                        <a :href="`#${link.id}`"
                            class="block px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border-l-2" :style="{
                                color: activeTocId === link.id
                                    ? `rgb(var(--color-accent-blue))`
                                    : `rgb(var(--color-text-muted))`,
                                borderColor: activeTocId === link.id
                                    ? `rgb(var(--color-accent-blue))`
                                    : 'transparent',
                                background: activeTocId === link.id
                                    ? `rgba(var(--color-accent-blue), 0.06)`
                                    : 'transparent',
                                fontWeight: activeTocId === link.id ? '600' : '400',
                            }">
                            {{ link.text }}
                        </a>
                    </li>
                </ul>

                <div class="mt-10 pt-6" :style="{ borderTop: `1px solid rgba(var(--color-border), 0.4)` }">
                    <NuxtLink to="/courses"
                        class="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 hover:-translate-x-0.5"
                        :style="{ color: `rgb(var(--color-accent-blue))` }">
                        <ArrowLeft :size="14" />
                        Back to courses
                    </NuxtLink>
                </div>
            </div>
        </aside>

        <!-- Content Area -->
        <article class="flex-grow max-w-none prose prose-headings:scroll-mt-24">
            <!-- Reading time badge -->
            <div class="not-prose flex items-center gap-4 mb-6 text-sm"
                :style="{ color: `rgb(var(--color-text-muted))` }">
                <div class="inline-flex items-center gap-1.5">
                    <Clock :size="14" />
                    <span>{{ readingTime }} min read</span>
                </div>
            </div>

            <div v-if="isPremiumLocked" class="not-prose my-12 animate-fade-in">
                <div
                    class="glass-card p-12 text-center space-y-8 !rounded-3xl relative overflow-hidden group border-amber-500/30">
                    <!-- Background Glow -->
                    <div
                        class="absolute -top-24 -right-24 w-62 h-62 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <div class="relative z-10 space-y-6">
                        <div
                            class="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-xl shadow-amber-500/5">
                            <Lock :size="40" class="text-amber-500" />
                        </div>

                        <h2 class="text-3xl font-black tracking-tight" :style="{ color: `rgb(var(--color-text))` }">
                            Premium Content Locked
                        </h2>

                        <p class="text-lg max-w-lg mx-auto leading-relaxed"
                            :style="{ color: `rgb(var(--color-text-soft))` }">
                            The <span class="text-amber-500 font-bold">{{ formatName(toolName) }}</span> curriculum is
                            reserved for our Premium members.
                            Upgrade your plan to unlock advanced engineering patterns and professional architecture
                            modules.
                        </p>

                        <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <NuxtLink to="/membership"
                                class="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:scale-105">
                                Upgrade to Premium
                            </NuxtLink>
                            <NuxtLink to="/courses"
                                class="px-8 py-4 bg-white/5 hover:bg-white/10 font-bold rounded-2xl transition-all duration-300 border border-white/10"
                                :style="{ color: `rgb(var(--color-text))` }">
                                Explore Free Courses
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>

            <ContentRenderer v-else :value="page" />



            <!-- Prev / Next Navigation -->
            <nav v-if="prevLesson || nextLesson" class="not-prose mt-16 pt-10 grid gap-4 items-stretch"
                :class="prevLesson && nextLesson ? 'grid-cols-2' : 'grid-cols-1'"
                :style="{ borderTop: `1px solid rgba(var(--color-border), 0.4)` }">
                <NuxtLink v-if="prevLesson" :to="prevLesson.path"
                    class="group glass-card !p-5 flex items-center gap-3 !rounded-xl h-full"
                    :class="{ 'col-start-1': !nextLesson }">
                    <ChevronLeft :size="18"
                        class="flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-1"
                        :style="{ color: `rgb(var(--color-text-muted))` }" />
                    <div class="flex-grow">
                        <div class="text-xs font-semibold uppercase tracking-wider mb-1"
                            :style="{ color: `rgb(var(--color-text-muted))` }">
                            Previous
                        </div>
                        <div class="text-sm font-bold break-words" :style="{ color: `rgb(var(--color-text))` }">
                            {{ prevLesson.title }}
                        </div>
                    </div>
                </NuxtLink>
                <div v-else />
                <NuxtLink v-if="nextLesson" :to="nextLesson.path"
                    class="group glass-card !p-5 flex items-center justify-end gap-3 text-right !rounded-xl h-full"
                    :class="{ 'col-start-2': !prevLesson }">
                    <div class="flex-grow">
                        <div class="text-xs font-semibold uppercase tracking-wider mb-1"
                            :style="{ color: `rgb(var(--color-text-muted))` }">
                            Next
                        </div>
                        <div class="text-sm font-bold break-words" :style="{ color: `rgb(var(--color-text))` }">
                            {{ nextLesson.title }}
                        </div>
                    </div>
                    <ChevronRight :size="18"
                        class="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                        :style="{ color: `rgb(var(--color-text-muted))` }" />
                </NuxtLink>
            </nav>

            <!-- Comments Section -->
            <section class="not-prose mt-16 pt-12" :style="{ borderTop: `1px solid rgba(var(--color-border), 0.4)` }">
                <CourseComments :doc-path="page?.path || ''" />
            </section>
        </article>
    </div>
</template>
