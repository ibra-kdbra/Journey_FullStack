<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { UserPlus, ArrowRight } from "lucide-vue-next";

const auth = useAuth();
const username = ref("");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const error = ref("");
const loading = ref(false);

const handleSignUp = async () => {
    if (password.value !== passwordConfirm.value) {
        error.value = "Passwords do not match.";
        return;
    }

    error.value = "";
    loading.value = true;
    try {
        await auth.register({
            username: username.value,
            email: email.value,
            password: password.value,
            passwordConfirm: passwordConfirm.value,
        });
        await auth.login(email.value, password.value);
        navigateTo("/profile");
    } catch (err: any) {
        error.value = "Registration failed. Try a different email or username.";
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
                    <UserPlus :size="20" />
                </div>
                <h2 class="text-2xl font-bold text-[rgb(var(--color-text))]">
                    Create Account
                </h2>
                <p class="text-xs text-[rgb(var(--color-text-soft))]">
                    Join Journey Doc and start your engineering track today
                </p>
            </div>

            <form @submit.prevent="handleSignUp" class="space-y-4">
                <div v-if="error" class="p-3 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    {{ error }}
                </div>

                <div class="space-y-3">
                    <div>
                        <label for="username" class="block text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-soft))] mb-1">
                            Username
                        </label>
                        <input v-model="username" id="username" type="text" required
                            class="block w-full px-3.5 py-2.5 rounded-md text-sm bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] focus:border-[rgb(var(--color-accent-blue))] focus:outline-none"
                            placeholder="johndoe" />
                    </div>
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
                    <div>
                        <label for="confirm" class="block text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-soft))] mb-1">
                            Confirm Password
                        </label>
                        <input v-model="passwordConfirm" id="confirm" type="password" required
                            class="block w-full px-3.5 py-2.5 rounded-md text-sm bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] focus:border-[rgb(var(--color-accent-blue))] focus:outline-none"
                            placeholder="••••••••" />
                    </div>
                </div>

                <button type="submit" :disabled="loading" class="btn-primary w-full !py-2.5 !rounded-md disabled:opacity-50">
                    <span v-if="loading" class="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    {{ loading ? "Creating account..." : "Create Account" }}
                    <ArrowRight v-if="!loading" :size="16" />
                </button>
            </form>

            <div class="text-center text-xs text-[rgb(var(--color-text-soft))]">
                Already have an account?
                <NuxtLink to="/auth/sign-in" class="font-bold text-[rgb(var(--color-accent-blue))] hover:underline">
                    Log in
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
