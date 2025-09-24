import type { Planet } from '../types/Planet'
import session from './session'

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
      const token = session.getAccessToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await fetch(`${API_BASE_URL}/planets`, {
        method: 'POST',
        headers,
        body: JSON.stringify(planetData)
      })
      
      const result: ApiResponse<Planet> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création de la planète')
      }
      
      return result.data
    } catch (error: any) {
      console.error('Erreur API - createPlanet:', error)
      const msg = error?.message ? `Impossible de créer la planète: ${error.message}` : 'Impossible de créer la planète'
      throw new Error(msg)
    }
  }

  // Mettre à jour une planète
  async updatePlanet(id: string, planetData: Partial<Planet>): Promise<Planet> {
    try {
      const token = session.getAccessToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await fetch(`${API_BASE_URL}/planets/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(planetData)
      })
      
      const result: ApiResponse<Planet> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour de la planète')
      }
      
      return result.data
    } catch (error: any) {
      console.error('Erreur API - updatePlanet:', error)
      const msg = error?.message ? `Impossible de mettre à jour la planète: ${error.message}` : 'Impossible de mettre à jour la planète'
      throw new Error(msg)
    }
  }

  // Supprimer une planète
  async deletePlanet(id: string): Promise<Planet> {
    try {
      const token = session.getAccessToken()
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await fetch(`${API_BASE_URL}/planets/${id}`, {
        method: 'DELETE',
        headers
      })
      
      const result: ApiResponse<Planet> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression de la planète')
      }
      
      return result.data
    } catch (error: any) {
      console.error('Erreur API - deletePlanet:', error)
      const msg = error?.message ? `Impossible de supprimer la planète: ${error.message}` : 'Impossible de supprimer la planète'
      throw new Error(msg)
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
