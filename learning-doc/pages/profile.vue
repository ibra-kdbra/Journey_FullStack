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
    Activity,
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
            <div class="animate-spin rounded-full h-10 w-10 border-2 border-transparent" :style="{
                borderTopColor: `rgb(var(--color-accent-blue))`,
                borderRightColor: `rgb(var(--color-accent-blue))`,
            }" />
        </div>

        <div v-else-if="auth.user" class="max-w-4xl mx-auto space-y-8 animate-fade-up">
            <!-- Profile Header -->
            <div class="glass-card !p-0 overflow-hidden">
                <!-- Gradient Banner -->
                <div class="h-32 relative" :style="{ background: `var(--gradient-hero)` }">
                    <div class="absolute inset-0"
                        :style="{ background: `linear-gradient(to bottom, transparent 50%, rgba(var(--color-bg-card), 0.9))` }" />
                </div>
                <div class="px-8 pb-8 -mt-12 relative z-10">
                    <div class="flex items-end gap-5">
                        <div class="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ring-4"
                            :style="{
                                background: `var(--gradient-accent)`,
                                ringColor: `rgb(var(--color-bg-card))`,
                            }">
                            {{ auth.user.username.charAt(0).toUpperCase() }}
                        </div>
                        <div class="pb-1">
                            <h1 class="text-2xl font-extrabold tracking-tight"
                                :style="{ color: `rgb(var(--color-text))` }">
                                {{ auth.user.username }}
                            </h1>
                            <p class="text-sm" :style="{ color: `rgb(var(--color-text-muted))` }">
                                {{ auth.user.email }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Vitality Metrics Section -->
            <VitalityMetrics />

            <div class="grid md:grid-cols-2 gap-6">
                <!-- Account Info Card -->
                <div class="glass-card !p-7 space-y-6">
                    <h2 class="text-lg font-bold flex items-center gap-2" :style="{ color: `rgb(var(--color-text))` }">
                        <UserIcon :size="18" :style="{ color: `rgb(var(--color-accent-blue))` }" />
                        Account Details
                    </h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                                :style="{ background: `rgba(var(--color-accent-blue), 0.08)` }">
                                <Mail :size="16" :style="{ color: `rgb(var(--color-accent-blue))` }" />
                            </div>
                            <div>
                                <div class="text-xs font-bold uppercase tracking-wider"
                                    :style="{ color: `rgb(var(--color-text-muted))` }">
                                    Email
                                </div>
                                <div class="font-medium text-sm" :style="{ color: `rgb(var(--color-text))` }">
                                    {{ auth.user.email }}
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                                :style="{ background: `rgba(var(--color-accent-violet), 0.08)` }">
                                <Calendar :size="16" :style="{ color: `rgb(var(--color-accent-violet))` }" />
                            </div>
                            <div>
                                <div class="text-xs font-bold uppercase tracking-wider"
                                    :style="{ color: `rgb(var(--color-text-muted))` }">
                                    Joined
                                </div>
                                <div class="font-medium text-sm" :style="{ color: `rgb(var(--color-text))` }">
                                    {{ formatDate(auth.user.created) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Card -->
                <div class="glass-card !p-7 space-y-6">
                    <h2 class="text-lg font-bold flex items-center gap-2" :style="{ color: `rgb(var(--color-text))` }">
                        <Shield :size="18" :style="{ color: `rgb(var(--color-accent-amber))` }" />
                        Subscription Status
                    </h2>

                    <div v-if="auth.user.status" class="p-4 rounded-xl flex items-center gap-3" :style="{
                        background: `rgba(var(--color-accent-amber), 0.08)`,
                        border: `1px solid rgba(var(--color-accent-amber), 0.15)`,
                    }">
                        <Crown :size="20" :style="{ color: `rgb(var(--color-accent-amber))` }" />
                        <div>
                            <div class="font-bold text-sm" :style="{ color: `rgb(var(--color-accent-amber))` }">
                                Premium Member
                            </div>
                            <div class="text-xs" :style="{ color: `rgb(var(--color-text-muted))` }">
                                Full access to all courses
                            </div>
                        </div>
                        <CheckCircle class="ml-auto" :style="{ color: `rgb(var(--color-accent-emerald))` }" />
                    </div>
                    <div v-else class="space-y-4">
                        <div class="p-4 rounded-xl flex items-center gap-3" :style="{
                            background: `rgba(var(--color-surface), 0.8)`,
                            border: `1px solid rgba(var(--color-border), 0.4)`,
                        }">
                            <XCircle :size="20" :style="{ color: `rgb(var(--color-text-muted))` }" />
                            <div class="font-medium text-sm" :style="{ color: `rgb(var(--color-text-soft))` }">
                                Free Tier
                            </div>
                        </div>
                        <button class="btn-primary w-full !py-3 !rounded-xl">
                            <Sparkles :size="16" />
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
