import { defineStore } from 'pinia'

const PLANETS_KEY = 'galactic-basket-planets'
const CART_KEY = 'galactic-basket-cart'

const hasWindow = () => typeof window !== 'undefined'

const save = (key, value) => {
  if (!hasWindow()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

const load = (key, fallback) => {
  if (!hasWindow()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn('[planets-store] Failed to read localStorage key', key, error)
    return fallback
  }
}

const createId = (name = '') => {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  const random = Math.random().toString(36).slice(2, 7)
  return `${slug || 'planete'}-${random}`
}

const clamp = (value, min = 0, max = 100) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return min
  return Math.min(Math.max(numeric, min), max)
}

const seededRandom = (seed) => {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 1000) / 1000
}

const generateFallbackMapPosition = (id = 'planet') => {
  const x = clamp(15 + seededRandom(`${id}-x`) * 70, 5, 95)
  const y = clamp(20 + seededRandom(`${id}-y`) * 60, 5, 95)
  return { x: Math.round(x), y: Math.round(y) }
}

const parseMapPositionCandidate = (input) => {
  if (!input) return null
  if (typeof input === 'string') {
    const [rawX, rawY] = input.split(/[;,\s]+/)
    if (rawX !== undefined && rawY !== undefined) {
      return { x: Number(rawX), y: Number(rawY) }
    }
    return null
  }
  if (Array.isArray(input)) {
    const [x, y] = input
    return { x, y }
  }
  if (typeof input === 'object' && input !== null) {
    return { x: input.x, y: input.y }
  }
  return null
}

const normalizeMapPosition = (input, id) => {
  const candidate = parseMapPositionCandidate(input)
  if (candidate) {
    return {
      x: clamp(candidate.x, 5, 95),
      y: clamp(candidate.y, 5, 95),
    }
  }
  return generateFallbackMapPosition(id)
}

const normalizeResources = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (item != null ? String(item).trim() : ''))
      .filter(Boolean)
  }

  if (!value) return []

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const sanitizePlanet = (planetLike) => {
  if (!planetLike) return null

  const baseName = planetLike.name ? String(planetLike.name).trim() : 'Planète anonyme'
  const id = planetLike.id || createId(baseName)

  return {
    id,
    name: baseName,
    price: Number.isFinite(Number(planetLike.price)) ? Number(planetLike.price) : 0,
    category: planetLike.category ? String(planetLike.category).trim() || 'Collection Mystère' : 'Collection Mystère',
    shortDescription: planetLike.shortDescription ? String(planetLike.shortDescription).trim() : '',
    description: planetLike.description ? String(planetLike.description).trim() : '',
    image: planetLike.image || 'https://robohash.org/default-planet.png?set=set3',
    diameter: planetLike.diameter || 'Inconnu',
    temperature: planetLike.temperature || 'Variable',
    resources: normalizeResources(planetLike.resources),
    mapPosition: normalizeMapPosition(planetLike.mapPosition, id),
  }
}

const sanitizePlanetCollection = (planets) => {
  const source = Array.isArray(planets) ? planets : []
  const sanitized = []
  let mutated = false

  source.forEach((planet) => {
    const clean = sanitizePlanet(planet)
    if (!clean) {
      mutated = true
      return
    }
    if (!mutated && JSON.stringify(clean) !== JSON.stringify(planet)) {
      mutated = true
    }
    sanitized.push(clean)
  })

  return { sanitized, mutated }
}

const sanitizeCartCollection = (cart, validIds) => {
  const list = Array.isArray(cart) ? cart : []
  const sanitized = []
  const seenIds = new Set()
  let mutated = false

  list.forEach((entry) => {
    const planetId = entry?.id
    if (!planetId || seenIds.has(planetId) || !validIds.has(planetId)) {
      mutated = true
      return
    }

    seenIds.add(planetId)
    const quantity = Number(entry.quantity)
    if (!Number.isFinite(quantity) || quantity !== 1) {
      mutated = true
    }

    sanitized.push({ id: planetId, quantity: 1 })
  })

  return { sanitized, mutated }
}

