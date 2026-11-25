import { defineNuxtConfig } from 'nuxt/config'
import pkg from './package.json'
// https://nuxt.com/docs/api/configuration/nuxt-config
// @nuxtjs/supabase throws on every SSR request when it has no URL and key, so it
// is registered only when both are present at build time. The newsletter
// repository factory makes the matching choice: Supabase when the module is
// there, the in-memory repository when it is not.
const useSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY)

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    ...(useSupabase ? ['@nuxtjs/supabase'] : []),
  ],
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      version: pkg.version,
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',
  eslint: {
    config: { stylistic: true },
  },
  // The newsletter form is anonymous; the module's default redirect to /login
  // would send every visitor away from it.
  supabase: { redirect: false },
})
