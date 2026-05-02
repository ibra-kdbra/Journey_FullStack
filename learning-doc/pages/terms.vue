<template>
    <div class="container py-24 space-y-12 max-w-4xl animate-fade-up relative z-10">
        <div class="text-center space-y-4 mb-16">
            <h1 class="text-5xl font-black tracking-tight" :style="{ color: `rgb(var(--color-text))` }">
                Terms of Service
            </h1>
            <p class="text-lg" :style="{ color: `rgb(var(--color-text-muted))` }">
                Last updated: January 22, 2026
            </p>
        </div>

        <div class="glass-card p-10 sm:p-14 !rounded-2xl" :style="{ borderColor: `rgba(var(--color-border), 0.4)` }">
            <div class="prose prose-lg max-w-none" :style="{ color: `rgb(var(--color-text-soft))` }">
                <p class="lead font-medium text-xl mb-8" :style="{ color: `rgb(var(--color-text))` }">
                    By using Emi, you agree to comply with the following terms and
                    conditions.
                </p>

                <h2 :style="{ color: `rgb(var(--color-text))` }">1. Use of Content</h2>
                <p>
                    The tutorials and courses provided on Emi are for educational purposes.
                    You may use the code snippets in your own projects.
                </p>

                <h2 :style="{ color: `rgb(var(--color-text))` }">2. User Conduct</h2>
                <p>
                    Be respectful in the comments section. We reserve the right to remove
                    any content that is harmful or offensive.
                </p>

                <h2 :style="{ color: `rgb(var(--color-text))` }">3. Disclaimer</h2>
                <p>
                    The content is provided "as is" without warranty of any kind. We are not
                    responsible for any issues that may arise from the use of the tutorials.
                </p>
            </div>
        </div>
    </div>
</template>
