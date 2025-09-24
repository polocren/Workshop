import * as THREE from 'three'

// Types pour les planètes
export interface Planet {
  id: string
  name: string
  type: string
  distance: string
  diameter: string
  description: string
  position: THREE.Vector3 | { x: number, y: number, z: number }
  mesh?: THREE.Mesh
  color: number | string
  size: number
  image: string
  discoveryDate?: string | null
  moons?: number
  orbitalPeriod?: string | null
  temperature?: string
  composition?: string
  // Champs e-commerce (optionnels)
  price?: number
  isAvailable?: boolean
  ownerId?: string | null
}
