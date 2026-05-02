<script setup>
import { Check, Zap, Rocket, Star, ShieldCheck } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

useHead({
    title: 'Elite Membership - Emi',
    meta: [
        { name: 'description', content: 'Unlock the full potential of your engineering career with Emi Premium.' }
    ]
});

const authStore = useAuth();

const benefits = [
    { title: "Software Engineering Track", desc: "Full access to senior-level system design and architecture courses." },
    { title: "Offline Downloads", desc: "Take your learning anywhere with PDF and Markdown exporters." },
    { title: "Priority Support", desc: "Get answers to your technical questions directly from experts." },
    { title: "Early Access", desc: "Be the first to explore new courses and Beta features." }
];

const upgrade = async () => {
    if (!authStore.isLoggedIn) {
        return navigateTo('/auth/sign-in');
    }

    // Simulate payment and upgrade
    alert("Simulating secure payment connection...");
    setTimeout(async () => {
        try {
            // In a real app, this would be a server-side verified webhook update
            // For this demo, we'll update the local state to show it works
            authStore.user.is_premium = true;
            alert("Upgrade Successful! Welcome to Emi Premium.");
            navigateTo('/courses/courses/software-engineering/lesson_1');
        } catch (e) {
            alert("Payment failed. Please try again.");
        }
    }, 1500);
};
</script>

<template>
    <div class="min-h-screen relative overflow-hidden">
        <!-- Background Accents -->
        <div
            class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div
            class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div class="container py-24 relative z-10">
            <div class="max-w-4xl mx-auto space-y-16">
                <!-- Header -->
                <div class="text-center space-y-6 animate-fade-up">
                    <div
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                        <Star :size="16" class="text-amber-500 fill-amber-500" />
                        <span class="text-xs font-black uppercase tracking-widest text-amber-500">Elevate Your
                            Career</span>
                    </div>
                    <h1 class="text-6xl font-black tracking-tighter" :style="{ color: `rgb(var(--color-text))` }">
                        Join the <span
                            class="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Elite</span>
                    </h1>
                    <p class="text-xl max-w-2xl mx-auto leading-relaxed"
                        :style="{ color: `rgb(var(--color-text-soft))` }">
                        Emi Premium provides the tools, deep-dives, and community support needed to transition from
                        developer to world-class engineer.
                    </p>
                </div>

                <!-- Pricing Card -->
                <div class="grid md:grid-cols-2 gap-8 items-stretch animate-fade-up" style="animation-delay: 100ms">
                    <!-- Features List -->
                    <div class="space-y-8 p-4">
                        <h3 class="text-2xl font-black" :style="{ color: `rgb(var(--color-text))` }">What's included:
                        </h3>
                        <div class="space-y-6">
                            <div v-for="benefit in benefits" :key="benefit.title" class="flex gap-4 group">
                                <div
                                    class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 border border-green-500/20 group-hover:scale-110 transition-transform">
                                    <Check :size="20" class="text-green-500" />
                                </div>
                                <div>
                                    <h4 class="font-bold mb-1" :style="{ color: `rgb(var(--color-text))` }">{{
                                        benefit.title }}</h4>
                                    <p class="text-sm" :style="{ color: `rgb(var(--color-text-muted))` }">{{
                                        benefit.desc }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Upgrade Action -->
                    <div
                        class="glass-card !p-12 !rounded-[40px] flex flex-col justify-between border-amber-500/30 relative shadow-2xl shadow-amber-500/5">
                        <div class="space-y-6">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="text-4xl font-black mb-2" :style="{ color: `rgb(var(--color-text))` }">
                                        $19.99</h3>
                                    <p class="text-sm font-bold opacity-50 uppercase tracking-widest"
                                        :style="{ color: `rgb(var(--color-text))` }">Lifetime Access</p>
                                </div>
                                <div
                                    class="px-3 py-1 rounded-lg bg-amber-500 text-black text-[10px] font-black uppercase">
                                    Best Value</div>
                            </div>

                            <hr class="border-white/10" />

                            <div class="space-y-4">
                                <div class="flex items-center gap-3 text-sm"
                                    :style="{ color: `rgb(var(--color-text-soft))` }">
                                    <ShieldCheck :size="16" class="text-amber-500" />
                                    Secure one-time payment
                                </div>
                                <div class="flex items-center gap-3 text-sm"
                                    :style="{ color: `rgb(var(--color-text-soft))` }">
                                    <Zap :size="16" class="text-amber-500" />
                                    Instant track unlocking
                                </div>
                            </div>
                        </div>

                        <button @click="upgrade"
                            class="w-full py-5 mt-10 bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-black text-xl rounded-2xl transition-all duration-300 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95">
                            {{ authStore.user?.is_premium ? 'Already Premium' : 'Upgrade Now' }}
                        </button>
                    </div>
                </div>

                <!-- Trust Footer -->
                <div class="text-center pt-8 opacity-40 animate-fade-up" style="animation-delay: 200ms">
                    <p class="text-xs font-bold uppercase tracking-[0.2em]"
                        :style="{ color: `rgb(var(--color-text))` }">Trusted by engineers at top-tier tech companies</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.glass-card {
    background: rgba(var(--color-surface-raw), 0.4);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(var(--color-border-raw), 0.5);
}
</style>
