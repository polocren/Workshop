# 🌌 SpaceMap - Système Solaire Interactif 3D

Une application web interactive permettant d'explorer le système solaire en 3D avec Vue.js, Three.js et Express.js.

![SpaceMap Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D)
![Three.js](https://img.shields.io/badge/Three.js-Latest-000000)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

## ✨ Fonctionnalités

- 🌍 **Exploration 3D** : Navigation fluide dans l'espace avec contrôles intuitifs
- 🪐 **Planètes détaillées** : Informations complètes avec images SVG personnalisées
- 🎯 **Interaction** : Clic sur les planètes pour afficher leurs caractéristiques
- 🔄 **API REST** : Backend Express.js pour la gestion des données
- 📱 **Responsive** : Interface adaptée à tous les écrans
- ⚡ **Performance** : Rendu 3D optimisé avec Three.js
- 🎨 **Design moderne** : Interface utilisateur élégante avec animations

## 🎮 Contrôles

| Action | Contrôle |
|--------|----------|
| **Rotation de la caméra** | Clic gauche + glisser |
| **Zoom** | Molette de la souris |
| **Déplacement latéral** | Clic droit + glisser |
| **Informations planète** | Clic sur une planète |

## 🚀 Installation

### Prérequis
- Node.js (v18+ recommandé)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <repository-url>
cd spacemap
```

### 2. Installation du frontend
```bash
npm install
```

### 3. Installation du backend
```bash
cd backend
npm install
cd ..
```

### 4. Démarrage en développement

**Terminal 1 - Backend API (Port 3001) :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Port 5173) :**
```bash
npm run dev
```

### 5. Accéder à l'application
- **Frontend** : http://localhost:5173
- **API** : http://localhost:3001/api
- **Health Check** : http://localhost:3001/api/health

## 🏗️ Architecture

```
spacemap/
├── 🎨 Frontend (Vue.js + Three.js)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpaceMap.vue      # Scène 3D principale
│   │   │   ├── PlanetInfo.vue    # Panneau d'informations
│   │   │   └── NavigationControls.vue
│   │   ├── services/
│   │   │   └── planetAPI.ts      # Client API
│   │   └── types/
│   │       └── Planet.ts         # Types TypeScript
│   └── public/
│       └── images/planets/       # Images SVG des planètes
│
├── 🔧 Backend (Express.js)
│   ├── config/
│   │   └── supabase.js           # Configuration Supabase
│   ├── data/
│   │   └── planets.json          # Base de données JSON (fallback)
│   ├── database/
│   │   └── supabase-setup.sql    # Script de création de table
│   ├── routes/
│   │   ├── planets.js            # Routes pour JSON
│   │   └── supabase-planets.js   # Routes pour Supabase
│   ├── services/
│   │   ├── planetService.js      # Service JSON
│   │   ├── supabasePlanetService.js # Service Supabase
│   │   └── unifiedPlanetService.js # Service unifié
│   ├── scripts/
│   │   ├── migrate-to-supabase.js # Migration vers Supabase
│   │   └── test-supabase.js      # Tests Supabase
│   └── server.js                 # Serveur principal
│
└── 📝 Documentation
    ├── API_DOCUMENTATION.md
    ├── SUPABASE_SETUP.md         # Guide Supabase
    ├── test-api.js               # Tests API
    └── README.md
```

## 🛠️ Technologies utilisées

### Frontend
- **Vue.js 3** - Framework JavaScript réactif
- **Three.js** - Moteur 3D WebGL
- **TypeScript** - Typage statique
- **Vite** - Build tool rapide
- **SCSS** - Préprocesseur CSS

### Backend
- **Express.js** - Framework web Node.js
- **Supabase** - Base de données PostgreSQL (optionnel)
- **JSON File** - Base de données simple (par défaut)
- **CORS** - Gestion des requêtes cross-origin
- **UUID** - Génération d'identifiants uniques
- **Nodemon** - Rechargement automatique en développement

## 🗄️ Choix de base de données

SpaceMap supporte deux types de stockage :

### 📄 JSON File (par défaut)
- Configuration simple
- Idéal pour le développement
- Pas de dépendances externes

### 🗄️ Supabase PostgreSQL
- Base de données robuste
- Interface d'administration
- Recherche avancée
- Scalabilité excellente
- Backup automatique

Pour utiliser Supabase, consultez le guide : [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 📡 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/health` | Vérification de l'état de l'API |
| `GET` | `/api/planets` | Liste de toutes les planètes |
| `GET` | `/api/planets?search=query` | Recherche de planètes |
| `GET` | `/api/planets/:id` | Détails d'une planète |
| `POST` | `/api/planets` | Créer une nouvelle planète |
| `PUT` | `/api/planets/:id` | Mettre à jour une planète |
| `DELETE` | `/api/planets/:id` | Supprimer une planète |
| `GET` | `/api/planets/stats/overview` | Statistiques générales |

### Auth (Supabase)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/signup` | Créer un compte `{ email, password }` |
| `POST` | `/api/auth/login` | Se connecter `{ email, password }` → tokens |
| `GET` | `/api/auth/me` | Infos de l'utilisateur (Bearer token) |

### Achats (Supabase)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/purchases` | Acheter une planète `{ planetId }` (Bearer) |
| `GET` | `/api/purchases/my` | Mes achats (Bearer) |

## 🧪 Tests

Exécuter les tests de l'API :
```bash
node test-api.js
```

Les tests vérifient :
- ✅ Santé de l'API
- ✅ Récupération des planètes
- ✅ Recherche et filtrage
- ✅ Gestion des erreurs
- ✅ Statistiques

## 🌟 Planètes disponibles

Le système solaire complet avec :

| Planète | Type | Distance | Lunes |
|---------|------|----------|-------|
| ☀️ Soleil | Étoile | 0 UA | 0 |
| ☿️ Mercure | Rocheuse | 0,39 UA | 0 |
| ♀️ Vénus | Rocheuse | 0,72 UA | 0 |
| 🌍 Terre | Rocheuse | 1 UA | 1 |
| ♂️ Mars | Rocheuse | 1,52 UA | 2 |
| 🪐 Jupiter | Géante gazeuse | 5,20 UA | 95 |
| 🪐 Saturne | Géante gazeuse | 9,58 UA | 146 |
| 🌍 Uranus | Géante de glace | 19,18 UA | 28 |
| 🌍 Neptune | Géante de glace | 30,07 UA | 16 |

---

<div align="center">

**🌌 Explorez l'univers avec SpaceMap ! 🚀**

</div>
