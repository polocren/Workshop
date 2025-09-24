# SpaceMap - API Documentation

## 🚀 Vue d'ensemble

SpaceMap est une application 3D interactive permettant d'explorer le système solaire. Elle utilise Vue.js 3 + Three.js pour le frontend et Express.js pour l'API backend.

## 📁 Structure du projet

```
spacemap/
├── backend/                 # API Express.js
│   ├── data/
│   │   └── planets.json    # Base de données JSON
│   ├── routes/
│   │   └── planets.js      # Routes API des planètes
│   ├── services/
│   │   └── planetService.js # Service de gestion des planètes
│   ├── server.js           # Serveur principal
│   └── package.json
├── src/                    # Frontend Vue.js
│   ├── components/
│   │   ├── SpaceMap.vue    # Composant principal 3D
│   │   ├── PlanetInfo.vue  # Affichage des infos planètes
│   │   └── NavigationControls.vue
│   ├── services/
│   │   └── planetAPI.ts    # Client API
│   └── types/
│       └── Planet.ts       # Types TypeScript
└── public/
    └── images/planets/     # Images SVG des planètes
```

## 🔧 Démarrage du projet

### Backend (Port 3001)
```bash
cd backend
npm install
npm run dev
```

### Frontend (Port 5173)
```bash
npm install
npm run dev
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Routes disponibles

#### Planètes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/planets` | Récupérer toutes les planètes |
| GET | `/planets?search=query` | Rechercher des planètes |
| GET | `/planets/:id` | Récupérer une planète par ID |
| POST | `/planets` | Créer une nouvelle planète |
| PUT | `/planets/:id` | Mettre à jour une planète |
| DELETE | `/planets/:id` | Supprimer une planète |
| GET | `/planets/stats/overview` | Statistiques des planètes |

#### Santé de l'API
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Vérifier l'état de l'API |

## 📝 Format des données

### Objet Planet
```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "distance": "string",
  "diameter": "string",
  "description": "string",
  "position": {
    "x": "number",
    "y": "number",
    "z": "number"
  },
  "color": "string (hex)",
  "size": "number",
  "image": "string (path)",
  "discoveryDate": "string | null",
  "moons": "number",
  "orbitalPeriod": "string | null",
  "temperature": "string",
  "composition": "string"
}
```

### Réponse API Standard
```json
{
  "success": "boolean",
  "data": "any",
  "count": "number (optionnel)",
  "message": "string (optionnel)",
  "error": "string (optionnel)"
}
```

## 🎮 Utilisation du frontend

### Navigation 3D
- **Rotation** : Clic gauche + glisser
- **Zoom** : Molette de la souris
- **Déplacement** : Clic droit + glisser

### Interactions
- **Cliquer sur une planète** : Affiche les informations détaillées
- **Survol** : Met en évidence la planète

## 🔄 Flux de données

1. **Chargement initial** : Le frontend vérifie la santé de l'API
2. **Récupération des planètes** : Appel à `GET /api/planets`
3. **Conversion des données** : Transformation pour Three.js
4. **Rendu 3D** : Création des objets 3D dans la scène
5. **Interactions** : Clic sur planète → Affichage des informations

## 🛠️ Développement

### Ajouter une nouvelle planète
```javascript
// Exemple d'appel API
const newPlanet = await planetAPI.createPlanet({
  name: "Pluton",
  type: "Planète naine",
  distance: "39,48 UA",
  diameter: "2,374 km",
  description: "Pluton est une planète naine...",
  position: { x: 50, y: 0, z: 0 },
  color: "0x8C7853",
  size: 0.6,
  image: "/images/planets/pluton.svg"
});
```

### Modifier une planète existante
```javascript
// Exemple de mise à jour
const updatedPlanet = await planetAPI.updatePlanet("1", {
  description: "Nouvelle description...",
  temperature: "6000°C"
});
```

## 🚨 Gestion d'erreurs

L'application gère automatiquement :
- **Connexion API échouée** : Affichage d'un message d'erreur avec bouton de réessai
- **Planète non trouvée** : Gestion des erreurs 404
- **Données invalides** : Validation côté serveur et client

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Statistiques
```bash
curl http://localhost:3001/api/planets/stats/overview
```

## 🔐 Sécurité

- **CORS** : Configuré pour permettre les requêtes cross-origin
- **Validation** : Validation des données d'entrée
- **Gestion d'erreurs** : Messages d'erreur sécurisés

## 🚀 Déploiement

### Backend
1. Configurer les variables d'environnement
2. Utiliser `npm start` pour la production
3. Considérer PM2 pour le process management

### Frontend
1. Build avec `npm run build`
2. Servir les fichiers statiques
3. Configurer l'URL de l'API pour la production

## 📈 Améliorations futures

- [ ] Authentification utilisateur
- [ ] Base de données SQL (PostgreSQL/MySQL)
- [ ] Cache Redis
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI
- [ ] Logs structurés
- [ ] Métriques et monitoring
- [ ] WebSockets pour temps réel
