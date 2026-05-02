import { ref } from 'vue';
import { usePocketBase } from '~/services/pocketbase';
import { useAuth } from '~/composables/useAuth';
import { useProgress } from '~/composables/useProgress';

export interface ExamQuestion {
    id: string;
    question: string;
    answer: string;
    options?: string[]; // For multiple choice if needed later
    difficulty: number;
    order: number;
}

export interface ExamResult {
    id?: string;
    user: string;
    course: string;
    score: number;
    total: number;
    passed: boolean;
    completed_at: string;
}

export const useExam = () => {
    const pb = usePocketBase(); // Assuming this returns the PB client
    const auth = useAuth();
    const progress = useProgress();

    const questions = ref<ExamQuestion[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Fetch questions for a specific course from PocketBase
     */
    const fetchExamQuestions = async (courseId: string) => {
        loading.value = true;
        error.value = null;
        try {
            const records = await pb.collection('exam_questions').getFullList<ExamQuestion>({
                filter: `course = "${courseId}"`,
                sort: 'order_num',
            });
            questions.value = records;
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch exam questions';
            console.error('fetchExamQuestions Error:', err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Submit exam results to PocketBase
     */
    const submitExamResult = async (courseId: string, score: number, total: number) => {
        if (!auth.isLoggedIn) throw new Error('Authentication required');

        const passed = score / total >= 0.7; // 70% pass mark
        const data = {
            user: auth.user.id,
            course: courseId,
            score,
            total,
            passed,
            completed_at: new Date().toISOString(),
        };

        try {
            const record = await pb.collection('exam_results').create(data);
            
            // If passed, maybe update user vitality/XP
            if (passed) {
                // Future XP logic here
            }
            
            return record;
        } catch (err: any) {
            console.error('submitExamResult Error:', err);
            throw err;
        }
    };

    /**
     * Get previous exam results for the current user and course
     */
    const getExamResults = async (courseId: string) => {
        if (!auth.isLoggedIn) return [];
        try {
            return await pb.collection('exam_results').getFullList({
                filter: `user = "${auth.user.id}" && course = "${courseId}"`,
                sort: '-completed_at',
            });
        } catch (err) {
            console.error('getExamResults Error:', err);
            return [];
        }
    };

    /**
     * Check if a course is eligible for the final exam
     */
    const isEligibleForExam = (courseId: string, totalLessons: number) => {
        const completedCount = progress.getCompletedCountForCourse(courseId);
        return completedCount >= totalLessons;
    };

    return {
        questions,
        loading,
        error,
        fetchExamQuestions,
        submitExamResult,
        getExamResults,
        isEligibleForExam,
    };
};
