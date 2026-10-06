// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/style.css'],

  vite: {
    plugins: [tailwindcss()]
  },

  modules: ['@nuxt/icon'],

  runtimeConfig: {
    public: {
      // Переопределяется переменной окружения NUXT_PUBLIC_API_BASE
      apiBase: 'http://localhost:8080'
    }
  }
})