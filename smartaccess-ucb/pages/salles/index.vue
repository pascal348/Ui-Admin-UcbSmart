<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="page-title">
              <i class="bi bi-door-open me-3"></i>
              Gestion des salles
            </h1>
            <p class="page-subtitle mb-0">
              Créer et gérer les salles de l'université
            </p>
          </div>
          <div class="col-md-4 text-end">
            <button 
              class="btn btn-ucb-secondary"
              data-bs-toggle="modal" 
              data-bs-target="#createRoomModal"
            >
              <i class="bi bi-plus-circle me-1"></i>
              Créer une salle
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="search-box">
          <i class="bi bi-search search-icon"></i>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Rechercher une salle..." 
            v-model="searchQuery"
          >
        </div>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button class="btn btn-outline-secondary" @click="refreshData">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Actualiser
          </button>
          <button class="btn btn-outline-secondary" @click="toggleView">
            <i :class="viewMode === 'grid' ? 'bi bi-list' : 'bi bi-grid-3x3-gap'" class="me-1"></i>
            {{ viewMode === 'grid' ? 'Vue liste' : 'Vue grille' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2 text-muted">Chargement des salles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-5 text-danger">
      <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
      <p>Erreur lors du chargement des salles</p>
      <button class="btn btn-outline-danger" @click="refreshData">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Réessayer
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRooms.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-door-open fs-1 mb-3 opacity-50"></i>
      <p>{{ searchQuery ? 'Aucune salle trouvée pour cette recherche' : 'Aucune salle créée' }}</p>
      <button 
        class="btn btn-ucb-primary"
        data-bs-toggle="modal" 
        data-bs-target="#createRoomModal"
      >
        <i class="bi bi-plus-circle me-1"></i>
        Créer la première salle
      </button>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="row">
      <div v-for="room in paginatedRooms" :key="room.id" class="col-lg-4 col-md-6 mb-4">
        <div class="room-card card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="card-title mb-0">{{ room.nom_salle }}</h5>
              <span class="badge bg-primary">ID: {{ room.id }}</span>
            </div>
            
            <div class="mb-3">
              <div class="d-flex align-items-center text-muted mb-2">
                <i class="bi bi-geo-alt me-2"></i>
                <span>{{ room.localisation || 'Localisation non spécifiée' }}</span>
              </div>
              <p class="card-text">{{ room.description || 'Aucune description disponible' }}</p>
            </div>
            
            <div class="d-flex align-items-center justify-content-between text-muted small">
              <span>
                <i class="bi bi-calendar me-1"></i>
                Créée le {{ formatDate(room.created_at) }}
              </span>
              <span class="badge bg-success">Active</span>
            </div>
          </div>
          
          <div class="card-footer bg-transparent">
            <div class="btn-group w-100">
              <button 
                class="btn btn-outline-primary" 
                @click="viewRoom(room)"
                title="Voir les détails"
              >
                <i class="bi bi-eye"></i>
              </button>
              <button 
                class="btn btn-outline-warning" 
                @click="editRoom(room)"
                title="Modifier"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button 
                class="btn btn-outline-danger" 
                @click="deleteRoom(room)"
                title="Supprimer"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="card">
      <div class="card-header bg-white">
        <div class="row align-items-center">
          <div class="col">
            <h5 class="card-title mb-0">
              <i class="bi bi-table me-2"></i>
              Liste des salles
            </h5>
          </div>
          <div class="col-auto">
            <span class="badge bg-primary">{{ filteredRooms.length }} salle(s)</span>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Localisation</th>
                <th>Description</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in paginatedRooms" :key="room.id">
                <td>
                  <span class="badge bg-light text-dark">{{ room.id }}</span>
                </td>
                <td class="fw-semibold">{{ room.nom_salle }}</td>
                <td class="text-muted">
                  <i class="bi bi-geo-alt me-1"></i>
                  {{ room.localisation || 'Non spécifiée' }}
                </td>
                <td>
                  <span class="text-truncate" style="max-width: 200px;">
                    {{ room.description || 'Aucune description' }}
                  </span>
                </td>
                <td class="text-muted">{{ formatDate(room.created_at) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-primary" 
                      @click="viewRoom(room)"
                      title="Voir les détails"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      class="btn btn-outline-warning" 
                      @click="editRoom(room)"
                      title="Modifier"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger" 
                      @click="deleteRoom(room)"
                      title="Supprimer"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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

    <!-- Create Room Modal -->
    <SalleForm 
      modal-id="createRoomModal"
      @success="refreshData"
    />
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()
const showToast = inject('showToast')

// Page metadata
useHead({
  title: 'Gestion des salles - SmartAccess UCB'
})

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const viewMode = ref('grid') // 'grid' or 'table'
const itemsPerPage = 9

// Fetch rooms data
const { data: rooms, pending, error, refresh } = await useAsyncData('rooms', () =>
  $api.get('/salles/').then(res => res.data || [])
)

// Computed properties
const filteredRooms = computed(() => {
  if (!rooms.value) return []
  if (!searchQuery.value) return rooms.value
  
  const search = searchQuery.value.toLowerCase()
  return rooms.value.filter(room => 
    room.nom_salle?.toLowerCase().includes(search) ||
    room.localisation?.toLowerCase().includes(search) ||
    room.description?.toLowerCase().includes(search)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredRooms.value.length / itemsPerPage)
})

const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredRooms.value.slice(start, end)
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

// Methods
const refreshData = async () => {
  await refresh()
  showToast('Liste des salles actualisée', 'success')
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'table' : 'grid'
}

const viewRoom = (room) => {
  showToast(`Affichage des détails de la salle ${room.nom_salle}`, 'info')
}

const editRoom = (room) => {
  showToast(`Modification de la salle ${room.nom_salle}`, 'info')
}

const deleteRoom = async (room) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la salle ${room.nom_salle} ?`)) {
    try {
      await $api.delete(`/salles/${room.id}`)
      showToast(`Salle ${room.nom_salle} supprimée`, 'success')
      await refreshData()
    } catch (error) {
      showToast('Erreur lors de la suppression', 'danger')
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('fr-FR')
  } catch (error) {
    return 'Date invalide'
  }
}

// Watch search query to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>