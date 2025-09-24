# 🗄️ Guide d'intégration Supabase pour SpaceMap

Ce guide vous explique comment configurer et utiliser Supabase comme base de données pour votre projet SpaceMap.

## 📋 Prérequis

- Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))
- Node.js installé
- Le projet SpaceMap configuré

## 🚀 Étape 1 : Créer un projet Supabase

1. **Connectez-vous à Supabase** : [supabase.com](https://supabase.com)
2. **Créez un nouveau projet** :
   - Cliquez sur "New Project"
   - Choisissez votre organisation
   - Nom du projet : `spacemap` (ou votre choix)
   - Mot de passe de la base de données : créez un mot de passe fort
   - Région : choisissez la plus proche de vous
   - Cliquez sur "Create new project"

3. **Attendez l'initialisation** (1-2 minutes)

## 🔧 Étape 2 : Configuration de la base de données

### 2.1 Créer la table planets

1. **Accédez à l'éditeur SQL** :
   - Dans votre dashboard Supabase
   - Cliquez sur "SQL Editor" dans la sidebar

2. **Exécutez le script de création** :
   - Copiez le contenu du fichier `backend/database/supabase-setup.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" pour exécuter

3. **Vérifiez la création** :
   - Allez dans "Table Editor"
   - Vous devriez voir la table `planets` avec les 9 planètes
   - Les colonnes e-commerce existent: `price`, `is_available`, `owner_id`

### 2.2 Récupérer les clés API

1. **Accédez aux paramètres API** :
   - Cliquez sur "Settings" (icône engrenage)
   - Puis "API"

2. **Copiez les informations importantes** :
   - **Project URL** : `https://your-project.supabase.co`
   - **anon/public key** : `eyJ...` (clé publique)
   - **service_role key** : `eyJ...` (clé privée - gardez-la secrète)

## ⚙️ Étape 3 : Configuration du backend

### 3.1 Mettre à jour les variables d'environnement

Editez le fichier `backend/.env` :

```env
# Type de base de données
DATABASE_TYPE=supabase

# Configuration Supabase (remplacez par vos vraies valeurs)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Tester la connexion

```bash
cd backend
node -e "require('./config/supabase').testConnection()"
```

Si tout fonctionne, vous devriez voir : `✅ Connexion Supabase réussie`

## 📊 Étape 4 : Migration des données (optionnel)

Si vous avez déjà des données dans le fichier JSON et que la table est vide :

```bash
cd backend
node scripts/migrate-to-supabase.js
```

Ce script va :
- Tester la connexion Supabase
- Charger les données JSON existantes
- Les migrer vers Supabase
- Afficher un rapport de migration

## 🚀 Étape 5 : Démarrer avec Supabase

1. **Redémarrez le serveur backend** :
```bash
cd backend
npm run dev
```

2. **Vérifiez que Supabase est utilisé** :
```bash
curl http://localhost:3001/api/health
```

Vous devriez voir `"database": "Supabase PostgreSQL"`

3. **Testez les endpoints** :
```bash
# Récupérer toutes les planètes
curl http://localhost:3001/api/planets

# Health check de la base de données
curl http://localhost:3001/api/planets/health/database
```

## 🔄 Basculer entre JSON et Supabase

Vous pouvez facilement basculer entre les deux systèmes :

### Utiliser JSON :
```env
DATABASE_TYPE=json
```

### Utiliser Supabase :
```env
DATABASE_TYPE=supabase
```

Redémarrez le serveur après chaque changement.

## 🛠️ Fonctionnalités Supabase

### Avantages de Supabase vs JSON :

| Fonctionnalité | JSON | Supabase |
|----------------|------|----------|
| **Performance** | Limitée | Excellente avec index |
| **Recherche** | Basique | Recherche SQL avancée |
| **Concurrence** | Problématique | Gérée automatiquement |
| **Backup** | Manuel | Automatique |
| **Scalabilité** | Limitée | Excellente |
| **Temps réel** | Non | Oui (subscriptions) |
| **Interface admin** | Non | Dashboard complet |

### Nouvelles routes disponibles avec Supabase :

- `GET /api/planets/health/database` - Santé de la base
- Toutes les réponses incluent `"source": "supabase"`

### Activer l'achat de planètes

1. Exécutez le script `backend/database/supabase-setup.sql` (ajoute `price`, `is_available`, `owner_id` et crée `purchases`).
2. Configurez `DATABASE_TYPE=supabase` et vos clés dans `backend/.env`.
3. Endpoints:
   - `POST /api/auth/signup` et `POST /api/auth/login` (email/password)
   - `POST /api/purchases` avec `{ planetId }` et header `Authorization: Bearer <access_token>`
   - `GET /api/purchases/my` pour l'historique d'achats

## 🔍 Administration et monitoring

### Dashboard Supabase

Accédez à votre dashboard pour :
- **Table Editor** : Voir et modifier les données
- **SQL Editor** : Exécuter des requêtes SQL
- **API Docs** : Documentation auto-générée
- **Auth** : Gestion des utilisateurs (pour plus tard)
- **Logs** : Voir les requêtes et erreurs

### Requêtes SQL utiles

```sql
-- Voir toutes les planètes
SELECT name, type, distance FROM planets ORDER BY name;

-- Chercher des planètes
SELECT * FROM planets WHERE name ILIKE '%mars%';

-- Statistiques
SELECT 
  type, 
  COUNT(*) as count,
  AVG(size) as avg_size,
  SUM(moons) as total_moons
FROM planets 
GROUP BY type;

-- Planètes par distance du soleil
SELECT name, distance, position_x, position_y, position_z 
FROM planets 
ORDER BY 
  SQRT(position_x^2 + position_y^2 + position_z^2);
```

## 🚨 Dépannage

### Problème de connexion
```bash
# Tester la connexion
curl https://your-project.supabase.co/rest/v1/planets \
  -H "apikey: your-anon-key"
```

### Variables d'environnement non trouvées
- Vérifiez que le fichier `.env` est dans le dossier `backend/`
- Redémarrez le serveur après modification
- Vérifiez qu'il n'y a pas d'espaces dans les clés

### Table non trouvée
- Exécutez le script SQL `supabase-setup.sql`
- Vérifiez dans Table Editor que la table `planets` existe

### Problème d'authentification
- Utilisez la clé `anon` pour les opérations normales
- Vérifiez que les clés sont complètes (très longues)

## 📚 Ressources supplémentaires

- [Documentation Supabase](https://supabase.com/docs)
- [Guide PostgreSQL](https://www.postgresql.org/docs/)
- [Client JavaScript Supabase](https://supabase.com/docs/reference/javascript)

---

🎉 **Félicitations !** Votre projet SpaceMap utilise maintenant une vraie base de données PostgreSQL avec Supabase !
