const express = require('express')
const router = express.Router()
const unifiedPlanetService = require('../services/unifiedPlanetService')

// Interdit si pas Supabase
router.use((req, res, next) => {
  if (unifiedPlanetService.getDatabaseType() !== 'supabase') {
    return res.status(501).json({ success: false, error: 'Auth disponible uniquement avec Supabase' })
  }
  next()
})

router.post('/signup', async (req, res) => {
  try {
    const authService = require('../services/authService')
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, error: 'email et password requis' })
    const data = await authService.signUp({ email, password })
    res.json({ success: true, data })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const authService = require('../services/authService')
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, error: 'email et password requis' })
    const data = await authService.signIn({ email, password })
    res.json({ success: true, data })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.get('/me', async (req, res) => {
  try {
    const authService = require('../services/authService')
    const authHeader = req.headers['authorization'] || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return res.status(401).json({ success: false, error: 'Token manquant' })
    const user = await authService.getUserFromToken(token)
    res.json({ success: true, data: user })
  } catch (err) {
    res.status(401).json({ success: false, error: err.message })
  }
})

module.exports = router
