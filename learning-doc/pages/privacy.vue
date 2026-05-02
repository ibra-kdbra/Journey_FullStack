<template>
    <div class="container py-24 space-y-12 max-w-4xl animate-fade-up relative z-10">
        <div class="text-center space-y-4 mb-16">
            <h1 class="text-5xl font-black tracking-tight" :style="{ color: `rgb(var(--color-text))` }">
                Privacy Policy
            </h1>
            <p class="text-lg" :style="{ color: `rgb(var(--color-text-muted))` }">
                Last updated: January 22, 2026
            </p>
        </div>

        <div class="glass-card p-10 sm:p-14 !rounded-2xl" :style="{ borderColor: `rgba(var(--color-border), 0.4)` }">
            <div class="prose prose-lg max-w-none" :style="{ color: `rgb(var(--color-text-soft))` }">
                <p class="lead font-medium text-xl mb-8" :style="{ color: `rgb(var(--color-text))` }">
                    At Emi, your privacy is important to us. This policy outlines the types
                    of information we collect and how we use it.
                </p>

                <h2 :style="{ color: `rgb(var(--color-text))` }">1. Information We Collect</h2>
                <p>
                    When you create an account, we collect your email address and username
                    to manage your profile and comments.
                </p>

                <h2 :style="{ color: `rgb(var(--color-text))` }">2. How We Use Information</h2>
                <p>
                    We use your data to provide a personalized learning experience and to
                    manage the interactive features of our documentation.
                </p>

                <h2 :style="{ color: `rgb(var(--color-text))` }">3. Data Security</h2>
                <p>
                    Your data is stored securely using industry-standard backend technology.
                    We do not sell your personal information to third parties.
                </p>
            </div>
        </div>
    </div>
</template>
