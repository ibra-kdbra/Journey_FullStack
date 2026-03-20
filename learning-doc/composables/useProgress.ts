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

export interface VitalityMetrics {
    id?: string;
    user: string;
    streak_count: number;
    longest_streak: number;
    last_activity_date: string;
    total_xp: number;
    activity_log: Record<string, number>; // date -> action count
}

export const useProgress = defineStore("progress", () => {
    const pb = usePocketBase();
    const auth = useAuth();

    // state: map of track -> UserProgress record
    const progressMap = ref<Record<string, UserProgress>>({});
    const vitality = ref<VitalityMetrics | null>(null);

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
            
            // Fetch Vitality Metrics
            await fetchVitality();
        } catch (e) {
            console.error("Failed to fetch user progress:", e);
        }
    };

    const fetchVitality = async () => {
        if (!auth.isLoggedIn || !auth.user?.id) return;
        try {
            const record = await pb.collection("user_vitality").getFirstListItem<VitalityMetrics>(
                `user = "${auth.user.id}"`
            ).catch(() => null);

            if (record) {
                vitality.value = record;
            } else {
                // Initialize if not exists
                vitality.value = {
                    user: auth.user.id,
                    streak_count: 0,
                    longest_streak: 0,
                    last_activity_date: "",
                    total_xp: 0,
                    activity_log: {}
                };
            }
        } catch (e) {
            console.error("Failed to fetch vitality:", e);
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
            // Award XP for completing a lesson
            updateVitality(10);
        }

        // Debounce save to DB
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveProgressToDB(track);
            saveVitalityToDB();
        }, 2000);
    };

    const updateVitality = (xpGain: number) => {
        if (!vitality.value) return;

        const today = new Date().toISOString().split('T')[0];
        const lastActivity = vitality.value.last_activity_date;

        // Update XP
        vitality.value.total_xp += xpGain;

        // Update Activity Log
        if (!vitality.value.activity_log[today]) {
            vitality.value.activity_log[today] = 0;
        }
        vitality.value.activity_log[today] += 1;

        // Update Streak
        if (lastActivity !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActivity === yesterdayStr) {
                vitality.value.streak_count += 1;
            } else if (lastActivity === "") {
                vitality.value.streak_count = 1;
            } else {
                vitality.value.streak_count = 1; // Reset streak if missed a day
            }

            if (vitality.value.streak_count > vitality.value.longest_streak) {
                vitality.value.longest_streak = vitality.value.streak_count;
            }
            
            vitality.value.last_activity_date = today;
        }
    };

    const saveVitalityToDB = async () => {
        if (!vitality.value || !auth.user?.id) return;

        try {
            if (vitality.value.id) {
                await pb.collection("user_vitality").update(vitality.value.id, vitality.value);
            } else {
                const record = await pb.collection("user_vitality").create(vitality.value);
                vitality.value.id = record.id;
            }
        } catch (e) {
            console.error("Failed to save vitality to DB:", e);
        }
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
        vitality,
        fetchUserProgress,
        markLessonViewed,
        getLastAccessed,
        getCompletionPercentage,
        updateVitality // Exposed for other activities like comments
    };
});
