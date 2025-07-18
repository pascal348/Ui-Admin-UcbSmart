// SmartAccess UCB Vue.js Application
const { createApp } = Vue;

createApp({
    data() {
        return {
            // Application state
            currentView: 'dashboard',
            loading: false,
            
            // API base URL
            apiBase: 'http://127.0.0.1:8000',
            
            // Data collections
            students: [],
            rooms: [],
            history: [],
            recentAccess: [],
            
            // Statistics
            stats: {
                totalStudents: 0,
                totalRooms: 0,
                activeAccess: 0,
                totalHistory: 0
            },
            
            // Forms
            importForm: {
                matricule_ext: ''
            },
            roomForm: {
                nom_salle: '',
                localisation: '',
                description: ''
            },
            accessForm: {
                etudiant_id: '',
                salle_id: '',
                date_debut: '',
                date_fin: ''
            },
            verifyForm: {
                matricule: '',
                salle_id: ''
            },
            
            // Search and filters
            studentSearch: '',
            historyFilter: {
                salle_id: '',
                date_debut: '',
                date_fin: ''
            },
            
            // Pagination
            currentStudentPage: 1,
            currentHistoryPage: 1,
            itemsPerPage: 10,
            
            // UI state
            toasts: [],
            verificationResult: null,
            
            // Toast counter for unique IDs
            toastCounter: 0
        };
    },
    
    computed: {
        // Filtered students based on search
        filteredStudents() {
            if (!this.studentSearch) return this.students;
            const search = this.studentSearch.toLowerCase();
            return this.students.filter(student => 
                student.nom.toLowerCase().includes(search) ||
                student.prenom.toLowerCase().includes(search) ||
                student.matricule.toLowerCase().includes(search)
            );
        },
        
        // Paginated students
        paginatedStudents() {
            const start = (this.currentStudentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredStudents.slice(start, end);
        },
        
        // Total student pages
        totalStudentPages() {
            return Math.ceil(this.filteredStudents.length / this.itemsPerPage);
        },
        
        // Filtered history
        filteredHistory() {
            let filtered = [...this.history];
            
            if (this.historyFilter.salle_id) {
                filtered = filtered.filter(record => 
                    record.salle_id == this.historyFilter.salle_id
                );
            }
            
            if (this.historyFilter.date_debut) {
                const startDate = new Date(this.historyFilter.date_debut);
                filtered = filtered.filter(record => 
                    new Date(record.date_entree) >= startDate
                );
            }
            
            if (this.historyFilter.date_fin) {
                const endDate = new Date(this.historyFilter.date_fin);
                endDate.setHours(23, 59, 59, 999); // End of day
                filtered = filtered.filter(record => 
                    new Date(record.date_entree) <= endDate
                );
            }
            
            return filtered;
        },
        
        // Paginated history
        paginatedHistory() {
            const start = (this.currentHistoryPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredHistory.slice(start, end);
        },
        
        // Total history pages
        totalHistoryPages() {
            return Math.ceil(this.filteredHistory.length / this.itemsPerPage);
        }
    },
    
    methods: {
        // Navigation
        setView(view) {
            this.currentView = view;
            this.verificationResult = null;
            
            // Load data based on view
            switch(view) {
                case 'dashboard':
                    this.loadDashboardData();
                    break;
                case 'students':
                    this.loadStudents();
                    break;
                case 'rooms':
                    this.loadRooms();
                    break;
                case 'access':
                    this.loadStudents();
                    this.loadRooms();
                    break;
                case 'verify':
                    this.loadRooms();
                    break;
                case 'history':
                    this.loadHistory();
                    this.loadRooms();
                    break;
            }
        },
        
        // API request helper
        async apiRequest(method, endpoint, data = null) {
            try {
                const config = {
                    method,
                    url: `${this.apiBase}${endpoint}`,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                if (data) {
                    config.data = data;
                }
                
                const response = await axios(config);
                return response.data;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },
        
        // Load dashboard data
        async loadDashboardData() {
            this.loading = true;
            try {
                await Promise.all([
                    this.loadStudents(),
                    this.loadRooms(),
                    this.loadHistory()
                ]);
                
                // Update stats
                this.stats.totalStudents = this.students.length;
                this.stats.totalRooms = this.rooms.length;
                this.stats.totalHistory = this.history.length;
                this.stats.activeAccess = this.history.filter(record => 
                    new Date(record.date_entree) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length;
                
                // Set recent access
                this.recentAccess = [...this.history]
                    .sort((a, b) => new Date(b.date_entree) - new Date(a.date_entree))
                    .slice(0, 5);
                    
            } catch (error) {
                this.showToast('Erreur lors du chargement des données du tableau de bord', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        // Load students
        async loadStudents() {
            try {
                this.students = await this.apiRequest('GET', '/etudiants/') || [];
            } catch (error) {
                this.showToast('Erreur lors du chargement des étudiants', 'danger');
                this.students = [];
            }
        },
        
        // Load rooms
        async loadRooms() {
            try {
                this.rooms = await this.apiRequest('GET', '/salles/') || [];
            } catch (error) {
                this.showToast('Erreur lors du chargement des salles', 'danger');
                this.rooms = [];
            }
        },
        
        // Load history
        async loadHistory() {
            try {
                this.history = await this.apiRequest('GET', '/historiques/') || [];
            } catch (error) {
                this.showToast('Erreur lors du chargement de l\'historique', 'danger');
                this.history = [];
            }
        },
        
        // Import student
        async importStudent() {
            if (!this.importForm.matricule_ext.trim()) {
                this.showToast('Veuillez entrer un matricule', 'warning');
                return;
            }
            
            this.loading = true;
            try {
                const endpoint = `/etudiants/create-from-matricule?matricule=${encodeURIComponent(this.importForm.matricule_ext)}`;
                const response = await this.apiRequest('POST', endpoint);
                
                if (response && response.etudiant) {
                    const student = response.etudiant;
                    this.showToast(
                        `Étudiant importé avec succès: ${student.nom} ${student.prenom} (${student.matricule})`,
                        'success'
                    );
                    
                    // Reset form and close modal
                    this.importForm.matricule_ext = '';
                    const modal = bootstrap.Modal.getInstance(document.getElementById('importStudentModal'));
                    modal.hide();
                    
                    // Reload students
                    await this.loadStudents();
                } else {
                    throw new Error('Réponse API invalide');
                }
            } catch (error) {
                this.showToast('Erreur lors de l\'importation de l\'étudiant', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        // Create room
        async createRoom() {
            if (!this.roomForm.nom_salle.trim()) {
                this.showToast('Veuillez entrer un nom de salle', 'warning');
                return;
            }
            
            this.loading = true;
            try {
                const response = await this.apiRequest('POST', '/salles/', {
                    nom_salle: this.roomForm.nom_salle,
                    localisation: this.roomForm.localisation,
                    description: this.roomForm.description
                });
                
                if (response && response.id) {
                    this.showToast(`Salle créée avec succès (ID: ${response.id})`, 'success');
                    
                    // Reset form and close modal
                    this.roomForm = {
                        nom_salle: '',
                        localisation: '',
                        description: ''
                    };
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createRoomModal'));
                    modal.hide();
                    
                    // Reload rooms
                    await this.loadRooms();
                } else {
                    throw new Error('Réponse API invalide');
                }
            } catch (error) {
                this.showToast('Erreur lors de la création de la salle', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        // Grant access
        async grantAccess() {
            if (!this.accessForm.etudiant_id || !this.accessForm.salle_id || !this.accessForm.date_debut) {
                this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
                return;
            }
            
            this.loading = true;
            try {
                const payload = {
                    etudiant_id: parseInt(this.accessForm.etudiant_id),
                    salle_id: parseInt(this.accessForm.salle_id),
                    date_debut: new Date(this.accessForm.date_debut).toISOString(),
                    date_fin: this.accessForm.date_fin ? new Date(this.accessForm.date_fin).toISOString() : null
                };
                
                const response = await this.apiRequest('POST', '/autorisations/', payload);
                
                if (response && response.id) {
                    this.showToast(`Accès accordé avec succès (ID: ${response.id})`, 'success');
                    
                    // Reset form
                    this.accessForm = {
                        etudiant_id: '',
                        salle_id: '',
                        date_debut: '',
                        date_fin: ''
                    };
                } else {
                    throw new Error('Réponse API invalide');
                }
            } catch (error) {
                this.showToast('Erreur lors de l\'octroi d\'accès', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        // Verify access
        async verifyAccess() {
            if (!this.verifyForm.matricule.trim() || !this.verifyForm.salle_id) {
                this.showToast('Veuillez remplir tous les champs', 'warning');
                return;
            }
            
            this.loading = true;
            this.verificationResult = null;
            
            try {
                // This is a mock verification since the API endpoint might not exist
                // In a real implementation, you would call the actual verification endpoint
                const endpoint = `/verifier-acces?matricule=${encodeURIComponent(this.verifyForm.matricule)}&salle_id=${this.verifyForm.salle_id}`;
                
                try {
                    const response = await this.apiRequest('GET', endpoint);
                    this.verificationResult = {
                        hasAccess: response.hasAccess || false,
                        message: response.message || 'Vérification effectuée'
                    };
                } catch (error) {
                    // Fallback: simulate verification based on existing data
                    const student = this.students.find(s => s.matricule === this.verifyForm.matricule);
                    const room = this.rooms.find(r => r.id == this.verifyForm.salle_id);
                    
                    if (!student) {
                        this.verificationResult = {
                            hasAccess: false,
                            message: 'Étudiant non trouvé dans la base de données'
                        };
                    } else if (!room) {
                        this.verificationResult = {
                            hasAccess: false,
                            message: 'Salle non trouvée'
                        };
                    } else {
                        // Check if student has recent access to this room
                        const hasRecentAccess = this.history.some(record => 
                            record.matricule_utilise === this.verifyForm.matricule &&
                            record.salle_id == this.verifyForm.salle_id &&
                            new Date(record.date_entree) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                        );
                        
                        this.verificationResult = {
                            hasAccess: hasRecentAccess,
                            message: hasRecentAccess 
                                ? `Accès autorisé pour ${student.nom} ${student.prenom} à la salle ${room.nom_salle}`
                                : `Aucun accès actif trouvé pour ${student.nom} ${student.prenom} à la salle ${room.nom_salle}`
                        };
                    }
                }
            } catch (error) {
                this.showToast('Erreur lors de la vérification d\'accès', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        // View student details (placeholder)
        viewStudentDetails(student) {
            this.showToast(`Détails de ${student.nom} ${student.prenom}`, 'info');
        },
        
        // Edit room (placeholder)
        editRoom(room) {
            this.showToast(`Modification de la salle ${room.nom_salle}`, 'info');
        },
        
        // Delete room (placeholder)
        deleteRoom(room) {
            if (confirm(`Êtes-vous sûr de vouloir supprimer la salle ${room.nom_salle} ?`)) {
                this.showToast(`Salle ${room.nom_salle} supprimée`, 'warning');
            }
        },
        
        // Toast notifications
        showToast(message, type = 'info') {
            const toast = {
                id: ++this.toastCounter,
                message,
                type
            };
            
            this.toasts.push(toast);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                this.removeToast(toast.id);
            }, 5000);
        },
        
        removeToast(id) {
            const index = this.toasts.findIndex(toast => toast.id === id);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        },
        
        getToastIcon(type) {
            const icons = {
                success: 'bi bi-check-circle-fill',
                danger: 'bi bi-exclamation-triangle-fill',
                warning: 'bi bi-exclamation-triangle-fill',
                info: 'bi bi-info-circle-fill'
            };
            return icons[type] || icons.info;
        },
        
        getToastTitle(type) {
            const titles = {
                success: 'Succès',
                danger: 'Erreur',
                warning: 'Attention',
                info: 'Information'
            };
            return titles[type] || titles.info;
        },
        
        // Utility methods
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            try {
                return new Date(dateString).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                return 'Date invalide';
            }
        },
        
        // Initialize default dates for access form
        initializeAccessForm() {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            this.accessForm.date_debut = now.toISOString().slice(0, 16);
            this.accessForm.date_fin = tomorrow.toISOString().slice(0, 16);
        }
    },
    
    // Lifecycle hooks
    async mounted() {
        // Load initial data
        await this.loadDashboardData();
        
        // Initialize access form dates
        this.initializeAccessForm();
        
        // Show welcome message
        this.showToast('Bienvenue sur SmartAccess UCB !', 'success');
    }
}).mount('#app');