<script setup lang="ts">
const { data: courses } = await useAsyncData("courses", () =>
    queryContent("courses")
        .where({ _extension: "md" })
        .only(["_path", "title", "description"])
        .find(),
);

// Group by course name (first part of path after /courses/)
const groupedCourses = computed(() => {
    if (!courses.value) return {};
    const groups: Record<string, any[]> = {};
    courses.value.forEach((course) => {
        const parts = course._path?.split("/") || [];
        const groupName = parts[2] || "Other";
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(course);
    });
    return groups;
});

const formatName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1);
</script>

<template>
    <div class="container py-12 space-y-16">
        <div class="max-w-2xl">
            <h1 class="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Curriculum
            </h1>
            <p class="text-lg text-muted-foreground leading-relaxed">
                Deep dives into systems programming, backend architecture, and modern
                mobile development.
            </p>
        </div>

        <div v-for="(lessons, group) in groupedCourses" :key="group" class="space-y-6">
            <h2 class="text-2xl font-bold border-l-4 border-blue-600 pl-4">
                {{ formatName(group) }}
            </h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <NuxtLink v-for="lesson in lessons" :key="lesson._path" :to="lesson._path"
                    class="group p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-blue-500 transition-all">
                    <h3 class="font-bold group-hover:text-blue-600 transition-colors">
                        {{ lesson.title }}
                    </h3>
                    <p class="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {{ lesson.description || "No description available." }}
                    </p>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
