<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container-fluid">
        <h1 class="page-title">
          <i class="bi bi-check-circle me-3"></i>
          Vérification d'accès
        </h1>
        <p class="page-subtitle mb-0">
          Vérifier si un étudiant a accès à une salle spécifique
        </p>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Verification Form -->
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-search me-2"></i>
              Vérifier l'accès
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="verifyAccess">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    <i class="bi bi-person-badge me-1"></i>
                    Matricule étudiant
                  </label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    v-model="form.matricule"
                    placeholder="Entrez le matricule de l'étudiant" 
                    required
                    :disabled="loading"
                  >
                  <div class="form-text">
                    Saisissez le matricule exact de l'étudiant
                  </div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    <i class="bi bi-door-open me-1"></i>
                    Salle
                  </label>
                  <select 
                    class="form-select form-select-lg" 
                    v-model="form.salle_id" 
                    required
                    :disabled="loading"
                  >
                    <option value="">-- Sélectionner une salle --</option>
                    <option 
                      v-for="room in rooms" 
                      :key="room.id" 
                      :value="room.id"
                    >
                      {{ room.nom_salle }}
                      <span v-if="room.localisation"> - {{ room.localisation }}</span>
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-ucb-primary btn-lg" 
                  :disabled="loading || !form.matricule || !form.salle_id"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-search me-2"></i>
                  {{ loading ? 'Vérification...' : 'Vérifier l\'accès' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Verification Result -->
        <div v-if="verificationResult" class="mt-4">
          <div 
            class="card border-0"
            :class="verificationResult.hasAccess ? 'access-granted' : 'access-denied'"
          >
            <div class="card-body text-center">
              <div class="mb-3">
                <i 
                  :class="verificationResult.hasAccess ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'" 
                  class="display-1"
                ></i>
              </div>
              
              <h3 class="card-title mb-3">
                {{ verificationResult.hasAccess ? 'Accès autorisé' : 'Accès refusé' }}
              </h3>
              
              <p class="card-text fs-5 mb-4">
                {{ verificationResult.message }}
              </p>
              
              <div v-if="verificationResult.details" class="row text-start">
                <div class="col-md-6">
                  <h6>Détails de l'étudiant</h6>
                  <ul class="list-unstyled">
                    <li><strong>Nom:</strong> {{ verificationResult.details.student?.nom }}</li>
                    <li><strong>Prénom:</strong> {{ verificationResult.details.student?.prenom }}</li>
                    <li><strong>Matricule:</strong> {{ verificationResult.details.student?.matricule }}</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6>Détails de la salle</h6>
                  <ul class="list-unstyled">
                    <li><strong>Nom:</strong> {{ verificationResult.details.room?.nom_salle }}</li>
                    <li><strong>Localisation:</strong> {{ verificationResult.details.room?.localisation || 'Non spécifiée' }}</li>
                  </ul>
                </div>
              </div>
              
              <div class="mt-4">
                <button 
                  class="btn btn-outline-light me-2" 
                  @click="resetVerification"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Nouvelle vérification
                </button>
                <button 
                  v-if="!verificationResult.hasAccess" 
                  class="btn btn-light"
                  @click="goToAuthorizations"
                >
                  <i class="bi bi-key me-1"></i>
                  Accorder l'accès
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access Panel -->
        <div v-if="!verificationResult" class="mt-4">
          <div class="card">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">
                <i class="bi bi-lightning me-2"></i>
                Accès rapide
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Étudiants récents</h6>
                  <div v-if="recentStudents.length === 0" class="text-muted small">
                    Aucun étudiant récent
                  </div>
                  <div v-else>
                    <button
                      v-for="student in recentStudents.slice(0, 3)"
                      :key="student.id"
                      class="btn btn-outline-secondary btn-sm me-1 mb-1"
                      @click="form.matricule = student.matricule"
                    >
                      {{ student.matricule }}
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6>Salles populaires</h6>
                  <div v-if="popularRooms.length === 0" class="text-muted small">
                    Aucune salle populaire
                  </div>
                  <div v-else>
                    <button
                      v-for="room in popularRooms.slice(0, 3)"
                      :key="room.id"
                      class="btn btn-outline-secondary btn-sm me-1 mb-1"
                      @click="form.salle_id = room.id"
                    >
                      {{ room.nom_salle }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()
const showToast = inject('showToast')

// Page metadata
useHead({
  title: 'Vérification d\'accès - SmartAccess UCB'
})

// Reactive data
const loading = ref(false)
const verificationResult = ref(null)
const form = ref({
  matricule: '',
  salle_id: ''
})

// Fetch data
const { data: rooms } = await useAsyncData('rooms-verify', () =>
  $api.get('/salles/').then(res => res.data || [])
)

const { data: students } = await useAsyncData('students-verify', () =>
  $api.get('/etudiants/').then(res => res.data || [])
)

const { data: history } = await useAsyncData('history-verify', () =>
  $api.get('/historiques/').then(res => res.data || []).catch(() => [])
)

// Computed properties
const recentStudents = computed(() => {
  if (!students.value) return []
  return [...students.value]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)
})

const popularRooms = computed(() => {
  if (!rooms.value || !history.value) return rooms.value || []
  
  // Count access frequency for each room
  const roomCounts = {}
  history.value.forEach(record => {
    roomCounts[record.salle_id] = (roomCounts[record.salle_id] || 0) + 1
  })
  
  // Sort rooms by access frequency
  return [...rooms.value]
    .sort((a, b) => (roomCounts[b.id] || 0) - (roomCounts[a.id] || 0))
    .slice(0, 5)
})

// Methods
const verifyAccess = async () => {
  if (!form.value.matricule.trim() || !form.value.salle_id) {
    showToast('Veuillez remplir tous les champs', 'warning')
    return
  }
  
  loading.value = true
  verificationResult.value = null
  
  try {
    // Try to call the verification endpoint
    const endpoint = `/verifier-acces?matricule=${encodeURIComponent(form.value.matricule)}&salle_id=${form.value.salle_id}`
    
    try {
      const response = await $api.get(endpoint)
      verificationResult.value = {
        hasAccess: response.data.hasAccess || false,
        message: response.data.message || 'Vérification effectuée'
      }
    } catch (apiError) {
      // Fallback: simulate verification based on existing data
      const student = students.value?.find(s => s.matricule === form.value.matricule)
      const room = rooms.value?.find(r => r.id == form.value.salle_id)
      
      if (!student) {
        verificationResult.value = {
          hasAccess: false,
          message: 'Étudiant non trouvé dans la base de données',
          details: { student: null, room }
        }
      } else if (!room) {
        verificationResult.value = {
          hasAccess: false,
          message: 'Salle non trouvée',
          details: { student, room: null }
        }
      } else {
        // Check if student has recent access to this room
        const hasRecentAccess = history.value?.some(record => 
          record.matricule_utilise === form.value.matricule &&
          record.salle_id == form.value.salle_id &&
          new Date(record.date_entree) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        )
        
        verificationResult.value = {
          hasAccess: hasRecentAccess,
          message: hasRecentAccess 
            ? `Accès autorisé pour ${student.nom} ${student.prenom} à la salle ${room.nom_salle}`
            : `Aucun accès actif trouvé pour ${student.nom} ${student.prenom} à la salle ${room.nom_salle}`,
          details: { student, room }
        }
      }
    }
  } catch (error) {
    console.error('Verification error:', error)
    showToast('Erreur lors de la vérification d\'accès', 'danger')
  } finally {
    loading.value = false
  }
}

const resetVerification = () => {
  verificationResult.value = null
  form.value = {
    matricule: '',
    salle_id: ''
  }
}

const goToAuthorizations = () => {
  navigateTo('/autorisations')
}
</script>