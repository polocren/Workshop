<template>
  <div class="cart-page">
    <div class="card">
      <h2>Panier</h2>
      <p v-if="items.length===0" class="muted">Votre panier est vide.</p>

      <div v-else class="list">
        <div v-for="it in items" :key="it.planet.id" class="row">
          <img :src="it.planet.image || '/images/planets/default.svg'" :alt="it.planet.name" loading="lazy" />
          <div class="grow">
            <div class="name">{{ it.planet.name }}</div>
            <div class="meta">{{ it.planet.type }}</div>
          </div>
          <div class="price">{{ price(it.planet.price) }}</div>
          <button class="btn-remove" @click="remove(it.planet.id)">Retirer</button>
        </div>
      </div>

      <div v-if="items.length>0" class="summary">
        <div class="total">Total: {{ price(total) }}</div>
        <div class="actions">
          <button class="btn-secondary" @click="clear">Vider</button>
          <button class="btn-primary" :disabled="loading" @click="checkout">Valider l'achat</button>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">Félicitations, votre achat est confirmé !</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import cart from '../services/cart'
import session from '../services/session'
import purchaseAPI from '../services/purchaseAPI'
import toast from '../services/toast'

const items = cart.items
const total = computed(() => cart.total.value)
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

function price(v: any) { return `${Number(v ?? 0).toFixed(2)} ¤` }
function remove(id: string) { cart.remove(id) }
function clear() { cart.clear() }

async function checkout() {
  error.value = null
  success.value = false
  try {
    const token = session.getAccessToken()
    if (!token) throw new Error('Veuillez vous connecter pour valider le panier')
    const ids = cart.ids()
    if (ids.length === 0) return
    loading.value = true
    const res = await purchaseAPI.checkout(ids, token)
    if (!res.success) throw new Error(res.error || 'Echec du paiement (factice)')
    const okCount = res.data?.purchases?.length || 0
    if (!okCount) throw new Error('Aucun achat validé (déjà vendues ?)')
    success.value = true
    cart.clear()
    toast.success('Achat confirmé !')
  } catch (e: any) {
    error.value = e.message || 'Une erreur est survenue'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cart-page { min-height: 100vh; padding: 100px 16px 40px; display:flex; justify-content:center }
.card { width:100%; max-width: 900px; color:#fff; padding:24px; border-radius:16px;
        background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: 0 12px 40px rgba(0,0,0,0.35); backdrop-filter: blur(10px);
}
.muted { color:#b0bec5 }
.list { margin-top: 12px }
.row { display:flex; align-items:center; gap:12px; padding:12px 8px; border-bottom: 1px solid rgba(255,255,255,0.08) }
.row img { width:48px; height:48px; object-fit:cover; border-radius:50%; background:#000 }
.grow { flex:1 }
.name { font-weight:800 }
.meta { color:#9fb3c8; font-size:.85rem }
.price { font-weight:700; margin-right: 12px }
.btn-remove { background: transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:8px; padding:8px 12px; cursor:pointer }
.btn-remove:hover { background: rgba(255,255,255,0.08) }
.summary { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-top: 12px }
.total { font-size: 1.1rem; font-weight:800 }
.actions { display:flex; gap:10px }
.btn-secondary { padding: 10px 12px; background: transparent; border:1px solid rgba(255,255,255,0.25); color:#fff; border-radius:10px; cursor:pointer }
.btn-primary { padding: 10px 14px; border:none; border-radius:10px; cursor:pointer; color:#0a0a0a; font-weight:800; background: linear-gradient(135deg, #78ffd6 0%, #a8ff78 100%) }
.error { color:#FF6B6B }
.success { color:#8BC34A }
.success a { color:#78ffd6; text-decoration: underline }
</style>
