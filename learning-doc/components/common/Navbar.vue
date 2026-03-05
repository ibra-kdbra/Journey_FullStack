<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { useTheme } from "~/composables/useTheme";
import { LogOut, User, Menu, X, Sparkles, Sun, Moon } from "lucide-vue-next";

const auth = useAuth();
const { theme, toggleTheme, isInitialized } = useTheme();
const isMenuOpen = ref(false);
const scrolled = ref(false);

const handleSignOut = () => {
    auth.logout();
};

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

onMounted(() => {
    const onScroll = () => {
        scrolled.value = window.scrollY > 10;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onUnmounted(() => window.removeEventListener("scroll", onScroll));
});
</script>

<template>
    <nav class="sticky top-0 z-50 w-full transition-all duration-300" :class="[
        scrolled
            ? 'glass shadow-sm border-b'
            : 'bg-transparent'
    ]" :style="scrolled ? { borderColor: `rgba(var(--color-border), 0.4)` } : {}">
        <div class="container flex h-16 items-center justify-between">
            <div class="flex items-center gap-8">
                <NuxtLink to="/" class="group flex items-center gap-2.5 transition-all duration-300">
                    <div class="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300"
                        :style="{ background: `var(--gradient-accent)` }">
                        <Sparkles :size="16" class="text-white" />
                    </div>
                    <span
                        class="text-xl font-extrabold tracking-tight transition-all duration-300 group-hover:opacity-80"
                        :style="{ color: `rgb(var(--color-text))` }">
                        Emi
                    </span>
                </NuxtLink>

                <!-- Desktop Nav -->
                <div class="hidden md:flex items-center gap-1">
                    <NuxtLink to="/courses"
                        class="relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white/5"
                        :style="{ color: `rgb(var(--color-text-soft))` }" active-class="!font-bold"
                        :active-style="{ color: `rgb(var(--color-accent-blue))` }">
                        Courses
                    </NuxtLink>
                    <NuxtLink to="/about"
                        class="relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white/5"
                        :style="{ color: `rgb(var(--color-text-soft))` }" active-class="!font-bold">
                        About
                    </NuxtLink>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button v-if="isInitialized" @click="toggleTheme"
                    class="p-2 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5"
                    :style="{ color: `rgb(var(--color-text-soft))` }" aria-label="Toggle theme">
                    <Sun v-if="theme === 'dark'" :size="18" />
                    <Moon v-else :size="18" />
                </button>
                <template v-if="auth.isLoggedIn">
                    <div class="hidden md:flex items-center gap-3">
                        <NuxtLink to="/profile"
                            class="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200"
                            :style="{
                                background: `rgba(var(--color-accent-blue), 0.1)`,
                                color: `rgb(var(--color-accent-blue))`
                            }">
                            <User :size="15" />
                            {{ auth.user?.username }}
                        </NuxtLink>
                        <button @click="handleSignOut"
                            class="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
                            :style="{ color: `rgb(var(--color-accent-rose))` }">
                            <LogOut :size="16" class="mr-1.5" />
                            Logout
                        </button>
                    </div>
                </template>
                <template v-else>
                    <div class="hidden md:flex items-center gap-2">
                        <NuxtLink to="/auth/sign-in"
                            class="inline-flex h-9 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                            :style="{ color: `rgb(var(--color-text-soft))` }">
                            Log in
                        </NuxtLink>
                        <NuxtLink to="/auth/sign-up" class="btn-primary !py-2 !px-5 !text-sm !rounded-lg">
                            Sign up
                        </NuxtLink>
                    </div>
                </template>

                <!-- Mobile Menu Toggle -->
                <button @click="toggleMenu" class="md:hidden rounded-lg p-2 transition-all duration-200"
                    :style="{ color: `rgb(var(--color-text))` }">
                    <Menu v-if="!isMenuOpen" :size="22" />
                    <X v-else :size="22" />
                </button>
            </div>
        </div>

        <!-- Mobile Nav -->
        <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2">
            <div v-if="isMenuOpen" class="md:hidden glass p-5 space-y-3 border-t"
                :style="{ borderColor: `rgba(var(--color-border), 0.4)` }">
                <NuxtLink to="/courses"
                    class="block px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200"
                    :style="{ color: `rgb(var(--color-text))` }" @click="isMenuOpen = false">
                    Courses
                </NuxtLink>
                <NuxtLink to="/about"
                    class="block px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200"
                    :style="{ color: `rgb(var(--color-text))` }" @click="isMenuOpen = false">
                    About
                </NuxtLink>
                <div class="h-px my-2" :style="{ background: `rgba(var(--color-border), 0.4)` }" />
                <button v-if="isInitialized" @click="toggleTheme"
                    class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200"
                    :style="{ color: `rgb(var(--color-text))` }">
                    <Sun v-if="theme === 'dark'" :size="18" />
                    <Moon v-else :size="18" />
                    {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
                </button>
                <template v-if="auth.isLoggedIn">
                    <NuxtLink to="/profile"
                        class="block px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200"
                        :style="{ color: `rgb(var(--color-text))` }" @click="isMenuOpen = false">
                        Profile
                    </NuxtLink>
                    <button @click="handleSignOut"
                        class="block w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold"
                        :style="{ color: `rgb(var(--color-accent-rose))` }">
                        Logout
                    </button>
                </template>
                <template v-else>
                    <NuxtLink to="/auth/sign-in"
                        class="block px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200"
                        :style="{ color: `rgb(var(--color-text))` }" @click="isMenuOpen = false">
                        Log in
                    </NuxtLink>
                    <NuxtLink to="/auth/sign-up" class="block text-center btn-primary !py-2.5 !rounded-xl"
                        @click="isMenuOpen = false">
                        Sign up
                    </NuxtLink>
                </template>
            </div>
        </Transition>
    </nav>
</template>
