<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="page-title">
              <i class="bi bi-clock-history me-3"></i>
              Historique des accès
            </h1>
            <p class="page-subtitle mb-0">
              Consulter l'historique complet des accès aux salles
            </p>
          </div>
          <div class="col-md-4 text-end">
            <div class="btn-group">
              <button class="btn btn-outline-light" @click="refreshData">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Actualiser
              </button>
              <button class="btn btn-ucb-secondary" @click="exportData">
                <i class="bi bi-download me-1"></i>
                Exporter CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-header bg-white">
        <h5 class="card-title mb-0">
          <i class="bi bi-funnel me-2"></i>
          Filtres de recherche
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-lg-3 col-md-6 mb-3">
            <label class="form-label">Filtrer par salle</label>
            <select class="form-select" v-model="filters.salle_id">
              <option value="">Toutes les salles</option>
              <option v-for="room in rooms" :key="room.id" :value="room.id">
                {{ room.nom_salle }}
              </option>
            </select>
          </div>
          
          <div class="col-lg-3 col-md-6 mb-3">
            <label class="form-label">Type d'accès</label>
            <select class="form-select" v-model="filters.type_acces">
              <option value="">Tous les types</option>
              <option value="badge">Badge</option>
              <option value="manuel">Manuel</option>
              <option value="temporaire">Temporaire</option>
            </select>
          </div>
          
          <div class="col-lg-3 col-md-6 mb-3">
            <label class="form-label">Date de début</label>
            <input type="date" class="form-control" v-model="filters.date_debut">
          </div>
          
          <div class="col-lg-3 col-md-6 mb-3">
            <label class="form-label">Date de fin</label>
            <input type="date" class="form-control" v-model="filters.date_fin">
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Rechercher par matricule</label>
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher par matricule..." 
                v-model="filters.matricule"
              >
            </div>
          </div>
          
          <div class="col-md-6 mb-3 d-flex align-items-end">
            <button class="btn btn-outline-secondary me-2" @click="clearFilters">
              <i class="bi bi-x-circle me-1"></i>
              Effacer les filtres
            </button>
            <span class="text-muted">
              {{ filteredHistory.length }} résultat(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stat-number">{{ totalAccess }}</div>
              <div class="stat-label">Total accès</div>
            </div>
            <i class="bi bi-graph-up fs-1 opacity-75 text-primary"></i>
          </div>
        </div>
      </div>
      
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stat-number">{{ todayAccess }}</div>
              <div class="stat-label">Aujourd'hui</div>
            </div>
            <i class="bi bi-calendar-day fs-1 opacity-75 text-success"></i>
          </div>
        </div>
      </div>
      
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stat-number">{{ uniqueStudents }}</div>
              <div class="stat-label">Étudiants uniques</div>
            </div>
            <i class="bi bi-people fs-1 opacity-75 text-warning"></i>
          </div>
        </div>
      </div>
      
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stat-number">{{ activeRooms }}</div>
              <div class="stat-label">Salles actives</div>
            </div>
            <i class="bi bi-door-open fs-1 opacity-75 text-info"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="card">
      <div class="card-header bg-white">
        <div class="row align-items-center">
          <div class="col">
            <h5 class="card-title mb-0">
              <i class="bi bi-table me-2"></i>
              Historique des accès
            </h5>
          </div>
          <div class="col-auto">
            <div class="btn-group btn-group-sm">
              <button 
                class="btn btn-outline-secondary"
                :class="{ active: itemsPerPage === 10 }"
                @click="itemsPerPage = 10"
              >
                10
              </button>
              <button 
                class="btn btn-outline-secondary"
                :class="{ active: itemsPerPage === 25 }"
                @click="itemsPerPage = 25"
              >
                25
              </button>
              <button 
                class="btn btn-outline-secondary"
                :class="{ active: itemsPerPage === 50 }"
                @click="itemsPerPage = 50"
              >
                50
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card-body">
        <div v-if="pending" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2 text-muted">Chargement de l'historique...</p>
        </div>
        
        <div v-else-if="error" class="text-center py-4 text-danger">
          <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
          <p>Erreur lors du chargement de l'historique</p>
          <button class="btn btn-outline-danger" @click="refreshData">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Réessayer
          </button>
        </div>
        
        <div v-else-if="filteredHistory.length === 0" class="text-center py-4 text-muted">
          <i class="bi bi-clock-history fs-1 mb-3 opacity-50"></i>
          <p>Aucun historique trouvé</p>
          <button class="btn btn-outline-secondary" @click="clearFilters">
            <i class="bi bi-x-circle me-1"></i>
            Effacer les filtres
          </button>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Matricule</th>
                <th>Salle</th>
                <th>Type d'accès</th>
                <th>Date d'entrée</th>
                <th>Date de sortie</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in paginatedHistory" :key="record.id">
                <td>
                  <span class="badge bg-light text-dark">{{ record.id }}</span>
                </td>
                <td>
                  <span class="badge bg-primary">{{ record.matricule_utilise }}</span>
                </td>
                <td>
                  <div>
                    <div class="fw-semibold">{{ getRoomName(record.salle_id) }}</div>
                    <small class="text-muted">ID: {{ record.salle_id }}</small>
                  </div>
                </td>
                <td>
                  <span 
                    class="badge"
                    :class="getAccessTypeBadge(record.type_acces)"
                  >
                    {{ record.type_acces }}
                  </span>
                </td>
                <td>
                  <div>
                    <div>{{ formatDate(record.date_entree) }}</div>
                    <small class="text-muted">{{ formatTime(record.date_entree) }}</small>
                  </div>
                </td>
                <td>
                  <div v-if="record.date_sortie">
                    <div>{{ formatDate(record.date_sortie) }}</div>
                    <small class="text-muted">{{ formatTime(record.date_sortie) }}</small>
                  </div>
                  <span v-else class="text-muted">En cours</span>
                </td>
                <td>
                  <span v-if="record.date_sortie" class="badge bg-info">
                    {{ calculateDuration(record.date_entree, record.date_sortie) }}
                  </span>
                  <span v-else class="badge bg-warning">En cours</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage = Math.max(1, currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
                Précédent
              </button>
            </li>
            <li 
              v-for="page in visiblePages" 
              :key="page" 
              class="page-item" 
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage = Math.min(totalPages, currentPage + 1)">
                Suivant
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()
const showToast = inject('showToast')

// Page metadata
useHead({
  title: 'Historique des accès - SmartAccess UCB'
})

// Reactive data
const currentPage = ref(1)
const itemsPerPage = ref(10)
const filters = ref({
  salle_id: '',
  type_acces: '',
  date_debut: '',
  date_fin: '',
  matricule: ''
})

// Fetch data
const { data: history, pending, error, refresh } = await useAsyncData('history', () =>
  $api.get('/historiques/').then(res => res.data || [])
)

const { data: rooms } = await useAsyncData('rooms-history', () =>
  $api.get('/salles/').then(res => res.data || [])
)

// Computed properties
const filteredHistory = computed(() => {
  if (!history.value) return []
  
  let filtered = [...history.value]
  
  // Filter by room
  if (filters.value.salle_id) {
    filtered = filtered.filter(record => record.salle_id == filters.value.salle_id)
  }
  
  // Filter by access type
  if (filters.value.type_acces) {
    filtered = filtered.filter(record => record.type_acces === filters.value.type_acces)
  }
  
  // Filter by start date
  if (filters.value.date_debut) {
    const startDate = new Date(filters.value.date_debut)
    filtered = filtered.filter(record => new Date(record.date_entree) >= startDate)
  }
  
  // Filter by end date
  if (filters.value.date_fin) {
    const endDate = new Date(filters.value.date_fin)
    endDate.setHours(23, 59, 59, 999)
    filtered = filtered.filter(record => new Date(record.date_entree) <= endDate)
  }
  
  // Filter by matricule
  if (filters.value.matricule) {
    const search = filters.value.matricule.toLowerCase()
    filtered = filtered.filter(record => 
      record.matricule_utilise?.toLowerCase().includes(search)
    )
  }
  
  // Sort by date (most recent first)
  return filtered.sort((a, b) => new Date(b.date_entree) - new Date(a.date_entree))
})

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / itemsPerPage.value)
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredHistory.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Statistics
const totalAccess = computed(() => filteredHistory.value.length)

const todayAccess = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return filteredHistory.value.filter(record => 
    new Date(record.date_entree) >= today
  ).length
})

