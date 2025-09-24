const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'json';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import des routes selon le type de base de données
let planetsRoutes;
if (DATABASE_TYPE === 'supabase') {
  planetsRoutes = require('./routes/supabase-planets');
  console.log('Routes Supabase chargées');
} else {
  planetsRoutes = require('./routes/planets');
  console.log('Routes JSON chargées');
}

// Routes
app.use('/api/planets', planetsRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/purchases', require('./routes/purchases'));

// Route de test avec informations sur la base de données
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SpaceMap API is running!',
    database: DATABASE_TYPE === 'supabase' ? 'Supabase PostgreSQL' : 'JSON File',
    timestamp: new Date().toISOString()
  });
});

// Route pour obtenir des informations sur l'API
app.get('/api/info', (req, res) => {
  res.json({
    name: 'SpaceMap API',
    version: '1.0.0',
    database: {
      type: DATABASE_TYPE === 'supabase' ? 'Supabase PostgreSQL' : 'JSON File',
      status: 'Connected'
    },
    endpoints: {
      planets: '/api/planets',
      health: '/api/health',
      info: '/api/info'
    },
    documentation: '/README.md'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`API SpaceMap démarrée sur le port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Planets API: http://localhost:${PORT}/api/planets`);
});

module.exports = app;