export const usePlanetStore = defineStore('planets', {
  state: () => ({
    planets: [],
    cart: [],
    initialized: false,
    loading: false,
    error: null,
  }),
  getters: {
    planetById: (state) => (id) => state.planets.find((planet) => planet.id === id),
    cartCount: (state) => state.cart.length,
    cartIds: (state) => state.cart.map((item) => item.id),
    categories: (state) => {
      const values = state.planets.map((planet) => planet.category).filter(Boolean)
      return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'fr'))
    },
    cartItemsDetailed(state) {
      return state.cart
        .map((item) => {
          const planet = state.planets.find((candidate) => candidate.id === item.id)
          if (!planet) return null
          const quantity = Math.max(Number(item.quantity) || 0, 1)
          const lineTotal = Number((planet.price * quantity).toFixed(2))
          return {
            ...planet,
            quantity,
            lineTotal,
          }
        })
        .filter(Boolean)
    },
    cartTotal() {
      return this.cartItemsDetailed.reduce((total, item) => total + item.lineTotal, 0)
    },
  },
  actions: {
    async init() {
      if (this.initialized || this.loading) return
      this.loading = true
      this.error = null

      const storedPlanets = load(PLANETS_KEY, null)
      const storedCart = load(CART_KEY, [])

      if (storedPlanets) {
        const { sanitized, mutated } = sanitizePlanetCollection(storedPlanets)
        this.planets = sanitized
        if (mutated) {
          save(PLANETS_KEY, sanitized)
        }
      } else {
        await this.loadFromPublic()
      }

      const validIds = new Set(this.planets.map((planet) => planet.id))
      const { sanitized: sanitizedCart, mutated: cartMutated } = sanitizeCartCollection(storedCart, validIds)
      this.cart = sanitizedCart
      if (cartMutated) {
        save(CART_KEY, this.cart)
      }

      this.loading = false
      this.initialized = true
    },
    async loadFromPublic() {
      try {
        const response = await fetch('/planets.json')
        if (!response.ok) throw new Error('Impossible de contacter le cosmos :(')
        const data = await response.json()
        const { sanitized } = sanitizePlanetCollection(data)
        this.planets = sanitized
        save(PLANETS_KEY, this.planets)
      } catch (error) {
        console.error('[planets-store] Failed fetching planets.json', error)
        this.error = 'Les transmissions galactiques sont brouillées. Réessayez plus tard.'
      }
    },
    addPlanet(payload) {
      const planetDraft = {
        id: payload.id || createId(payload.name),
        ...payload,
      }
      const planet = sanitizePlanet(planetDraft)
      this.planets.push(planet)
      save(PLANETS_KEY, this.planets)
      return planet
    },
    updatePlanet(id, payload) {
      const index = this.planets.findIndex((planet) => planet.id === id)
      if (index === -1) return null

      const updatedDraft = {
        ...this.planets[index],
        ...payload,
        id,
      }
      const updatedPlanet = sanitizePlanet(updatedDraft)
      this.planets.splice(index, 1, updatedPlanet)
      save(PLANETS_KEY, this.planets)
      return updatedPlanet
    },
    removePlanet(id) {
      this.planets = this.planets.filter((planet) => planet.id !== id)
      this.cart = this.cart.filter((item) => item.id !== id)
      save(PLANETS_KEY, this.planets)
      save(CART_KEY, this.cart)
    },
    addToCart(id) {
      const planet = this.planetById(id)
      if (!planet) {
        return { success: false, reason: 'missing' }
      }

      if (this.cart.some((item) => item.id === id)) {
        return { success: false, reason: 'duplicate' }
      }

      this.cart.push({ id, quantity: 1 })
      save(CART_KEY, this.cart)
      return { success: true }
    },
    removeFromCart(id) {
      this.cart = this.cart.filter((item) => item.id !== id)
      save(CART_KEY, this.cart)
    },
    decrementFromCart(id) {
      const existing = this.cart.find((item) => item.id === id)
      if (!existing) return

      existing.quantity -= 1
      if (existing.quantity <= 0) {
        this.removeFromCart(id)
      } else {
        existing.quantity = 1
        save(CART_KEY, this.cart)
      }
    },
    clearCart() {
      this.cart = []
      save(CART_KEY, this.cart)
    },
    resetAll() {
      this.planets = []
      this.cart = []
      this.initialized = false
      save(PLANETS_KEY, this.planets)
      save(CART_KEY, this.cart)
    },
  },
})
