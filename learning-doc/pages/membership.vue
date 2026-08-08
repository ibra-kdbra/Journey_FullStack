<script setup lang="ts">
import { Check, Zap, Star, ShieldCheck } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

useHead({
    title: 'Membership — Journey Doc',
    meta: [
        { name: 'description', content: 'Unlock the full potential of your software engineering career.' }
    ]
});

const authStore = useAuth();

const benefits = [
    { title: "Full Systems & Architecture Tracks", desc: "Unrestricted access to all advanced C, Rust, Go, and software architecture modules." },
    { title: "Interactive Exam Modules", desc: "Test your low-level comprehension with 200+ question capstone exams." },
    { title: "Priority Code Exercises", desc: "Hands-on projects covering allocators, LSM trees, micro-kernels, and custom network loops." },
    { title: "Direct Updates", desc: "Instant access to all newly added course tracks and deep-dive revisions." }
];

const upgrade = async () => {
    if (!authStore.isLoggedIn) {
        return navigateTo('/auth/sign-in');
    }

    alert("Simulating secure payment connection...");
    setTimeout(async () => {
        try {
            authStore.user.is_premium = true;
            alert("Upgrade Successful! Welcome to Premium Membership.");
            navigateTo('/courses');
        } catch (e) {
            alert("Payment failed. Please try again.");
        }
    }, 1000);
};
</script>

<template>
    <div class="min-h-screen py-16 sm:py-24">
        <div class="container max-w-5xl mx-auto px-4">
            <div class="max-w-3xl mx-auto text-center space-y-4 mb-16">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mx-auto">
                    <Star :size="14" class="fill-current" />
                    Premium Engineering Access
                </div>
                <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-[rgb(var(--color-text))]">
                    Elevate Your Career
                </h1>
                <p class="text-base sm:text-lg text-[rgb(var(--color-text-soft))] max-w-xl mx-auto">
                    Access deep-dive technical modules, low-level systems architectures, and interactive capstone exams.
                </p>
            </div>

            <!-- Pricing Grid -->
            <div class="grid md:grid-cols-2 gap-8 items-start">
                <!-- Features List -->
                <div class="surface-card p-8 space-y-6">
                    <h3 class="text-xl font-bold text-[rgb(var(--color-text))]">
                        What's Included
                    </h3>
                    <div class="space-y-5">
                        <div v-for="benefit in benefits" :key="benefit.title" class="flex items-start gap-3.5">
                            <div class="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                                <Check :size="16" />
                            </div>
                            <div>
                                <h4 class="font-bold text-sm text-[rgb(var(--color-text))] mb-0.5">
                                    {{ benefit.title }}
                                </h4>
                                <p class="text-xs leading-relaxed text-[rgb(var(--color-text-soft))]">
                                    {{ benefit.desc }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upgrade Action Card -->
                <div class="surface-card p-8 flex flex-col justify-between border-amber-500/40">
                    <div class="space-y-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-4xl font-black text-[rgb(var(--color-text))]">
                                    $19.99
                                </div>
                                <p class="text-xs font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-wider mt-1">
                                    One-Time Lifetime Access
                                </p>
                            </div>
                            <span class="px-2.5 py-1 rounded bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
                                Lifetime
                            </span>
                        </div>

                        <hr class="border-[rgb(var(--color-border))]" />

                        <div class="space-y-3">
                            <div class="flex items-center gap-2.5 text-xs text-[rgb(var(--color-text-soft))]">
                                <ShieldCheck :size="15" class="text-amber-600" />
                                Secure 256-bit payment verification
                            </div>
                            <div class="flex items-center gap-2.5 text-xs text-[rgb(var(--color-text-soft))]">
                                <Zap :size="15" class="text-amber-600" />
                                Instant unlock across all tracks
                            </div>
                        </div>
                    </div>

                    <button @click="upgrade" class="btn-primary w-full py-3.5 mt-8 !bg-amber-600 hover:!bg-amber-700 !text-white !font-bold text-base !rounded-md">
                        {{ authStore.user?.is_premium ? 'Already Premium Member' : 'Upgrade to Lifetime Access' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
