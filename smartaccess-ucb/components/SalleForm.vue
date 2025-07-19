<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-door-open me-2"></i>
            {{ isEdit ? 'Modifier la salle' : 'Créer une nouvelle salle' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label class="form-label">Nom de la salle</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.nom_salle"
                placeholder="Ex: Salle A101" 
                required
                :disabled="loading"
              >
            </div>
            
            <div class="mb-3">
              <label class="form-label">Localisation</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.localisation"
                placeholder="Ex: Bâtiment A, 1er étage"
                :disabled="loading"
              >
            </div>
            
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea 
                class="form-control" 
                rows="3"
                v-model="form.description"
                placeholder="Description de la salle"
                :disabled="loading"
              ></textarea>
            </div>
            
            <div class="d-grid">
              <button 
                type="submit" 
                class="btn btn-ucb-primary" 
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-plus-circle me-2"></i>
                {{ isEdit ? 'Modifier la salle' : 'Créer la salle' }}
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
    default: 'salleModal'
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  salle: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success'])
const { $api } = useNuxtApp()
const showToast = inject('showToast')

const loading = ref(false)
const form = ref({
  nom_salle: '',
  localisation: '',
  description: ''
})

// Watch for salle prop changes
watch(() => props.salle, (newSalle) => {
  if (newSalle) {
    form.value = {
      nom_salle: newSalle.nom_salle || '',
      localisation: newSalle.localisation || '',
      description: newSalle.description || ''
    }
  }
}, { immediate: true })

const submitForm = async () => {
  if (!form.value.nom_salle.trim()) {
    showToast('Veuillez entrer un nom de salle', 'warning')
    return
  }
  
  loading.value = true
  
  try {
    let response
    
    if (props.isEdit) {
      // Update existing room
      response = await $api.put(`/salles/${props.salle.id}`, form.value)
      showToast('Salle modifiée avec succès', 'success')
    } else {
      // Create new room
      response = await $api.post('/salles/', form.value)
      
      if (response.data && response.data.id) {
        showToast(`Salle créée avec succès (ID: ${response.data.id})`, 'success')
      }
    }
    
    // Reset form
    form.value = {
      nom_salle: '',
      localisation: '',
      description: ''
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