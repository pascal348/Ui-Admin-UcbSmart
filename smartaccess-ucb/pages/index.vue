<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container-fluid">
        <h1 class="page-title">
          <i class="bi bi-speedometer2 me-3"></i>
          Tableau de bord
        </h1>
        <p class="page-subtitle mb-0">
          Vue d'ensemble du système SmartAccess UCB
        </p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <DashboardCard
          :value="stats.totalStudents"
          label="Étudiants"
          icon="bi bi-people"
          icon-color="#0d6efd"
        />
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <DashboardCard
          :value="stats.totalRooms"
          label="Salles"
          icon="bi bi-door-open"
          icon-color="#198754"
        />
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <DashboardCard
          :value="stats.activeAccess"
          label="Accès actifs"
          icon="bi bi-key"
          icon-color="#ffc107"
        />
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <DashboardCard
          :value="stats.totalHistory"
          label="Historique"
          icon="bi bi-clock-history"
          icon-color="#dc3545"
        />
      </div>
    </div>

    <!-- Recent Access -->
    <div class="row">
      <div class="col-lg-8 mb-4">
        <div class="card h-100">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-clock-history me-2 text-primary"></i>
              Derniers accès
            </h5>
          </div>
          <div class="card-body">
            <div v-if="pending" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
            </div>
            <div v-else-if="recentAccess.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-clock-history fs-1 mb-3 opacity-50"></i>
              <p>Aucun accès récent</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Salle</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="access in recentAccess.slice(0, 5)" :key="access.id">
                    <td>
                      <span class="badge bg-secondary">{{ access.matricule_utilise }}</span>
                    </td>
                    <td>{{ getSalleName(access.salle_id) }}</td>
                    <td>
                      <span class="badge bg-primary">{{ access.type_acces }}</span>
                    </td>
                    <td>{{ formatDate(access.date_entree) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer bg-white">
            <NuxtLink to="/historique" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-arrow-right me-1"></i>
              Voir tout l'historique
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-lightning me-2 text-warning"></i>
              Actions rapides
            </h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <NuxtLink to="/etudiants" class="btn btn-outline-primary">
                <i class="bi bi-person-plus me-2"></i>
                Importer un étudiant
              </NuxtLink>
              <NuxtLink to="/salles" class="btn btn-outline-success">
                <i class="bi bi-door-open me-2"></i>
                Créer une salle
              </NuxtLink>
              <NuxtLink to="/autorisations" class="btn btn-outline-warning">
                <i class="bi bi-key me-2"></i>
                Accorder un accès
              </NuxtLink>
              <NuxtLink to="/verifier" class="btn btn-outline-info">
                <i class="bi bi-check-circle me-2"></i>
                Vérifier un accès
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-gear me-2 text-secondary"></i>
              État du système
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <div class="d-flex align-items-center mb-2">
                  <div class="bg-success rounded-circle me-2" style="width: 12px; height: 12px;"></div>
                  <span>API Backend</span>
                  <span class="badge bg-success ms-auto">En ligne</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="d-flex align-items-center mb-2">
                  <div class="bg-success rounded-circle me-2" style="width: 12px; height: 12px;"></div>
                  <span>Base de données</span>
                  <span class="badge bg-success ms-auto">Connectée</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="d-flex align-items-center mb-2">
                  <div class="bg-warning rounded-circle me-2" style="width: 12px; height: 12px;"></div>
                  <span>Dernière synchronisation</span>
                  <span class="badge bg-warning ms-auto">{{ formatDate(new Date()) }}</span>
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

// Page metadata
useHead({
  title: 'Tableau de bord - SmartAccess UCB'
})

// Reactive data
const stats = ref({
  totalStudents: 0,
  totalRooms: 0,
  activeAccess: 0,
  totalHistory: 0
})

const recentAccess = ref([])
const salles = ref([])

// Fetch data
const { data: etudiants, pending: pendingEtudiants } = await useAsyncData('etudiants', () =>
  $api.get('/etudiants/').then(res => res.data)
)

const { data: sallesData, pending: pendingSalles } = await useAsyncData('salles', () =>
  $api.get('/salles/').then(res => res.data)
)

const { data: historique, pending: pendingHistorique } = await useAsyncData('historique', () =>
  $api.get('/historiques/').then(res => res.data)
)

const pending = computed(() => pendingEtudiants.value || pendingSalles.value || pendingHistorique.value)

// Update stats when data is loaded
watch([etudiants, sallesData, historique], () => {
  if (etudiants.value) {
    stats.value.totalStudents = etudiants.value.length
  }
  
  if (sallesData.value) {
    stats.value.totalRooms = sallesData.value.length
    salles.value = sallesData.value
  }
  
  if (historique.value) {
    stats.value.totalHistory = historique.value.length
    
    // Calculate active access (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    stats.value.activeAccess = historique.value.filter(record => 
      new Date(record.date_entree) > yesterday
    ).length
    
    // Set recent access (sorted by date, most recent first)
    recentAccess.value = [...historique.value]
      .sort((a, b) => new Date(b.date_entree) - new Date(a.date_entree))
      .slice(0, 5)
  }
}, { immediate: true })

// Helper functions
const getSalleName = (salleId) => {
  const salle = salles.value.find(s => s.id === salleId)
  return salle ? salle.nom_salle : `Salle ${salleId}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Date invalide'
  }
}
</script>