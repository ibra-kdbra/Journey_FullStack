<script setup lang="ts">
import { ArrowLeft, List, Clock, ChevronLeft, ChevronRight, Lock } from "lucide-vue-next";

const route = useRoute();
const progressStore = useProgress();
const authStore = useAuth();
const slug = route.params.slug;
const path = Array.isArray(slug) ? slug.join("/") : slug;
const pb = usePocketBase();
const { data: lesson } = await useAsyncData(`lesson-${path}`, async () => {
    const parts = path.split("/");
    const courseSlug = parts[1];
    const lessonSlug = parts[2];

    try {
        const record = await pb.collection('lessons').getFirstListItem(
            `course.slug="${courseSlug}" && slug="${lessonSlug}"`,
            { expand: 'course' }
        );
        
        const parsed = await $fetch('/api/content/parse', {
            method: 'POST',
            body: { content: record.content }
        });
        
        return { ...record, body: parsed.body };
    } catch (e) {
        return null;
    }
});

if (!lesson.value) {
    throw createError({ statusCode: 404, statusMessage: "Lesson not found" });
}

const toolName = lesson.value.expand?.course?.slug;
const toc = computed(() => lesson.value?.body?.toc?.links || []);

const readingTime = computed(() => {
    if (!lesson.value?.content) return 0;
    const words = lesson.value.content.split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
});

const { data: siblings } = await useAsyncData(`siblings-${path}`, async () => {
    const courseId = lesson.value?.course;
    if (!courseId) return [];

    const records = await pb.collection('lessons').getFullList({
        filter: `course="${courseId}"`,
        sort: 'lesson_number'
    });
    return records;
});

const currentIndex = computed(() => {
    if (!siblings.value || !lesson.value) return -1;
    return siblings.value.findIndex(
        (s: any) => s.id === lesson.value!.id
    );
});

const prevLesson = computed(() => {
    if (!siblings.value || currentIndex.value <= 0) return null;
    return siblings.value[currentIndex.value - 1];
});

const isPremiumLocked = computed(() => {
    if (!lesson.value) return false;
    const isPremiumCourse = lesson.value.expand?.course?.is_premium;
    if (!isPremiumCourse || lesson.value.is_free) return false;

    return !authStore.user?.is_premium;
});

const nextLesson = computed(() => {
    if (!siblings.value || currentIndex.value < 0 || currentIndex.value >= siblings.value.length - 1) return null;
    
    const isPremiumCourse = lesson.value?.expand?.course?.is_premium;
    if (isPremiumCourse && !authStore.user?.is_premium && lesson.value?.is_free) {
        return null;
    }

    return siblings.value[currentIndex.value + 1];
});

const formatName = (name: string) =>
    name.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const activeTocId = ref("");

onMounted(() => {
    if (authStore.isLoggedIn) {
        const pathParts = path.split("/");
        const toolName = pathParts[1];
        if (toolName) {
            progressStore.markLessonViewed(toolName, path);
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
                <div class="flex items-center gap-2 mb-4 text-[rgb(var(--color-text-soft))]">
                    <List :size="14" />
                    <h4 class="text-xs font-bold uppercase tracking-wider">
                        On this page
                    </h4>
                </div>
                <ul class="space-y-1">
                    <li v-for="link in toc" :key="link.id">
                        <a :href="`#${link.id}`"
                            class="block px-3 py-1.5 rounded-md text-xs transition-colors border-l-2" :class="[
                                activeTocId === link.id
                                    ? 'text-[rgb(var(--color-accent-blue))] border-[rgb(var(--color-accent-blue))] font-semibold bg-[rgb(var(--color-bg-soft))]'
                                    : 'text-[rgb(var(--color-text-soft))] border-transparent hover:text-[rgb(var(--color-text))]'
                            ]">
                            {{ link.text }}
                        </a>
                    </li>
                </ul>

                <div class="mt-8 pt-4 border-t border-[rgb(var(--color-border))]">
                    <NuxtLink to="/courses"
                        class="inline-flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--color-accent-blue))] hover:underline">
                        <ArrowLeft :size="14" />
                        Back to courses
                    </NuxtLink>
                </div>
            </div>
        </aside>

        <!-- Content Area -->
        <article class="flex-grow max-w-none prose prose-headings:scroll-mt-24">
            <!-- Reading time badge -->
            <div class="not-prose flex items-center gap-4 mb-6 text-xs text-[rgb(var(--color-text-soft))]">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))]">
                    <Clock :size="14" />
                    <span>{{ readingTime }} min read</span>
                </div>
            </div>

            <div v-if="isPremiumLocked" class="not-prose my-10">
                <div class="surface-card p-10 text-center space-y-6">
                    <div class="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto border border-amber-500/20 text-amber-600">
                        <Lock :size="32" />
                    </div>

                    <h2 class="text-2xl font-black tracking-tight text-[rgb(var(--color-text))]">
                        Premium Content Locked
                    </h2>

                    <p class="text-sm max-w-md mx-auto leading-relaxed text-[rgb(var(--color-text-soft))]">
                        The <span class="text-amber-600 font-bold">{{ formatName(toolName) }}</span> curriculum is reserved for Premium members. Upgrade your plan to access advanced modules.
                    </p>

                    <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <NuxtLink to="/membership" class="btn-primary !bg-amber-600 hover:!bg-amber-700">
                            Upgrade to Premium
                        </NuxtLink>
                        <NuxtLink to="/courses" class="btn-secondary">
                            Explore Free Courses
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <ContentRenderer v-else :value="lesson" />

            <!-- Prev / Next Navigation -->
            <nav v-if="prevLesson || nextLesson" class="not-prose mt-14 pt-8 grid gap-4 items-stretch border-t border-[rgb(var(--color-border))]"
                :class="prevLesson && nextLesson ? 'grid-cols-2' : 'grid-cols-1'">
                <NuxtLink v-if="prevLesson" :to="`/courses/${lesson.expand.course.discipline}/${lesson.expand.course.slug}/${prevLesson.slug}`"
                    class="surface-card p-5 flex items-center gap-3 group"
                    :class="{ 'col-start-1': !nextLesson }">
                    <ChevronLeft :size="18" class="flex-shrink-0 text-[rgb(var(--color-text-muted))] transition-transform group-hover:-translate-x-1" />
                    <div class="flex-grow">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))] mb-1">
                            Previous Module
                        </div>
                        <div class="text-xs sm:text-sm font-bold text-[rgb(var(--color-text))] line-clamp-1">
                            {{ prevLesson.title }}
                        </div>
                    </div>
                </NuxtLink>
                <div v-else />
                <NuxtLink v-if="nextLesson" :to="`/courses/${lesson.expand.course.discipline}/${lesson.expand.course.slug}/${nextLesson.slug}`"
                    class="surface-card p-5 flex items-center justify-end gap-3 text-right group"
                    :class="{ 'col-start-2': !prevLesson }">
                    <div class="flex-grow">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))] mb-1">
                            Next Module
                        </div>
                        <div class="text-xs sm:text-sm font-bold text-[rgb(var(--color-text))] line-clamp-1">
                            {{ nextLesson.title }}
                        </div>
                    </div>
                    <ChevronRight :size="18" class="flex-shrink-0 text-[rgb(var(--color-text-muted))] transition-transform group-hover:translate-x-1" />
                </NuxtLink>
            </nav>
        </article>
    </div>
</template>
