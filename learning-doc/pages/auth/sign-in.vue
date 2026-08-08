<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { BookOpen, ArrowRight } from "lucide-vue-next";

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
    <div class="flex-grow flex items-center justify-center py-16 px-4">
        <div class="max-w-md w-full space-y-6 surface-card p-8">
            <div class="text-center space-y-2">
                <div class="inline-flex items-center justify-center w-10 h-10 rounded-md bg-[rgb(var(--color-accent-blue))] text-white mb-2">
                    <BookOpen :size="20" />
                </div>
                <h2 class="text-2xl font-bold text-[rgb(var(--color-text))]">
                    Sign In to Journey Doc
                </h2>
                <p class="text-xs text-[rgb(var(--color-text-soft))]">
                    Access your courses and track your engineering progress
                </p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div v-if="error" class="p-3 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    {{ error }}
                </div>

                <div class="space-y-3">
                    <div>
                        <label for="email" class="block text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-soft))] mb-1">
                            Email address
                        </label>
                        <input v-model="email" id="email" type="email" required
                            class="block w-full px-3.5 py-2.5 rounded-md text-sm bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] focus:border-[rgb(var(--color-accent-blue))] focus:outline-none"
                            placeholder="you@example.com" />
                    </div>
                    <div>
                        <label for="password" class="block text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-soft))] mb-1">
                            Password
                        </label>
                        <input v-model="password" id="password" type="password" required
                            class="block w-full px-3.5 py-2.5 rounded-md text-sm bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] focus:border-[rgb(var(--color-accent-blue))] focus:outline-none"
                            placeholder="••••••••" />
                    </div>
                </div>

                <button type="submit" :disabled="loading" class="btn-primary w-full !py-2.5 !rounded-md disabled:opacity-50">
                    <span v-if="loading" class="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    {{ loading ? "Signing in..." : "Sign In" }}
                    <ArrowRight v-if="!loading" :size="16" />
                </button>
            </form>

            <div class="text-center text-xs text-[rgb(var(--color-text-soft))]">
                Don't have an account?
                <NuxtLink to="/auth/sign-up" class="font-bold text-[rgb(var(--color-accent-blue))] hover:underline">
                    Sign up
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
