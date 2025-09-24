const supabaseConfig = require('../config/supabase')
const { createClient } = require('@supabase/supabase-js')

class AuthService {
  constructor() {
    this.supabase = supabaseConfig.getClient()
    this.url = process.env.SUPABASE_URL
    this.serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    this.instant = process.env.ALLOW_INSTANT_SIGNUP === 'true'
    this.appUrl = process.env.APP_URL || process.env.VITE_SITE_URL || 'http://localhost:5173'
    this.admin = this.serviceKey && this.url
      ? createClient(this.url, this.serviceKey)
      : null
  }

  async signUp({ email, password }) {
    // Option A: création instantanée (email confirmé) via service role
    if (this.instant && this.admin) {
      const { data: created, error: createErr } = await this.admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      if (createErr) throw new Error(createErr.message)
      // Créer une session immédiatement
      const { data: sessionData, error: signInErr } = await this.supabase.auth.signInWithPassword({ email, password })
      if (signInErr) throw new Error(signInErr.message)
      return sessionData
    }

    // Option B: flow standard (peut nécessiter confirmation email)
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${this.appUrl}/login`
      }
    })
    if (error) throw new Error(error.message)
    return data
  }

  async signIn({ email, password }) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return data
  }

  async getUserFromToken(accessToken) {
    const { data, error } = await this.supabase.auth.getUser(accessToken)
    if (error) throw new Error(error.message)
    return data.user
  }
}

module.exports = new AuthService()