const uniqueStudents = computed(() => {
  const matricules = new Set(filteredHistory.value.map(record => record.matricule_utilise))
  return matricules.size
})

const activeRooms = computed(() => {
  const salleIds = new Set(filteredHistory.value.map(record => record.salle_id))
  return salleIds.size
})

// Methods
const refreshData = async () => {
  await refresh()
  showToast('Historique actualisé', 'success')
}

const clearFilters = () => {
  filters.value = {
    salle_id: '',
    type_acces: '',
    date_debut: '',
    date_fin: '',
    matricule: ''
  }
  currentPage.value = 1
}

const exportData = () => {
  if (filteredHistory.value.length === 0) {
    showToast('Aucune donnée à exporter', 'warning')
    return
  }
  
  // Create CSV content
  const headers = ['ID', 'Matricule', 'Salle', 'Type d\'accès', 'Date d\'entrée', 'Date de sortie', 'Durée']
  const csvContent = [
    headers.join(','),
    ...filteredHistory.value.map(record => [
      record.id,
      record.matricule_utilise,
      getRoomName(record.salle_id),
      record.type_acces,
      formatDate(record.date_entree),
      record.date_sortie ? formatDate(record.date_sortie) : 'En cours',
      record.date_sortie ? calculateDuration(record.date_entree, record.date_sortie) : 'En cours'
    ].join(','))
  ].join('\n')
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `historique_acces_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  showToast('Export CSV téléchargé', 'success')
}

const getRoomName = (salleId) => {
  const room = rooms.value?.find(r => r.id === salleId)
  return room ? room.nom_salle : `Salle ${salleId}`
}

const getAccessTypeBadge = (type) => {
  const badges = {
    badge: 'bg-primary',
    manuel: 'bg-warning',
    temporaire: 'bg-info',
    default: 'bg-secondary'
  }
  return badges[type] || badges.default
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('fr-FR')
  } catch (error) {
    return 'Date invalide'
  }
}

const formatTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Heure invalide'
  }
}

const calculateDuration = (start, end) => {
  if (!start || !end) return 'N/A'
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate - startDate
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    } else {
      return `${diffMinutes}m`
    }
  } catch (error) {
    return 'N/A'
  }
}

// Watch filters to reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Watch itemsPerPage to reset pagination
watch(itemsPerPage, () => {
  currentPage.value = 1
})
</script>