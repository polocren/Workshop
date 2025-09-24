// Reset e-commerce flags to re-test purchases (development helper)
// Usage: node scripts/reset-supabase.js

const path = require('path')
// Ensure .env is loaded when running directly with `node`
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabase = require('../config/supabase').getClient()

async function reset() {
  console.log('Reset achats: planets.is_available=true, owner_id=NULL, purge purchases')
  const { error: delErr } = await supabase.from('purchases').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) {
    console.error('Erreur suppression purchases:', delErr.message)
    process.exit(1)
  }
  const { error: updErr } = await supabase.from('planets').update({ is_available: true, owner_id: null }).neq('id', '00000000-0000-0000-0000-000000000000')
  if (updErr) {
    console.error('Erreur mise à jour planets:', updErr.message)
    process.exit(1)
  }
  console.log('✅ Reset terminé')
}

reset()
  .catch(e => { console.error(e); process.exit(1) })
