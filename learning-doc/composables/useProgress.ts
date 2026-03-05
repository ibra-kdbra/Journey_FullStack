import { defineStore } from "pinia";
import { usePocketBase } from "~/services/pocketbase";
import { useAuth } from "~/composables/useAuth";

export interface UserProgress {
    id?: string;
    user: string;
    course_track: string;
    completed_lessons: string[];
    last_accessed: string;
}

export const useProgress = defineStore("progress", () => {
    const pb = usePocketBase();
    const auth = useAuth();

    // state: map of track -> UserProgress record
    const progressMap = ref<Record<string, UserProgress>>({});

    // debouncer for saving to DB
    let saveTimeout: null | ReturnType<typeof setTimeout> = null;

    const fetchUserProgress = async () => {
        if (!auth.isLoggedIn || !auth.user?.id) return;
        try {
            const records = await pb.collection("user_progress").getFullList<UserProgress>({
                filter: `user = "${auth.user.id}"`,
            });

            const map: Record<string, UserProgress> = {};
            records.forEach(record => {
                map[record.course_track] = record;
            });
            progressMap.value = map;
        } catch (e) {
            console.error("Failed to fetch user progress:", e);
        }
    };

    const markLessonViewed = (track: string, slug: string) => {
        if (!auth.isLoggedIn || !auth.user?.id) return;

        if (!progressMap.value[track]) {
            progressMap.value[track] = {
                user: auth.user.id,
                course_track: track,
                completed_lessons: [],
                last_accessed: slug
            };
        }

        const current = progressMap.value[track];
        current.last_accessed = slug;

        if (!current.completed_lessons.includes(slug)) {
            current.completed_lessons.push(slug);
        }

        // Debounce save to DB (efficient for 5k-10k concurrent users)
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveProgressToDB(track);
        }, 2000);
    };

    const saveProgressToDB = async (track: string) => {
        const data = progressMap.value[track];
        if (!data) return;

        try {
            if (data.id) {
                await pb.collection("user_progress").update(data.id, {
                    completed_lessons: data.completed_lessons,
                    last_accessed: data.last_accessed
                });
            } else {
                const record = await pb.collection("user_progress").create({
                    user: data.user,
                    course_track: data.course_track,
                    completed_lessons: data.completed_lessons,
                    last_accessed: data.last_accessed
                });
                progressMap.value[track].id = record.id;
            }
        } catch (e) {
            console.error("Failed to save progress to DB:", e);
        }
    };

    const getLastAccessed = (track: string) => {
        return progressMap.value[track]?.last_accessed || null;
    };

    const getCompletionPercentage = (track: string, totalLessons: number) => {
        if (!totalLessons) return 0;
        const completedCount = progressMap.value[track]?.completed_lessons.length || 0;
        return Math.round((completedCount / totalLessons) * 100);
    };

    return {
        progressMap,
        fetchUserProgress,
        markLessonViewed,
        getLastAccessed,
        getCompletionPercentage
    };
});
