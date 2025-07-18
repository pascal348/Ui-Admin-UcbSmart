# SmartAccess UCB - Système de Gestion des Accès

## Description

SmartAccess UCB est une application web moderne et responsive pour la gestion des accès des étudiants aux salles de l'Université Chrétienne Bilingue (UCB). L'application utilise Vue.js 3 pour l'interface utilisateur, Bootstrap 5 pour le design, et communique avec une API REST FastAPI.

## Fonctionnalités

### 🏠 Tableau de bord
- Vue d'ensemble avec statistiques en temps réel
- Nombre total d'étudiants, salles, et accès actifs
- Historique des 5 derniers accès

### 👥 Gestion des étudiants
- Liste complète des étudiants avec pagination
- Importation d'étudiants via matricule externe
- Recherche dynamique par nom, prénom ou matricule
- Interface responsive pour mobile et desktop

### 🏢 Gestion des salles
- Affichage en grille des salles disponibles
- Création de nouvelles salles avec informations détaillées
- Modification et suppression des salles existantes
- Design moderne avec cartes interactives

### 🔑 Octroi d'accès
- Attribution d'accès étudiant-salle avec dates de validité
- Sélection intuitive via menus déroulants
- Validation des données côté client
- Notifications de succès/erreur

### ✅ Vérification d'accès
- Vérification en temps réel de l'accès d'un étudiant
- Interface simple avec résultat visuel clair
- Messages détaillés sur le statut d'accès

### 📊 Historique des accès
- Consultation complète de l'historique
- Filtrage par salle et période
- Pagination pour les gros volumes de données
- Export possible des données

## Technologies utilisées

### Frontend
- **Vue.js 3** - Framework JavaScript progressif
- **Bootstrap 5** - Framework CSS responsive
- **Bootstrap Icons** - Icônes vectorielles
- **Axios** - Client HTTP pour les appels API

### Backend
- **PHP** - Passerelle API (api.php)
- **FastAPI** - API REST (serveur externe sur port 8000)
- **cURL** - Communication entre PHP et FastAPI

## Structure du projet

```
SmartAccess-UCB/
├── index.html              # Page principale de l'application
├── index.php              # Interface PHP originale (legacy)
├── api.php                # Passerelle API PHP
├── assets/
│   ├── css/
│   │   └── style.css      # Styles personnalisés
│   └── js/
│       └── app.js         # Application Vue.js principale
└── README.md              # Documentation
```

## Installation et configuration

### Prérequis
- Serveur web (Apache/Nginx) avec PHP 7.4+
- API FastAPI fonctionnelle sur `http://127.0.0.1:8000`
- Extensions PHP : cURL, JSON

### Installation
1. Clonez ou téléchargez les fichiers dans votre répertoire web
2. Assurez-vous que l'API FastAPI est démarrée sur le port 8000
3. Configurez votre serveur web pour servir les fichiers
4. Accédez à `index.html` dans votre navigateur

### Configuration API
L'URL de base de l'API peut être modifiée dans :
- `assets/js/app.js` : variable `apiBase`
- `api.php` : variable `$apiBase`

## Utilisation

### Navigation
L'application utilise une navigation par onglets :
- **Tableau de bord** : Vue d'ensemble et statistiques
- **Étudiants** : Gestion des étudiants
- **Salles** : Gestion des salles
- **Accès** : Octroi d'accès
- **Vérification** : Vérification d'accès
- **Historique** : Consultation de l'historique

### Fonctionnalités principales

#### Importer un étudiant
1. Cliquez sur "Importer étudiant" dans l'onglet Étudiants
2. Saisissez le matricule externe
3. Cliquez sur "Importer"

#### Créer une salle
1. Cliquez sur "Créer une salle" dans l'onglet Salles
2. Remplissez les informations (nom, localisation, description)
3. Cliquez sur "Créer la salle"

#### Accorder un accès
1. Dans l'onglet Accès, sélectionnez un étudiant et une salle
2. Définissez les dates de début et fin
3. Cliquez sur "Accorder l'accès"

#### Vérifier un accès
1. Dans l'onglet Vérification, saisissez le matricule
2. Sélectionnez la salle
3. Cliquez sur "Vérifier l'accès"

## API Endpoints

L'application communique avec les endpoints suivants :

- `GET /etudiants/` - Liste des étudiants
- `POST /etudiants/create-from-matricule` - Importer un étudiant
- `GET /salles/` - Liste des salles
- `POST /salles/` - Créer une salle
- `POST /autorisations/` - Créer une autorisation d'accès
- `GET /historiques/` - Historique des accès
- `GET /verifier-acces` - Vérifier un accès (optionnel)

## Fonctionnalités avancées

### Responsive Design
- Interface adaptée mobile, tablette et desktop
- Navigation optimisée pour écrans tactiles
- Tableaux avec défilement horizontal sur mobile

### Notifications
- Système de toast notifications
- Messages de succès, erreur, avertissement et information
- Suppression automatique après 5 secondes

### Pagination
- Pagination automatique pour les listes longues
- 10 éléments par page par défaut
- Navigation intuitive avec boutons précédent/suivant

### Recherche et filtrage
- Recherche en temps réel pour les étudiants
- Filtrage de l'historique par salle et date
- Mise à jour instantanée des résultats

## Personnalisation

### Thème et couleurs
Les couleurs principales peuvent être modifiées dans `assets/css/style.css` :
```css
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    --success-color: #198754;
    /* ... */
}
```

### Pagination
Le nombre d'éléments par page peut être modifié dans `assets/js/app.js` :
```javascript
itemsPerPage: 10, // Modifier cette valeur
```

## Sécurité

- Validation des données côté client et serveur
- Protection CORS configurée
- Échappement HTML pour prévenir les attaques XSS
- Gestion d'erreurs robuste

## Support et maintenance

### Logs d'erreurs
Les erreurs sont affichées dans :
- Console du navigateur (erreurs JavaScript)
- Notifications toast (erreurs utilisateur)
- Logs serveur PHP (erreurs API)

### Débogage
Pour activer le mode debug :
1. Ouvrez la console développeur (F12)
2. Les requêtes API sont loggées automatiquement
3. Les erreurs détaillées sont affichées

## Licence

Ce projet est développé pour l'Université Chrétienne Bilingue (UCB).

## Contact

Pour toute question ou support technique, contactez l'équipe de développement UCB.