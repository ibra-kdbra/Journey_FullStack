<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug;
const path = Array.isArray(slug) ? slug.join("/") : slug;

// Use useAsyncData to fetch content based on the constructed path
const { data: page } = await useAsyncData(`content-${path}`, () => {
    return queryCollection("content").path("/" + path).first();
});

if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" });
}
</script>

<template>
    <div class="flex-grow flex flex-col md:flex-row container py-8 gap-8">
        <!-- Sidebar / TOC -->
        <aside class="md:w-64 flex-shrink-0 space-y-8">
            <div class="sticky top-24">
                <h4 class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    On this page
                </h4>
                <ul class="space-y-3 text-sm">
                    <li v-for="link in page.body?.toc?.links" :key="link.id">
                        <a :href="`#${link.id}`"
                            class="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                            {{ link.text }}
                        </a>
                    </li>
                </ul>

                <div class="mt-12 pt-8 border-t">
                    <NuxtLink to="/docs" class="text-sm font-bold text-blue-600 hover:underline">← Back to courses
                    </NuxtLink>
                </div>
            </div>
        </aside>

        <!-- Content Area -->
        <article
            class="flex-grow max-w-none prose prose-slate dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-a:text-blue-600">
            <h1 class="text-4xl md:text-5xl font-black tracking-tight mb-8">
                {{ page.title }}
            </h1>
            <ContentRenderer :value="page" />

            <!-- Comments Section -->
            <section class="mt-16 pt-16 border-t">
                <DocsComments :doc-path="page?._path || ''" />
            </section>
        </article>
    </div>
</template>

<style>
/* Custom prose styles for a more modern look */
.prose h2 {
    @apply text-3xl;
}

.prose h3 {
    @apply text-2xl;
}

.prose code {
    @apply bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-medium;
}

.prose pre {
    @apply rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm !bg-slate-950;
}
</style>
