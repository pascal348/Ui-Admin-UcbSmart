import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Configuration spécifique pour éviter les problèmes FormData
  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000,
    // Désactiver l'utilisation automatique de FormData
    transformRequest: [
      function (data, headers) {
        if (typeof data === 'object' && data !== null && !(data instanceof FormData)) {
          return JSON.stringify(data)
        }
        return data
      }
    ]
  })

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      if (process.dev) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (process.dev) {
        console.error('API Error:', error.response?.data || error.message)
      }
      
      // Gestion des erreurs réseau
      if (!error.response) {
        console.error('Erreur réseau - Vérifiez que l\'API est démarrée sur', config.public.apiBase)
      }
      
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api
    }
  }
})