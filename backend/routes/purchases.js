const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const unifiedPlanetService = require('../services/unifiedPlanetService')
const certificateService = require('../services/certificateService')

// Interdit si pas Supabase
router.use((req, res, next) => {
  if (unifiedPlanetService.getDatabaseType() !== 'supabase') {
    return res.status(501).json({ success: false, error: 'Achats disponibles uniquement avec Supabase' })
  }
  next()
})

// Acheter une planète
router.post('/', requireAuth, async (req, res) => {
  try {
    const purchaseService = require('../services/purchaseService')
    const { planetId } = req.body
    if (!planetId) return res.status(400).json({ success: false, error: 'planetId requis' })
    const result = await purchaseService.buyPlanet({ planetId, buyerId: req.user.id })
    res.status(201).json({ success: true, data: result, certificateUrl: `/api/purchases/certificate/${result.purchase.id}` })
  } catch (err) {
    const message = err.message || 'Erreur lors de l\'achat'
    const status = message.includes('déjà vendue') ? 409 : message.includes('non trouvée') ? 404 : 400
    res.status(status).json({ success: false, error: message })
  }
})

// Offrir une planète (par email)
router.post('/gift', requireAuth, async (req, res) => {
  try {
    const { planetId, email } = req.body || {}
    if (!planetId || !email) return res.status(400).json({ success: false, error: 'planetId et email requis' })
    const purchaseService = require('../services/purchaseService')
    const result = await purchaseService.giftPlanet({ planetId, fromUserId: req.user.id, recipientEmail: email })
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    const message = err.message || 'Erreur lors du cadeau'
    const status = message.includes('propriétaire') ? 403 : message.includes('Service') ? 500 : 400
    res.status(status).json({ success: false, error: message })
  }
})

// Checkout panier (plusieurs planètes)
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { planetIds } = req.body || {}
    if (!Array.isArray(planetIds) || planetIds.length === 0) {
      return res.status(400).json({ success: false, error: 'planetIds doit être une liste non vide' })
    }
    const purchaseService = require('../services/purchaseService')
    const results = []
    for (const pid of planetIds) {
      try {
        const r = await purchaseService.buyPlanet({ planetId: pid, buyerId: req.user.id })
        results.push(r)
      } catch (_e) {
        // ignore per-item error
      }
    }
    if (results.length === 0) {
      return res.status(409).json({ success: false, error: 'Aucun achat validé (déjà vendues ?)' })
    }
    const purchaseIds = results.map(r => r.purchase.id)
    const url = `/api/purchases/certificate?ids=${purchaseIds.join(',')}`
    res.json({ success: true, data: { purchases: results }, certificateUrl: url })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Certificat PDF d'un achat
router.get('/certificate/:purchaseId', requireAuth, async (req, res) => {
  try {
    const supabase = require('../config/supabase').getClient()
    const purchaseId = req.params.purchaseId
    const { data: purchases, error: perr } = await supabase
      .from('purchases').select('*').eq('id', purchaseId).limit(1)
    if (perr) throw new Error(perr.message)
    const purchase = purchases && purchases[0]
    if (!purchase) return res.status(404).json({ success: false, error: 'Achat introuvable' })
    if (purchase.buyer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Accès refusé' })

    const { data: planets, error: plerr } = await supabase
      .from('planets').select('*').eq('id', purchase.planet_id).limit(1)
    if (plerr) throw new Error(plerr.message)
    const planet = planets && planets[0]
    if (!planet) return res.status(404).json({ success: false, error: 'Planète introuvable' })

    await certificateService.certificateForPurchase(res, { user: req.user, planet, purchase })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Certificat PDF batch (?ids=a,b,c)
router.get('/certificate', requireAuth, async (req, res) => {
  try {
    const ids = String(req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean)
    if (ids.length === 0) return res.status(400).json({ success: false, error: 'Paramètre ids requis' })
    const supabase = require('../config/supabase').getClient()
    const { data: purchases, error: perr } = await supabase
      .from('purchases').select('*').in('id', ids).eq('buyer_id', req.user.id)
    if (perr) throw new Error(perr.message)
    if (!purchases || purchases.length === 0) return res.status(404).json({ success: false, error: 'Aucun achat trouvé' })

    const planetIds = [...new Set(purchases.map(p => p.planet_id))]
    const { data: planets, error: plerr } = await supabase
      .from('planets').select('*').in('id', planetIds)
    if (plerr) throw new Error(plerr.message)

    const items = purchases.map(p => ({ purchase: p, planet: planets.find(pl => pl.id === p.planet_id) }))
    await certificateService.certificateForBatch(res, { user: req.user, items })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Mes achats
router.get('/my', requireAuth, async (req, res) => {
  try {
    const purchaseService = require('../services/purchaseService')
    const data = await purchaseService.getMyPurchases(req.user.id)
    res.json({ success: true, data })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

module.exports = router
