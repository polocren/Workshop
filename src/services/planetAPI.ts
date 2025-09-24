import type { Planet } from '../types/Planet'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'

interface ApiResponse<T> {
  success: boolean
  data: T
  count?: number
  message?: string
  error?: string
}

class PlanetAPI {
  // Récupérer toutes les planètes
  async getAllPlanets(): Promise<Planet[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets`)
      const result: ApiResponse<Planet[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des planètes')
      }
      
      return result.data
    } catch (error) {
      console.error('Erreur API - getAllPlanets:', error)
      throw new Error('Impossible de charger les planètes depuis le serveur')
    }
  }

  // Récupérer une planète par ID
  async getPlanetById(id: string): Promise<Planet> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets/${id}`)
      const result: ApiResponse<Planet> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Planète non trouvée')
      }
      
      return result.data
    } catch (error) {
      console.error('Erreur API - getPlanetById:', error)
      throw new Error('Impossible de charger les détails de la planète')
    }
  }

  // Créer une nouvelle planète
  async createPlanet(planetData: Omit<Planet, 'id' | 'mesh'>): Promise<Planet> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planetData)
      })
      
      const result: ApiResponse<Planet> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création de la planète')
      }
      
      return result.data
    } catch (error) {
      console.error('Erreur API - createPlanet:', error)
      throw new Error('Impossible de créer la planète')
    }
  }

  // Mettre à jour une planète
  async updatePlanet(id: string, planetData: Partial<Planet>): Promise<Planet> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planetData)
      })
      
      const result: ApiResponse<Planet> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour de la planète')
      }
      
      return result.data
    } catch (error) {
      console.error('Erreur API - updatePlanet:', error)
      throw new Error('Impossible de mettre à jour la planète')
    }
  }

  // Supprimer une planète
  async deletePlanet(id: string): Promise<Planet> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets/${id}`, {
        method: 'DELETE'
      })
      
      const result: ApiResponse<Planet> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression de la planète')
      }
      
      return result.data
    } catch (error) {
      console.error('Erreur API - deletePlanet:', error)
      throw new Error('Impossible de supprimer la planète')
    }
  }

  // Rechercher des planètes
  async searchPlanets(query: string): Promise<Planet[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets?search=${encodeURIComponent(query)}`)
      const result: ApiResponse<Planet[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la recherche')
      }
      
      return result.data
    } catch (error) {
      console.error('Erreur API - searchPlanets:', error)
      throw new Error('Impossible d\'effectuer la recherche')
    }
  }

  // Obtenir les statistiques des planètes
  async getPlanetStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets/stats/overview`)
      const result: ApiResponse<any> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des statistiques')
      }
      
      return result.data
    } catch (error) {
      console.error('Erreur API - getPlanetStats:', error)
      throw new Error('Impossible de charger les statistiques')
    }
  }

  // Vérifier la santé de l'API
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      const result = await response.json()
      return result.status === 'OK'
    } catch (error) {
      console.error('Erreur API - healthCheck:', error)
      return false
    }
  }
}

export default new PlanetAPI()
