// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'bootstrap-icons/font/bootstrap-icons.css',
    '~/assets/css/main.css'
  ],
  nitro: {
    experimental: {
      wasm: true
    }
  },
  vite: {
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['axios']
    }
  },
  plugins: [
    '~/plugins/bootstrap.client.ts',
    '~/plugins/axios.ts'
  ],
  app: {
    head: {
      title: 'SmartAccess UCB - Gestion des Accès',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Système de gestion des accès des étudiants aux salles de l\'Université Chrétienne Bilingue' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://127.0.0.1:8000'
    }
  }
})