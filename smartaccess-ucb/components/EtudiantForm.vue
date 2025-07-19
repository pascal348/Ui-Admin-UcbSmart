<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-person-plus me-2"></i>
            {{ isEdit ? 'Modifier l\'étudiant' : 'Importer un étudiant' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label class="form-label">Matricule externe</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.matricule_ext"
                placeholder="Entrez le matricule externe" 
                required
                :disabled="loading"
              >
            </div>
            
            <div v-if="isEdit" class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Nom</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.nom"
                  required
                  :disabled="loading"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Prénom</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.prenom"
                  required
                  :disabled="loading"
                >
              </div>
            </div>
            
            <div class="d-grid">
              <button 
                type="submit" 
                class="btn btn-ucb-primary" 
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-download me-2"></i>
                {{ isEdit ? 'Modifier' : 'Importer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modalId: {
    type: String,
    default: 'etudiantModal'
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  etudiant: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success'])
const { $api } = useNuxtApp()
const showToast = inject('showToast')

const loading = ref(false)
const form = ref({
  matricule_ext: '',
  nom: '',
  prenom: ''
})

// Watch for etudiant prop changes
watch(() => props.etudiant, (newEtudiant) => {
  if (newEtudiant) {
    form.value = {
      matricule_ext: newEtudiant.matricule || '',
      nom: newEtudiant.nom || '',
      prenom: newEtudiant.prenom || ''
    }
  }
}, { immediate: true })

const submitForm = async () => {
  if (!form.value.matricule_ext.trim()) {
    showToast('Veuillez entrer un matricule', 'warning')
    return
  }
  
  loading.value = true
  
  try {
    if (props.isEdit) {
      // Update existing student
      const response = await $api.put(`/etudiants/${props.etudiant.id}`, {
        nom: form.value.nom,
        prenom: form.value.prenom,
        matricule: form.value.matricule_ext
      })
      
      showToast('Étudiant modifié avec succès', 'success')
    } else {
      // Import new student
      const response = await $api.post(`/etudiants/create-from-matricule?matricule=${encodeURIComponent(form.value.matricule_ext)}`)
      
      if (response.data && response.data.etudiant) {
        const student = response.data.etudiant
        showToast(
          `Étudiant importé avec succès: ${student.nom} ${student.prenom} (${student.matricule})`,
          'success'
        )
      }
    }
    
    // Reset form
    form.value = {
      matricule_ext: '',
      nom: '',
      prenom: ''
    }
    
    // Close modal
    if (process.client) {
      const { $bootstrap } = useNuxtApp()
      const modalEl = document.getElementById(props.modalId)
      const modal = $bootstrap.Modal.getInstance(modalEl)
      modal.hide()
    }
    
    // Emit success event
    emit('success')
    
  } catch (error) {
    console.error('Error:', error)
    showToast('Erreur lors de l\'opération', 'danger')
  } finally {
    loading.value = false
  }
}
</script>