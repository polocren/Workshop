// Configuration pour choisir le type de base de données
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'json'; // 'json' ou 'supabase'

let planetService;

if (DATABASE_TYPE === 'supabase') {
  planetService = require('./supabasePlanetService');
  console.log('Utilisation de Supabase comme base de données');
} else {
  planetService = require('./planetService');
  console.log('Utilisation de JSON comme base de données');
}

// Service unifié qui délègue vers le bon service selon la configuration
class UnifiedPlanetService {
  async getAllPlanets() {
    return await planetService.getAllPlanets();
  }

  async getPlanetById(id) {
    return await planetService.getPlanetById(id);
  }

  async createPlanet(planetData) {
    return await planetService.createPlanet(planetData);
  }

  async updatePlanet(id, updateData) {
    return await planetService.updatePlanet(id, updateData);
  }

  async deletePlanet(id) {
    return await planetService.deletePlanet(id);
  }

  async searchPlanets(query) {
    return await planetService.searchPlanets(query);
  }

  async getPlanetStats() {
    if (planetService.getPlanetStats) {
      return await planetService.getPlanetStats();
    }
    
    // Fallback pour le service JSON qui n'a pas cette méthode
    const planets = await planetService.getAllPlanets();
    const stats = {
      total: planets.length,
      types: {},
      totalMoons: 0,
      averageSize: 0
    };
    
    planets.forEach(planet => {
      stats.types[planet.type] = (stats.types[planet.type] || 0) + 1;
      stats.totalMoons += planet.moons || 0;
      stats.averageSize += planet.size || 0;
    });
    
    stats.averageSize = planets.length > 0 ? stats.averageSize / planets.length : 0;
    
    return stats;
  }

  async testConnection() {
    if (planetService.testConnection) {
      return await planetService.testConnection();
    }
    
    // Fallback pour le service JSON
    try {
      await planetService.getAllPlanets();
      return true;
    } catch (error) {
      return false;
    }
  }

  getDatabaseType() {
    return DATABASE_TYPE;
  }
}

module.exports = new UnifiedPlanetService();
