<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import {
    Crown,
    CheckCircle,
    XCircle,
    Mail,
    Calendar,
    User as UserIcon,
    Sparkles,
    Shield,
} from "lucide-vue-next";
import VitalityMetrics from "~/components/custom/VitalityMetrics.vue";
import { useProgress } from "~/composables/useProgress";

const auth = useAuth();
const progress = useProgress();
const loading = ref(true);

onMounted(async () => {
    if (!auth.isLoggedIn) {
        navigateTo("/auth/sign-in");
    } else {
        await progress.fetchUserProgress();
    }
    loading.value = false;
});

const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};
</script>

<template>
    <div class="container py-12">
        <div v-if="loading" class="flex justify-center py-24">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-[rgb(var(--color-accent-blue))]" />
        </div>

        <div v-else-if="auth.user" class="max-w-4xl mx-auto space-y-8">
            <!-- Profile Header -->
            <div class="surface-card p-6 flex items-center gap-5">
                <div class="h-16 w-16 rounded-lg bg-[rgb(var(--color-accent-blue))] text-white text-2xl font-bold flex items-center justify-center flex-shrink-0">
                    {{ auth.user.username.charAt(0).toUpperCase() }}
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-[rgb(var(--color-text))]">
                        {{ auth.user.username }}
                    </h1>
                    <p class="text-sm text-[rgb(var(--color-text-soft))]">
                        {{ auth.user.email }}
                    </p>
                </div>
            </div>

            <!-- Vitality Metrics Section -->
            <VitalityMetrics />

            <div class="grid md:grid-cols-2 gap-6">
                <!-- Account Info Card -->
                <div class="surface-card p-6 space-y-5">
                    <h2 class="text-base font-bold flex items-center gap-2 text-[rgb(var(--color-text))]">
                        <UserIcon :size="18" class="text-[rgb(var(--color-accent-blue))]" />
                        Account Details
                    </h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-blue))]">
                                <Mail :size="15" />
                            </div>
                            <div>
                                <div class="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
                                    Email
                                </div>
                                <div class="font-semibold text-sm text-[rgb(var(--color-text))]">
                                    {{ auth.user.email }}
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent-violet))]">
                                <Calendar :size="15" />
                            </div>
                            <div>
                                <div class="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
                                    Member Since
                                </div>
                                <div class="font-semibold text-sm text-[rgb(var(--color-text))]">
                                    {{ formatDate(auth.user.created) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Card -->
                <div class="surface-card p-6 space-y-5">
                    <h2 class="text-base font-bold flex items-center gap-2 text-[rgb(var(--color-text))]">
                        <Shield :size="18" class="text-amber-500" />
                        Subscription Status
                    </h2>

                    <div v-if="auth.user.is_premium" class="p-4 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                        <Crown :size="20" class="text-amber-600" />
                        <div>
                            <div class="font-bold text-sm text-amber-600 dark:text-amber-400">
                                Premium Member
                            </div>
                            <div class="text-xs text-[rgb(var(--color-text-soft))]">
                                Unrestricted access to all curricula
                            </div>
                        </div>
                        <CheckCircle class="ml-auto text-emerald-600" :size="18" />
                    </div>
                    <div v-else class="space-y-4">
                        <div class="p-4 rounded-md bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center gap-3">
                            <XCircle :size="18" class="text-[rgb(var(--color-text-muted))]" />
                            <div class="font-semibold text-sm text-[rgb(var(--color-text-soft))]">
                                Standard Free Plan
                            </div>
                        </div>
                        <NuxtLink to="/membership" class="btn-primary w-full !py-2.5 !rounded-md">
                            <Sparkles :size="16" />
                            Upgrade to Lifetime Access
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
