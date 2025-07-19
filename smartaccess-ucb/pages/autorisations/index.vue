<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container-fluid">
        <h1 class="page-title">
          <i class="bi bi-key me-3"></i>
          Octroi d'autorisations
        </h1>
        <p class="page-subtitle mb-0">
          Accorder l'accès aux étudiants pour des salles spécifiques
        </p>
      </div>
    </div>

    <div class="row">
      <!-- Authorization Form -->
      <div class="col-lg-8 mb-4">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-plus-circle me-2"></i>
              Nouvelle autorisation
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="grantAccess">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    <i class="bi bi-person me-1"></i>
                    Étudiant
                  </label>
                  <select 
                    class="form-select" 
                    v-model="form.etudiant_id" 
                    required
                    :disabled="loading"
                  >
                    <option value="">-- Sélectionner un étudiant --</option>
                    <option 
                      v-for="student in students" 
                      :key="student.id" 
                      :value="student.id"
                    >
                      {{ student.nom }} {{ student.prenom }} ({{ student.matricule }})
                    </option>
                  </select>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    <i class="bi bi-door-open me-1"></i>
                    Salle
                  </label>
                  <select 
                    class="form-select" 
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
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    <i class="bi bi-calendar-event me-1"></i>
                    Date de début
                  </label>
                  <input 
                    type="datetime-local" 
                    class="form-control" 
                    v-model="form.date_debut" 
                    required
                    :disabled="loading"
                  >
                </div>
                
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    <i class="bi bi-calendar-x me-1"></i>
                    Date de fin (optionnelle)
                  </label>
                  <input 
                    type="datetime-local" 
                    class="form-control" 
                    v-model="form.date_fin"
                    :disabled="loading"
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">
                  <i class="bi bi-chat-text me-1"></i>
                  Commentaire (optionnel)
                </label>
                <textarea 
                  class="form-control" 
                  rows="3"
                  v-model="form.commentaire"
                  placeholder="Ajouter un commentaire sur cette autorisation..."
                  :disabled="loading"
                ></textarea>
              </div>
              
              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-ucb-primary btn-lg" 
                  :disabled="loading || !form.etudiant_id || !form.salle_id || !form.date_debut"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check-circle me-2"></i>
                  {{ loading ? 'Traitement...' : 'Accorder l\'autorisation' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Information Panel -->
      <div class="col-lg-4 mb-4">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-info-circle me-2"></i>
              Informations
            </h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info">
              <h6 class="alert-heading">
                <i class="bi bi-lightbulb me-1"></i>
                Conseils
              </h6>
              <ul class="mb-0 small">
                <li>Vérifiez que l'étudiant est bien enregistré</li>
                <li>La date de début doit être dans le futur</li>
                <li>Sans date de fin, l'accès sera permanent</li>
                <li>Un commentaire peut aider à justifier l'accès</li>
              </ul>
            </div>
            
            <div class="mt-3">
              <h6>Statistiques rapides</h6>
              <div class="row text-center">
                <div class="col-6">
                  <div class="border rounded p-2">
                    <div class="fw-bold text-primary">{{ students?.length || 0 }}</div>
                    <small class="text-muted">Étudiants</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="border rounded p-2">
                    <div class="fw-bold text-success">{{ rooms?.length || 0 }}</div>
                    <small class="text-muted">Salles</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Authorizations -->
        <div class="card mt-4">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-clock-history me-2"></i>
              Dernières autorisations
            </h5>
          </div>
          <div class="card-body">
            <div v-if="recentAuthorizations.length === 0" class="text-center text-muted py-3">
              <i class="bi bi-key opacity-50"></i>
              <p class="mb-0 small">Aucune autorisation récente</p>
            </div>
            <div v-else>
              <div 
                v-for="auth in recentAuthorizations.slice(0, 3)" 
                :key="auth.id"
                class="d-flex align-items-center mb-2 p-2 bg-light rounded"
              >
                <i class="bi bi-check-circle text-success me-2"></i>
                <div class="flex-grow-1 small">
                  <div class="fw-semibold">{{ getStudentName(auth.etudiant_id) }}</div>
                  <div class="text-muted">{{ getRoomName(auth.salle_id) }}</div>
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
  title: 'Octroi d\'autorisations - SmartAccess UCB'
})

// Reactive data
const loading = ref(false)
const form = ref({
  etudiant_id: '',
  salle_id: '',
  date_debut: '',
  date_fin: '',
  commentaire: ''
})

// Fetch data
const { data: students } = await useAsyncData('students-auth', () =>
  $api.get('/etudiants/').then(res => res.data || [])
)

const { data: rooms } = await useAsyncData('rooms-auth', () =>
  $api.get('/salles/').then(res => res.data || [])
)

const { data: recentAuthorizations } = await useAsyncData('recent-auth', () =>
  $api.get('/autorisations/').then(res => res.data || []).catch(() => [])
)

// Initialize form with default dates
onMounted(() => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  form.value.date_debut = now.toISOString().slice(0, 16)
  form.value.date_fin = tomorrow.toISOString().slice(0, 16)
})

// Methods
const grantAccess = async () => {
  if (!form.value.etudiant_id || !form.value.salle_id || !form.value.date_debut) {
    showToast('Veuillez remplir tous les champs obligatoires', 'warning')
    return
  }
  
  loading.value = true
  
  try {
    const payload = {
      etudiant_id: parseInt(form.value.etudiant_id),
      salle_id: parseInt(form.value.salle_id),
      date_debut: new Date(form.value.date_debut).toISOString(),
      date_fin: form.value.date_fin ? new Date(form.value.date_fin).toISOString() : null,
      commentaire: form.value.commentaire || null
    }
    
    const response = await $api.post('/autorisations/', payload)
    
    if (response.data && response.data.id) {
      const studentName = getStudentName(form.value.etudiant_id)
      const roomName = getRoomName(form.value.salle_id)
      
      showToast(
        `Autorisation accordée avec succès à ${studentName} pour ${roomName}`,
        'success'
      )
      
      // Reset form
      form.value = {
        etudiant_id: '',
        salle_id: '',
        date_debut: new Date().toISOString().slice(0, 16),
        date_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        commentaire: ''
      }
      
      // Refresh recent authorizations
      await refreshNuxtData('recent-auth')
    } else {
      throw new Error('Réponse API invalide')
    }
  } catch (error) {
    console.error('Error granting access:', error)
    showToast('Erreur lors de l\'octroi d\'autorisation', 'danger')
  } finally {
    loading.value = false
  }
}

const getStudentName = (studentId) => {
  const student = students.value?.find(s => s.id === parseInt(studentId))
  return student ? `${student.nom} ${student.prenom}` : 'Étudiant inconnu'
}

const getRoomName = (roomId) => {
  const room = rooms.value?.find(r => r.id === parseInt(roomId))
  return room ? room.nom_salle : 'Salle inconnue'
}
</script>