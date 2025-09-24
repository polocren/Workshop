const supabaseConfig = require('../config/supabase')
const { createClient } = require('@supabase/supabase-js')

class PurchaseService {
  constructor() {
    this.supabase = supabaseConfig.getClient()
    const url = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    this.admin = url && serviceKey ? createClient(url, serviceKey) : null
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

  async giftPlanet({ planetId, fromUserId, recipientEmail, allowAdminBypass = true }) {
    if (!this.admin) throw new Error('Le cadeau nécessite SUPABASE_SERVICE_ROLE_KEY')
    const email = String(recipientEmail || '').trim().toLowerCase()
    if (!email) throw new Error('Email destinataire requis')

    // Charger planète
    const { data: planets, error: loadErr } = await this.supabase
      .from('planets').select('*').eq('id', planetId).limit(1)
    if (loadErr) throw new Error(loadErr.message)
    const planet = planets && planets[0]
    if (!planet) throw new Error('Planète non trouvée')

    // Vérifier propriétaire ou admin email
    let canGift = planet.owner_id === fromUserId
    if (!canGift && allowAdminBypass) {
      // Vérifier si l'expéditeur est admin (par email)
      const { data: me, error: meErr } = await this.admin
        .from('auth.users').select('id,email').eq('id', fromUserId).limit(1)
      if (meErr) throw new Error(meErr.message)
      const myUser = me && me[0]
      const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase()
      if (myUser && myUser.email && myUser.email.toLowerCase() === adminEmail) {
        canGift = true
      }
    }
    if (!canGift) throw new Error('Vous n\'êtes pas propriétaire de cette planète')

    // Récupérer ou créer le destinataire
    let recipientId = null
    const { data: found, error: fErr } = await this.admin
      .from('auth.users').select('id,email').eq('email', email).limit(1)
    if (fErr) throw new Error(fErr.message)
    if (found && found[0]) {
      recipientId = found[0].id
    } else {
      // créer un compte invité (non confirmé), et/ou envoyer une invitation
      const { data: invited, error: iErr } = await this.admin.auth.admin.inviteUserByEmail(email)
      if (iErr) throw new Error(iErr.message)
      recipientId = invited?.user?.id
      if (!recipientId) throw new Error('Création du destinataire échouée')
    }

    // Insérer une "purchase" de transfert à 0
    const { data: purchase, error: perr } = await this.supabase
      .from('purchases').insert([{ planet_id: planetId, buyer_id: recipientId, price: 0 }]).select().single()
    if (perr) throw new Error(perr.message)

    // Mettre à jour le propriétaire
    const { data: updated, error: uerr } = await this.supabase
      .from('planets').update({ owner_id: recipientId, is_available: false }).eq('id', planetId).select().single()
    if (uerr) throw new Error(uerr.message)

    return { purchase, planet: updated, recipientId }
  }
}

module.exports = new PurchaseService()
