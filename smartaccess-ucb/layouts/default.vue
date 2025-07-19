<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <nav class="sidebar" :class="{ show: sidebarOpen }">
      <div class="p-4">
        <h4 class="text-white mb-4">
          <i class="bi bi-shield-check me-2"></i>
          SmartAccess UCB
        </h4>
        <ul class="nav flex-column">
          <li class="nav-item">
            <NuxtLink to="/" class="nav-link" @click="closeSidebar">
              <i class="bi bi-speedometer2 me-2"></i>
              Tableau de bord
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/etudiants" class="nav-link" @click="closeSidebar">
              <i class="bi bi-people me-2"></i>
              Étudiants
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/salles" class="nav-link" @click="closeSidebar">
              <i class="bi bi-door-open me-2"></i>
              Salles
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/autorisations" class="nav-link" @click="closeSidebar">
              <i class="bi bi-key me-2"></i>
              Autorisations
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/verifier" class="nav-link" @click="closeSidebar">
              <i class="bi bi-check-circle me-2"></i>
              Vérification
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/historique" class="nav-link" @click="closeSidebar">
              <i class="bi bi-clock-history me-2"></i>
              Historique
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Overlay for mobile -->
    <div 
      v-if="sidebarOpen" 
      class="position-fixed w-100 h-100 bg-dark opacity-50 d-md-none"
      style="z-index: 1040;"
      @click="closeSidebar"
    ></div>

    <!-- Main Content -->
    <div class="main-content flex-grow-1" style="margin-left: 250px;">
      <!-- Top Navigation -->
      <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container-fluid">
          <button 
            class="btn btn-outline-primary d-md-none me-3"
            @click="toggleSidebar"
          >
            <i class="bi bi-list"></i>
          </button>
          
          <div class="d-flex align-items-center ms-auto">
            <span class="text-muted me-3">
              <i class="bi bi-building me-1"></i>
              Université Chrétienne Bilingue
            </span>
            <div class="dropdown">
              <button 
                class="btn btn-outline-secondary dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person-circle me-1"></i>
                Admin
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Paramètres</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right me-2"></i>Déconnexion</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <main class="p-4">
        <slot />
      </main>
    </div>

    <!-- Toast Container -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :ref="el => setToastRef(el, toast.id)"
        class="toast"
        :class="`bg-${toast.type}`"
        role="alert"
      >
        <div class="toast-header">
          <i :class="getToastIcon(toast.type)" class="me-2"></i>
          <strong class="me-auto">{{ getToastTitle(toast.type) }}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body text-white">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const sidebarOpen = ref(false)
const toasts = ref([])
const toastRefs = ref({})
const toastCounter = ref(0)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const setToastRef = (el, id) => {
  if (el) {
    toastRefs.value[id] = el
  }
}

const showToast = (message, type = 'info') => {
  const toast = {
    id: ++toastCounter.value,
    message,
    type
  }
  
  toasts.value.push(toast)
  
  nextTick(() => {
    const toastEl = toastRefs.value[toast.id]
    if (toastEl && process.client) {
      const { $bootstrap } = useNuxtApp()
      const bsToast = new $bootstrap.Toast(toastEl)
      bsToast.show()
      
      toastEl.addEventListener('hidden.bs.toast', () => {
        const index = toasts.value.findIndex(t => t.id === toast.id)
        if (index > -1) {
          toasts.value.splice(index, 1)
        }
        delete toastRefs.value[toast.id]
      })
    }
  })
}

const getToastIcon = (type) => {
  const icons = {
    success: 'bi bi-check-circle-fill',
    danger: 'bi bi-exclamation-triangle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    info: 'bi bi-info-circle-fill'
  }
  return icons[type] || icons.info
}

const getToastTitle = (type) => {
  const titles = {
    success: 'Succès',
    danger: 'Erreur',
    warning: 'Attention',
    info: 'Information'
  }
  return titles[type] || titles.info
}

// Provide toast function globally
provide('showToast', showToast)

// Handle window resize
onMounted(() => {
  if (process.client) {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        sidebarOpen.value = false
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  }
})
</script>

<style scoped>
@media (max-width: 767.98px) {
  .main-content {
    margin-left: 0 !important;
  }
}
</style>