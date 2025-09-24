const supabaseConfig = require('../config/supabase')

// Middleware: require a valid user token and match ADMIN_EMAIL
async function requireAdmin(req, res, next) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      return res.status(500).json({ success: false, error: 'ADMIN_EMAIL manquant sur le serveur' })
    }

    const authHeader = req.headers['authorization'] || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return res.status(401).json({ success: false, error: 'Token manquant' })

    const client = supabaseConfig.getClient()
    const { data, error } = await client.auth.getUser(token)
    if (error || !data?.user) {
      return res.status(401).json({ success: false, error: 'Token invalide' })
    }

    const email = data.user.email
    if (email && email.toLowerCase() === adminEmail.toLowerCase()) {
      req.user = data.user
      return next()
    }

    return res.status(403).json({ success: false, error: 'Accès administrateur requis' })
  } catch (err) {
    console.error('Erreur requireAdmin:', err)
    return res.status(401).json({ success: false, error: 'Authentification requise' })
  }
}

module.exports = { requireAdmin }

