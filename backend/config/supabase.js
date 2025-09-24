const { createClient } = require('@supabase/supabase-js');

class SupabaseConfig {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Variables d\'environnement Supabase manquantes. Vérifiez SUPABASE_URL et SUPABASE_ANON_KEY dans .env');
    }
    
    this.client = createClient(this.supabaseUrl, this.supabaseKey);
  }
  
  getClient() {
    return this.client;
  }
  
  // Test de connexion
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from('planets')
        .select('id')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      console.log('Connexion Supabase réussie');
      return true;
    } catch (error) {
      console.error('Erreur de connexion Supabase:', error.message);
      return false;
    }
  }
}

module.exports = new SupabaseConfig();
