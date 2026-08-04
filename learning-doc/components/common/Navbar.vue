<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { useTheme } from "~/composables/useTheme";
import { LogOut, User, Menu, X, Sparkles, Sun, Moon, BookOpen } from "lucide-vue-next";

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
    <nav class="sticky top-0 z-50 w-full transition-colors duration-200 border-b"
        :class="[
            scrolled
                ? 'bg-[rgb(var(--color-bg-card))] border-[rgb(var(--color-border))] shadow-sm'
                : 'bg-[rgb(var(--color-bg))] border-transparent'
        ]">
        <div class="container flex h-16 items-center justify-between">
            <div class="flex items-center gap-8">
                <NuxtLink to="/" class="group flex items-center gap-3 transition-opacity hover:opacity-90">
                    <div class="flex items-center justify-center w-8 h-8 rounded-md bg-[rgb(var(--color-accent-blue))] text-white">
                        <BookOpen :size="18" />
                    </div>
                    <span class="text-xl font-black tracking-tight text-[rgb(var(--color-text))]">
                        Journey Doc
                    </span>
                </NuxtLink>

                <!-- Desktop Nav -->
                <div class="hidden md:flex items-center gap-1">
                    <NuxtLink to="/courses"
                        class="px-3 py-2 text-sm font-semibold rounded-md transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                        :style="{ color: `rgb(var(--color-text-soft))` }" active-class="!text-[rgb(var(--color-accent-blue))] !font-bold">
                        Courses
                    </NuxtLink>
                    <NuxtLink to="/about"
                        class="px-3 py-2 text-sm font-semibold rounded-md transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                        :style="{ color: `rgb(var(--color-text-soft))` }" active-class="!text-[rgb(var(--color-accent-blue))] !font-bold">
                        About
                    </NuxtLink>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button v-if="isInitialized" @click="toggleTheme"
                    class="p-2 rounded-md transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                    :style="{ color: `rgb(var(--color-text-soft))` }" aria-label="Toggle theme">
                    <Sun v-if="theme === 'dark'" :size="18" />
                    <Moon v-else :size="18" />
                </button>
                <template v-if="auth.isLoggedIn">
                    <div class="hidden md:flex items-center gap-3">
                        <NuxtLink to="/profile"
                            class="flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-accent-blue))] border border-[rgb(var(--color-border))]">
                            <User :size="15" />
                            {{ auth.user?.username }}
                        </NuxtLink>
                        <button @click="handleSignOut"
                            class="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-rose-500/10 text-[rgb(var(--color-accent-rose))]">
                            <LogOut :size="16" class="mr-1.5" />
                            Logout
                        </button>
                    </div>
                </template>
                <template v-else>
                    <div class="hidden md:flex items-center gap-2">
                        <NuxtLink to="/auth/sign-in"
                            class="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                            :style="{ color: `rgb(var(--color-text-soft))` }">
                            Log in
                        </NuxtLink>
                        <NuxtLink to="/auth/sign-up" class="btn-primary !py-2 !px-4 !text-sm !rounded-md">
                            Sign up
                        </NuxtLink>
                    </div>
                </template>

                <!-- Mobile Menu Toggle -->
                <button @click="toggleMenu" class="md:hidden rounded-md p-2 transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                    :style="{ color: `rgb(var(--color-text))` }">
                    <Menu v-if="!isMenuOpen" :size="22" />
                    <X v-else :size="22" />
                </button>
            </div>
        </div>

        <!-- Mobile Nav -->
        <Transition enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1">
            <div v-if="isMenuOpen" class="md:hidden bg-[rgb(var(--color-bg-card))] p-5 space-y-3 border-t border-[rgb(var(--color-border))]">
                <NuxtLink to="/courses"
                    class="block px-4 py-2.5 rounded-lg text-base font-semibold transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                    :style="{ color: `rgb(var(--color-text))` }" @click="isMenuOpen = false">
                    Courses
                </NuxtLink>
                <NuxtLink to="/about"
                    class="block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                    :style="{ color: `rgb(var(--color-text))` }" @click="isMenuOpen = false">
                    About
                </NuxtLink>
                <div class="h-px my-2 bg-[rgb(var(--color-border))]" />
                <button v-if="isInitialized" @click="toggleTheme"
                    class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-semibold transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                    :style="{ color: `rgb(var(--color-text))` }">
                    <Sun v-if="theme === 'dark'" :size="18" />
                    <Moon v-else :size="18" />
                    {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
                </button>
                <template v-if="auth.isLoggedIn">
                    <NuxtLink to="/profile"
                        class="block px-4 py-2.5 rounded-lg text-base font-semibold transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                        :style="{ color: `rgb(var(--color-text))` }" @click="isMenuOpen = false">
                        Profile
                    </NuxtLink>
                    <button @click="handleSignOut(); isMenuOpen = false"
                        class="block w-full text-left px-4 py-2.5 rounded-lg text-base font-semibold text-[rgb(var(--color-accent-rose))]">
                        Logout
                    </button>
                </template>
                <template v-else>
                    <NuxtLink to="/auth/sign-in"
                        class="block px-4 py-2.5 rounded-lg text-base font-semibold transition-colors hover:bg-[rgb(var(--color-bg-soft))]"
                        :style="{ color: `rgb(var(--color-text))` }" @click="isMenuOpen = false">
                        Log in
                    </NuxtLink>
                    <NuxtLink to="/auth/sign-up" class="block text-center btn-primary !py-2.5 !rounded-lg"
                        @click="isMenuOpen = false">
                        Sign up
                    </NuxtLink>
                </template>
            </div>
        </Transition>
    </nav>
</template>
