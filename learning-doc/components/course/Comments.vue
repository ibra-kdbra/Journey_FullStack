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
        <div class="flex items-center gap-2.5 mb-8">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                :style="{ background: `rgba(var(--color-accent-blue), 0.1)` }">
                <MessageSquare :size="16" :style="{ color: `rgb(var(--color-accent-blue))` }" />
            </div>
            <h2 class="text-xl font-bold" :style="{ color: `rgb(var(--color-text))` }">
                Discussion
            </h2>
        </div>

        <!-- Add Comment -->
        <div v-if="auth.isLoggedIn" class="glass-card !p-6 space-y-4">
            <textarea v-model="newComment" placeholder="Write a thought..."
                class="w-full rounded-xl p-4 text-sm outline-none resize-none min-h-[100px] transition-all duration-200"
                :style="{
                    background: `rgba(var(--color-surface), 0.8)`,
                    border: `1px solid rgba(var(--color-border), 0.4)`,
                    color: `rgb(var(--color-text))`,
                }" />
            <div class="flex justify-end">
                <button @click="handleSubmit" :disabled="loading || !newComment.trim()"
                    class="btn-primary !py-2 !px-5 !text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send :size="15" />
                    {{ loading ? "Posting..." : "Post Comment" }}
                </button>
            </div>
        </div>
        <div v-else class="glass-card !p-8 text-center" :style="{ borderStyle: 'dashed' }">
            <p class="mb-4 text-sm" :style="{ color: `rgb(var(--color-text-muted))` }">
                You must be logged in to join the discussion.
            </p>
            <NuxtLink to="/auth/sign-in" class="font-bold text-sm transition-all duration-200"
                :style="{ color: `rgb(var(--color-accent-blue))` }">
                Sign in to your account
            </NuxtLink>
        </div>

        <!-- Comments List -->
        <div class="space-y-3">
            <div v-for="comment in comments" :key="comment.id" class="group glass-card !p-5">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase"
                            :style="{
                                background: `rgba(var(--color-accent-blue), 0.1)`,
                                color: `rgb(var(--color-accent-blue))`
                            }">
                            {{ comment.author_name.charAt(0) }}
                        </div>
                        <span class="font-semibold text-sm" :style="{ color: `rgb(var(--color-text))` }">
                            {{ comment.author_name }}
                        </span>
                        <span class="text-xs" :style="{ color: `rgb(var(--color-text-muted))` }">
                            {{ new Date(comment.created).toLocaleDateString() }}
                        </span>
                    </div>
                    <button v-if="auth.user?.id === comment.author_id" @click="handleDelete(comment.id)"
                        class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        :style="{ color: `rgb(var(--color-accent-rose))` }">
                        <Trash2 :size="14" />
                    </button>
                </div>
                <p class="leading-relaxed pl-10 text-sm" :style="{ color: `rgb(var(--color-text-soft))` }">
                    {{ comment.content }}
                </p>
            </div>

            <div v-if="comments.length === 0" class="text-center py-12 italic text-sm"
                :style="{ color: `rgb(var(--color-text-muted))` }">
                No comments yet. Be the first to share your thoughts!
            </div>
        </div>
    </div>
</template>
