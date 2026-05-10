<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { useComments } from "~/composables/useComments";
import { MessageSquare, Trash2, Send } from "lucide-vue-next";

const props = defineProps<{
    docPath: string;
}>();

const auth = useAuth();
const { getComments, createComment, deleteComment } = useComments();

const comments = ref<any[]>([]);
const newComment = ref("");
const loading = ref(false);

const loadComments = async () => {
    comments.value = await getComments(props.docPath);
};

const handleSubmit = async () => {
    if (!newComment.value.trim() || !auth.user) return;

    loading.value = true;
    try {
        await createComment({
            doc_path: props.docPath,
            content: newComment.value,
            author_id: auth.user.id,
            author_name: auth.user.username,
        });
        newComment.value = "";
        await loadComments();
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
        await deleteComment(id);
        await loadComments();
    } catch (err) {
        console.error(err);
    }
};

onMounted(loadComments);
watch(() => props.docPath, loadComments);
</script>

<template>
    <div class="space-y-8">
        <div class="flex items-center gap-2 mb-8">
            <MessageSquare :size="24" class="text-blue-600" />
            <h2 class="text-2xl font-bold">Discussion</h2>
        </div>

        <!-- Add Comment -->
        <div v-if="auth.isLoggedIn"
            class="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm space-y-4">
            <textarea v-model="newComment" placeholder="Write a thought..."
                class="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]" />
            <div class="flex justify-end">
                <button @click="handleSubmit" :disabled="loading || !newComment.trim()"
                    class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition-all">
                    <Send :size="18" />
                    {{ loading ? "Posting..." : "Post Comment" }}
                </button>
            </div>
        </div>
        <div v-else
            class="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <p class="text-muted-foreground mb-4">
                You must be logged in to join the discussion.
            </p>
            <NuxtLink to="/auth/sign-in" class="text-blue-600 font-bold hover:underline">Sign in to your account
            </NuxtLink>
        </div>

        <!-- Comments List -->
        <div class="space-y-4">
            <div v-for="comment in comments" :key="comment.id"
                class="group bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold uppercase">
                            {{ comment.author_name.charAt(0) }}
                        </div>
                        <span class="font-bold text-sm">{{ comment.author_name }}</span>
                        <span class="text-xs text-muted-foreground">{{
                            new Date(comment.created).toLocaleDateString()
                            }}</span>
                    </div>
                    <button v-if="auth.user?.id === comment.author_id" @click="handleDelete(comment.id)"
                        class="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 :size="16" />
                    </button>
                </div>
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                    {{ comment.content }}
                </p>
            </div>

            <div v-if="comments.length === 0" class="text-center py-12 text-muted-foreground italic">
                No comments yet. Be the first to share your thoughts!
            </div>
        </div>
    </div>
</template>
