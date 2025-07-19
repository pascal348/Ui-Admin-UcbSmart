<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="page-title">
              <i class="bi bi-people me-3"></i>
              Gestion des étudiants
            </h1>
            <p class="page-subtitle mb-0">
              Importer et gérer les étudiants de l'université
            </p>
          </div>
          <div class="col-md-4 text-end">
            <button 
              class="btn btn-ucb-secondary me-2"
              data-bs-toggle="modal" 
              data-bs-target="#importStudentModal"
            >
              <i class="bi bi-plus-circle me-1"></i>
              Importer étudiant
            </button>
            <button class="btn btn-outline-light">
              <i class="bi bi-upload me-1"></i>
              Import CSV
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
            placeholder="Rechercher un étudiant par nom, prénom ou matricule..." 
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
          <button class="btn btn-outline-secondary">
            <i class="bi bi-download me-1"></i>
            Exporter
          </button>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div class="card">
      <div class="card-header bg-white">
        <div class="row align-items-center">
          <div class="col">
            <h5 class="card-title mb-0">
              <i class="bi bi-table me-2"></i>
              Liste des étudiants
            </h5>
          </div>
          <div class="col-auto">
            <span class="badge bg-primary">{{ filteredStudents.length }} étudiant(s)</span>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div v-if="pending" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2 text-muted">Chargement des étudiants...</p>
        </div>
        
        <div v-else-if="error" class="text-center py-4 text-danger">
          <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
          <p>Erreur lors du chargement des étudiants</p>
          <button class="btn btn-outline-danger" @click="refreshData">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Réessayer
          </button>
        </div>
        
        <div v-else-if="filteredStudents.length === 0" class="text-center py-4 text-muted">
          <i class="bi bi-people fs-1 mb-3 opacity-50"></i>
          <p>{{ searchQuery ? 'Aucun étudiant trouvé pour cette recherche' : 'Aucun étudiant enregistré' }}</p>
          <button 
            class="btn btn-ucb-primary"
            data-bs-toggle="modal" 
            data-bs-target="#importStudentModal"
          >
            <i class="bi bi-plus-circle me-1"></i>
            Importer le premier étudiant
          </button>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Matricule</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Date d'ajout</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents" :key="student.id">
                <td>
                  <span class="badge bg-light text-dark">{{ student.id }}</span>
                </td>
                <td>
                  <span class="badge bg-primary">{{ student.matricule }}</span>
                </td>
                <td class="fw-semibold">{{ student.nom }}</td>
                <td>{{ student.prenom }}</td>
                <td class="text-muted">
                  {{ formatDate(student.created_at) }}
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-primary" 
                      @click="viewStudent(student)"
                      title="Voir les détails"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      class="btn btn-outline-warning" 
                      @click="editStudent(student)"
                      title="Modifier"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger" 
                      @click="deleteStudent(student)"
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

    <!-- Import Student Modal -->
    <EtudiantForm 
      modal-id="importStudentModal"
      @success="refreshData"
    />
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()
const showToast = inject('showToast')

// Page metadata
useHead({
  title: 'Gestion des étudiants - SmartAccess UCB'
})

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Fetch students data
const { data: students, pending, error, refresh } = await useAsyncData('students', () =>
  $api.get('/etudiants/').then(res => res.data || [])
)

// Computed properties
const filteredStudents = computed(() => {
  if (!students.value) return []
  if (!searchQuery.value) return students.value
  
  const search = searchQuery.value.toLowerCase()
  return students.value.filter(student => 
    student.nom?.toLowerCase().includes(search) ||
    student.prenom?.toLowerCase().includes(search) ||
    student.matricule?.toLowerCase().includes(search)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / itemsPerPage)
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredStudents.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  // Show max 5 pages
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  // Adjust start if we're near the end
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
  showToast('Liste des étudiants actualisée', 'success')
}

const viewStudent = (student) => {
  showToast(`Affichage des détails de ${student.nom} ${student.prenom}`, 'info')
}

const editStudent = (student) => {
  showToast(`Modification de ${student.nom} ${student.prenom}`, 'info')
}

const deleteStudent = async (student) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${student.nom} ${student.prenom} ?`)) {
    try {
      await $api.delete(`/etudiants/${student.id}`)
      showToast(`Étudiant ${student.nom} ${student.prenom} supprimé`, 'success')
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