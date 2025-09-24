// Middleware pour vérifier le token Supabase (Bearer)
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token manquant' })
    }

    // Charger Supabase seulement si nécessaire
    const supabaseConfig = require('../config/supabase')
    const client = supabaseConfig.getClient()
    const { data, error } = await client.auth.getUser(token)
    if (error || !data?.user) {
      return res.status(401).json({ success: false, error: 'Token invalide' })
    }

    req.user = data.user
    next()
  } catch (err) {
    console.error('Erreur auth middleware:', err)
    return res.status(401).json({ success: false, error: 'Authentification requise' })
  }
}

module.exports = { requireAuth }
