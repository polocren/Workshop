const supabaseConfig = require('../config/supabase');

class SupabasePlanetService {
  constructor() {
    this.supabase = supabaseConfig.getClient();
  }

  // Convertir les données Supabase au format attendu par le frontend
  formatPlanetFromDB(planet) {
    if (!planet) return null;
    
    return {
      id: planet.id,
      name: planet.name,
      type: planet.type,
      distance: planet.distance,
      diameter: planet.diameter,
      description: planet.description,
      position: {
        x: parseFloat(planet.position_x) || 0,
        y: parseFloat(planet.position_y) || 0,
        z: parseFloat(planet.position_z) || 0
      },
      color: planet.color,
      size: parseFloat(planet.size) || 1,
      image: planet.image,
      discoveryDate: planet.discovery_date,
      moons: planet.moons || 0,
      orbitalPeriod: planet.orbital_period,
      temperature: planet.temperature,
      composition: planet.composition,
      // Champs e-commerce (optionnels)
      price: planet.price !== undefined && planet.price !== null ? parseFloat(planet.price) : 0,
      isAvailable: planet.is_available !== false,
      ownerId: planet.owner_id || null
    };
  }

  // Convertir les données du frontend au format DB
  formatPlanetForDB(planetData) {
    return {
      name: planetData.name,
      type: planetData.type,
      distance: planetData.distance,
      diameter: planetData.diameter,
      description: planetData.description,
      position_x: planetData.position?.x || 0,
      position_y: planetData.position?.y || 0,
      position_z: planetData.position?.z || 0,
      color: planetData.color,
      size: planetData.size || 1,
      image: planetData.image,
      discovery_date: planetData.discoveryDate,
      moons: planetData.moons || 0,
      orbital_period: planetData.orbitalPeriod,
      temperature: planetData.temperature,
      composition: planetData.composition,
      // Champs e-commerce
      price: planetData.price ?? 0,
      is_available: planetData.isAvailable ?? true,
      owner_id: planetData.ownerId ?? null
    };
  }

  // Récupérer toutes les planètes
  async getAllPlanets() {
    try {
      const { data, error } = await this.supabase
        .from('planets')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      return data.map(planet => this.formatPlanetFromDB(planet));
    } catch (error) {
      console.error('Erreur lors de la récupération des planètes:', error);
      throw new Error('Impossible de charger les données des planètes depuis Supabase');
    }
  }

  // Récupérer une planète par ID
  async getPlanetById(id) {
    try {
      const { data, error } = await this.supabase
        .from('planets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Planète non trouvée');
        }
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      return this.formatPlanetFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la recherche de la planète:', error);
      throw error;
    }
  }

  // Créer une nouvelle planète
  async createPlanet(planetData) {
    try {
      // Vérifier que le nom n'existe pas déjà
      const { data: existing } = await this.supabase
        .from('planets')
        .select('id')
        .ilike('name', planetData.name)
        .single();

      if (existing) {
        throw new Error('Une planète avec ce nom existe déjà');
      }

      const formattedData = this.formatPlanetForDB(planetData);
      
      const { data, error } = await this.supabase
        .from('planets')
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      return this.formatPlanetFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de la planète:', error);
      throw error;
    }
  }

  // Mettre à jour une planète
  async updatePlanet(id, updateData) {
    try {
      // Vérifier que la planète existe
      const existingPlanet = await this.getPlanetById(id);
      if (!existingPlanet) {
        throw new Error('Planète non trouvée');
      }

      // Vérifier que le nouveau nom n'existe pas déjà (sauf pour la planète actuelle)
      if (updateData.name) {
        const { data: existing } = await this.supabase
          .from('planets')
          .select('id')
          .ilike('name', updateData.name)
          .neq('id', id)
          .single();

        if (existing) {
          throw new Error('Une planète avec ce nom existe déjà');
        }
      }

      const formattedData = this.formatPlanetForDB(updateData);
      
      const { data, error } = await this.supabase
        .from('planets')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      return this.formatPlanetFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la planète:', error);
      throw error;
    }
  }

  // Supprimer une planète
  async deletePlanet(id) {
    try {
      // Récupérer la planète avant suppression
      const planet = await this.getPlanetById(id);
      
      const { error } = await this.supabase
        .from('planets')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      return planet;
    } catch (error) {
      console.error('Erreur lors de la suppression de la planète:', error);
      throw error;
    }
  }

  // Rechercher des planètes par nom ou type
  async searchPlanets(query) {
    try {
      const searchQuery = `%${query}%`;
      
      const { data, error } = await this.supabase
        .from('planets')
        .select('*')
        .or(`name.ilike.${searchQuery},type.ilike.${searchQuery}`)
        .order('name');

      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      return data.map(planet => this.formatPlanetFromDB(planet));
    } catch (error) {
      console.error('Erreur lors de la recherche de planètes:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des planètes
  async getPlanetStats() {
    try {
      // Récupérer toutes les planètes pour calculer les stats
      const planets = await this.getAllPlanets();
      
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
      stats.averageSize = planets.length > 0 ? stats.averageSize / planets.length : 0;
      
      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }

  // Test de connexion
  async testConnection() {
    return await supabaseConfig.testConnection();
  }
}

module.exports = new SupabasePlanetService();
