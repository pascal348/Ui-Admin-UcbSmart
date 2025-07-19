<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Configuration globale de l'application
useHead({
  titleTemplate: '%s - SmartAccess UCB',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Système de gestion des accès des étudiants aux salles de l\'Université Chrétienne Bilingue' },
    { name: 'author', content: 'Université Chrétienne Bilingue' },
    { name: 'theme-color', content: '#1e3a8a' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// Gestion globale des erreurs
onErrorCaptured((error) => {
  console.error('Erreur capturée:', error)
  return false
})
</script>

<style>
/* Styles globaux pour l'application */
html {
  scroll-behavior: smooth;
}

body {
  overflow-x: hidden;
}

/* Amélioration de l'accessibilité */
*:focus {
  outline: 2px solid var(--ucb-blue);
  outline-offset: 2px;
}

/* Transitions globales */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: var(--ucb-blue);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1e40af;
}
</style>