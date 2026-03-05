<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { Sparkles, ArrowRight } from "lucide-vue-next";

const auth = useAuth();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
    error.value = "";
    loading.value = true;
    try {
        await auth.login(email.value, password.value);
        navigateTo("/profile");
    } catch (err: any) {
        error.value = "Login failed. Please check your credentials.";
        console.error(err);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="flex-grow flex items-center justify-center py-12 px-4 relative">
        <!-- Background decoration -->
        <div class="absolute inset-0 gradient-bg -z-10" />
        <div class="absolute top-1/4 left-1/4 w-64 h-64 blob -z-10"
            :style="{ background: `rgba(var(--color-accent-blue), 0.1)` }" />
        <div class="absolute bottom-1/4 right-1/4 w-48 h-48 blob -z-10" style="animation-delay: -4s;"
            :style="{ background: `rgba(var(--color-accent-violet), 0.08)` }" />

        <div class="max-w-md w-full space-y-8 glass-card !p-8 animate-fade-up">
            <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                    :style="{ background: `var(--gradient-accent)` }">
                    <Sparkles :size="22" class="text-white" />
                </div>
                <h2 class="text-2xl font-extrabold" :style="{ color: `rgb(var(--color-text))` }">
                    Sign In
                </h2>
                <p class="mt-2 text-sm" :style="{ color: `rgb(var(--color-text-muted))` }">
                    Welcome back to Emi
                </p>
            </div>

            <form @submit.prevent="handleLogin" class="mt-6 space-y-5">
                <div v-if="error" class="p-3 rounded-xl text-sm font-medium" :style="{
                    background: `rgba(var(--color-accent-rose), 0.08)`,
                    color: `rgb(var(--color-accent-rose))`,
                    border: `1px solid rgba(var(--color-accent-rose), 0.15)`
                }">
                    {{ error }}
                </div>

                <div class="space-y-4">
                    <div>
                        <label for="email" class="block text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                            :style="{ color: `rgb(var(--color-text-soft))` }">
                            Email address
                        </label>
                        <input v-model="email" id="email" type="email" required
                            class="appearance-none block w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                            :style="{
                                background: `rgba(var(--color-surface), 0.8)`,
                                border: `1px solid rgba(var(--color-border), 0.5)`,
                                color: `rgb(var(--color-text))`,
                            }" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label for="password" class="block text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                            :style="{ color: `rgb(var(--color-text-soft))` }">
                            Password
                        </label>
                        <input v-model="password" id="password" type="password" required
                            class="appearance-none block w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                            :style="{
                                background: `rgba(var(--color-surface), 0.8)`,
                                border: `1px solid rgba(var(--color-border), 0.5)`,
                                color: `rgb(var(--color-text))`,
                            }" placeholder="••••••••" />
                    </div>
                </div>

                <button type="submit" :disabled="loading"
                    class="btn-primary w-full !py-3 !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="loading"
                        class="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    {{ loading ? "Signing in..." : "Sign In" }}
                    <ArrowRight v-if="!loading" :size="16" />
                </button>
            </form>

            <div class="text-center text-sm">
                <span :style="{ color: `rgb(var(--color-text-muted))` }">Don't have an account? </span>
                <NuxtLink to="/auth/sign-up" class="font-bold transition-all duration-200"
                    :style="{ color: `rgb(var(--color-accent-blue))` }">
                    Sign up
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
