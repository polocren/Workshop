const express = require('express');
const router = express.Router();
const planetService = require('../services/unifiedPlanetService');

// Middleware de validation pour les données de planète
const validatePlanetData = (req, res, next) => {
  const { name, type } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({
      success: false,
      error: 'Données manquantes',
      required: ['name', 'type']
    });
  }
  
  next();
};

// GET /api/planets - Récupérer toutes les planètes
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let planets;
    if (search) {
      planets = await planetService.searchPlanets(search);
    } else {
      planets = await planetService.getAllPlanets();
    }
    
    res.json({
      success: true,
      count: planets.length,
      data: planets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/planets/:id - Récupérer une planète par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const planet = await planetService.getPlanetById(id);
    
    res.json({
      success: true,
      data: planet
    });
  } catch (error) {
    const statusCode = error.message === 'Planète non trouvée' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

const PURCHASE_ONLY = process.env.PURCHASE_ONLY === 'true'

// POST /api/planets - Créer une nouvelle planète (désactivé en mode achat)
router.post('/', validatePlanetData, async (req, res) => {
  if (PURCHASE_ONLY) {
    return res.status(405).json({ success: false, error: 'Création désactivée (mode achat uniquement)' })
  }
  try {
    const newPlanet = await planetService.createPlanet(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Planète créée avec succès',
      data: newPlanet
    });
  } catch (error) {
    const statusCode = error.message.includes('existe déjà') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/planets/:id - Mettre à jour une planète (désactivé en mode achat)
router.put('/:id', async (req, res) => {
  if (PURCHASE_ONLY) {
    return res.status(405).json({ success: false, error: 'Mise à jour désactivée (mode achat uniquement)' })
  }
  try {
    const { id } = req.params;
    const updatedPlanet = await planetService.updatePlanet(id, req.body);
    
    res.json({
      success: true,
      message: 'Planète mise à jour avec succès',
      data: updatedPlanet
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === 'Planète non trouvée') {
      statusCode = 404;
    } else if (error.message.includes('existe déjà')) {
      statusCode = 409;
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/planets/:id - Supprimer une planète (désactivé en mode achat)
router.delete('/:id', async (req, res) => {
  if (PURCHASE_ONLY) {
    return res.status(405).json({ success: false, error: 'Suppression désactivée (mode achat uniquement)' })
  }
  try {
    const { id } = req.params;
    const deletedPlanet = await planetService.deletePlanet(id);
    
    res.json({
      success: true,
      message: 'Planète supprimée avec succès',
      data: deletedPlanet
    });
  } catch (error) {
    const statusCode = error.message === 'Planète non trouvée' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/planets/stats/overview - Statistiques des planètes
router.get('/stats/overview', async (req, res) => {
  try {
    const planets = await planetService.getAllPlanets();
    
    const stats = {
      total: planets.length,
      types: {},
      totalMoons: 0,
      averageSize: 0
    };
    
    planets.forEach(planet => {
      // Compter par type
      stats.types[planet.type] = (stats.types[planet.type] || 0) + 1;
      
      // Total des lunes
      stats.totalMoons += planet.moons || 0;
      
      // Somme des tailles pour la moyenne
      stats.averageSize += planet.size || 0;
    });
    
    // Calculer la taille moyenne
    stats.averageSize = stats.averageSize / planets.length;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
