// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["~/assets/css/courses.css"],
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxt/icon", "@vueuse/motion/nuxt"],

  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      pocketbaseUrl: process.env.NUXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090",
    },
  },

  devtools: { enabled: true },
  compatibilityDate: "2024-04-03",
  experimental: {
    appManifest: false
  },
  nitro: {
    routeRules: {
      '/courses/**': { isr: true }
    }
  },
  content: {
    highlight: {
      theme: {
        default: 'github-dark',
        sepia: 'monokai'
      },
      langs: ['rust', 'kotlin', 'javascript', 'typescript', 'jsx', 'tsx', 'bash', 'json', 'yaml', 'toml', 'html', 'css']
    }
  }
});
