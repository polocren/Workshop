const supabaseConfig = require('../config/supabase')

class PurchaseService {
  constructor() {
    this.supabase = supabaseConfig.getClient()
  }

  async buyPlanet({ planetId, buyerId }) {
    // 1) Charger la planète
    const { data: planets, error: loadErr } = await this.supabase
      .from('planets')
      .select('*')
      .eq('id', planetId)
      .limit(1)

    if (loadErr) throw new Error(loadErr.message)
    const planet = planets && planets[0]
    if (!planet) throw new Error('Planète non trouvée')

    const isAvailable = planet.is_available !== false // défaut: true si colonne absente
    if (!isAvailable) throw new Error('Planète déjà vendue')

    const price = planet.price ?? 0

    // 2) Créer l'achat
    const { data: purchase, error: purchaseErr } = await this.supabase
      .from('purchases')
      .insert([{ planet_id: planetId, buyer_id: buyerId, price }])
      .select()
      .single()

    if (purchaseErr) throw new Error(purchaseErr.message)

    // 3) Marquer la planète comme vendue
    const { data: updatedPlanet, error: updateErr } = await this.supabase
      .from('planets')
      .update({ is_available: false, owner_id: buyerId })
      .eq('id', planetId)
      .select()
      .single()

    if (updateErr) throw new Error(updateErr.message)

    return { purchase, planet: updatedPlanet }
  }

  async getMyPurchases(userId) {
    const { data, error } = await this.supabase
      .from('purchases')
      .select('id, price, created_at, planet:planets(id,name,image)')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  }
}

module.exports = new PurchaseService()

