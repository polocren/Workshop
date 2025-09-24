const fs = require('fs/promises')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const DATA_PATH = path.join(__dirname, '..', 'data', 'planets.json')

async function loadPlanets() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed.planets) ? parsed.planets : []
  } catch (err) {
    if (err.code === 'ENOENT') {
      return []
    }
    throw err
  }
}

async function savePlanets(planets) {
  const data = { planets }
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
}

class PlanetService {
  async getAllPlanets() {
    const planets = await loadPlanets()
    return planets
  }

  async getPlanetById(id) {
    const planets = await loadPlanets()
    const planet = planets.find(p => String(p.id) === String(id))
    if (!planet) {
      throw new Error('Planète non trouvée')
    }
    return planet
  }

  async createPlanet(planetData) {
    const planets = await loadPlanets()

    const exists = planets.find(
      p => (p.name || '').trim().toLowerCase() === (planetData.name || '').trim().toLowerCase()
    )
    if (exists) {
      throw new Error('Une planète avec ce nom existe déjà')
    }

    const newPlanet = {
      id: uuidv4(),
      name: planetData.name,
      type: planetData.type,
      distance: planetData.distance ?? null,
      diameter: planetData.diameter ?? null,
      description: planetData.description ?? null,
      position: {
        x: planetData.position?.x ?? 0,
        y: planetData.position?.y ?? 0,
        z: planetData.position?.z ?? 0,
      },
      color: planetData.color ?? null,
      size: planetData.size ?? 1,
      image: planetData.image ?? null,
      discoveryDate: planetData.discoveryDate ?? null,
      moons: planetData.moons ?? 0,
      orbitalPeriod: planetData.orbitalPeriod ?? null,
      temperature: planetData.temperature ?? null,
      composition: planetData.composition ?? null,
    }

    planets.push(newPlanet)
    await savePlanets(planets)
    return newPlanet
  }

  async updatePlanet(id, updateData) {
    const planets = await loadPlanets()
    const idx = planets.findIndex(p => String(p.id) === String(id))
    if (idx === -1) {
      throw new Error('Planète non trouvée')
    }

    if (updateData.name) {
      const duplicate = planets.find(
        p => (p.name || '').trim().toLowerCase() === updateData.name.trim().toLowerCase() && String(p.id) !== String(id)
      )
      if (duplicate) {
        throw new Error('Une planète avec ce nom existe déjà')
      }
    }

    const current = planets[idx]
    const updated = {
      ...current,
      ...updateData,
      position: {
        x: updateData.position?.x ?? current.position?.x ?? 0,
        y: updateData.position?.y ?? current.position?.y ?? 0,
        z: updateData.position?.z ?? current.position?.z ?? 0,
      },
    }

    planets[idx] = updated
    await savePlanets(planets)
    return updated
  }

  async deletePlanet(id) {
    const planets = await loadPlanets()
    const idx = planets.findIndex(p => String(p.id) === String(id))
    if (idx === -1) {
      throw new Error('Planète non trouvée')
    }
    const removed = planets[idx]
    planets.splice(idx, 1)
    await savePlanets(planets)
    return removed
  }

  async searchPlanets(query) {
    const planets = await loadPlanets()
    if (!query) return planets
    const q = query.trim().toLowerCase()
    return planets.filter(p =>
      (p.name || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q)
    )
  }

  async testConnection() {
    try {
      await loadPlanets()
      return true
    } catch (_e) {
      return false
    }
  }
}

module.exports = new PlanetService()

