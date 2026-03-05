import { ref, onMounted } from 'vue';

type Theme = 'light' | 'dark';

export const useTheme = () => {
    const theme = ref<Theme>('dark');
    const isInitialized = ref(false);

    const setTheme = (newTheme: Theme) => {
        theme.value = newTheme;
        if (typeof window !== 'undefined') {
            localStorage.setItem('emi-theme', newTheme);
            applyTheme(newTheme);
        }
    };

    const toggleTheme = () => {
        setTheme(theme.value === 'dark' ? 'light' : 'dark');
    };

    const applyTheme = (currentTheme: Theme) => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            if (currentTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    onMounted(() => {
        const storedTheme = localStorage.getItem('emi-theme') as Theme | null;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Default to dark if nothing is stored
        const initialTheme = storedTheme || 'dark';

        theme.value = initialTheme;
        applyTheme(initialTheme);
        isInitialized.value = true;
    });

    return {
        theme,
        isInitialized,
        toggleTheme,
        setTheme,
    };
};
