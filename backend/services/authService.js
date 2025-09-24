const supabaseConfig = require('../config/supabase')

class AuthService {
  constructor() {
    this.supabase = supabaseConfig.getClient()
  }

  async signUp({ email, password }) {
    const { data, error } = await this.supabase.auth.signUp({ email, password })
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

