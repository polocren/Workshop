const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'

export default {
  async buyPlanet(planetId: string, accessToken: string) {
    const res = await fetch(`${API_BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ planetId })
    })
    return res.json()
  },

  async myPurchases(accessToken: string) {
    const res = await fetch(`${API_BASE_URL}/purchases/my`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    return res.json()
  },

  async giftPlanet(planetId: string, email: string, accessToken: string) {
    const res = await fetch(`${API_BASE_URL}/purchases/gift`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ planetId, email })
    })
    return res.json()
  },

  async checkout(planetIds: string[], accessToken: string) {
    const res = await fetch(`${API_BASE_URL}/purchases/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ planetIds })
    })
    return res.json()
  }
}
