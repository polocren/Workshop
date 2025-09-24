<template>
  <div class="my-planets">
    <h1>Mes planètes</h1>

    <div v-if="loading" class="loading"><div class="spinner" />Chargement…</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && planets.length === 0" class="empty">Aucune planète pour le moment.</div>

    <div class="grid" v-if="!loading && planets.length">
      <div class="card" v-for="p in planets" :key="p.planet?.id">
        <img class="thumb" :src="p.planet?.image || '/images/planets/default.svg'" :alt="p.planet?.name" @error="onImgErr" />
        <div class="info">
          <h3>{{ p.planet?.name }}</h3>
          <small>Achetée le {{ formatDate(p.created_at) }}</small>
        </div>
        <div class="actions">
          <button class="btn" @click="viewInSpace(p.planet?.id)">Voir</button>
          <button class="btn" @click="gift(p.planet?.id)">Offrir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import purchaseAPI from '../services/purchaseAPI'
import session from '../services/session'
import toast from '../services/toast'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const planets = ref<any[]>([])

function onImgErr(e: Event) { (e.target as HTMLImageElement).src = '/images/planets/default.svg' }
function formatDate(s: string) { return new Date(s).toLocaleDateString() }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const t = session.getAccessToken()
    if (!t) throw new Error('Veuillez vous connecter')
    const res = await purchaseAPI.myPurchases(t)
    if (!res.success) throw new Error(res.error || 'Chargement impossible')
    planets.value = res.data || []
  } catch (e: any) {
    error.value = e.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

function viewInSpace(id?: string) {
  if (!id) return
  sessionStorage.setItem('selectedPlanetId', id)
  router.push('/')
}

async function gift(id?: string) {
  try {
    if (!id) return
    const email = window.prompt('Adresse e-mail du destinataire ?')
    if (!email) return
    const t = session.getAccessToken()
    if (!t) throw new Error('Veuillez vous connecter')
    const res = await purchaseAPI.giftPlanet(id, email, t)
    if (!res.success) throw new Error(res.error || 'Cadeau impossible')
    toast.success('Planète offerte !')
    await load()
  } catch (e: any) {
    toast.error(e.message || 'Cadeau impossible')
  }
}

onMounted(load)
</script>

<style scoped>
.my-planets { max-width: 1000px; margin: 0 auto; padding: 90px 16px 24px }
h1 { margin: 0 0 16px 0 }
.loading, .error, .empty { padding: 16px; }
.spinner { width:24px; height:24px; border:3px solid #fff3; border-top-color:#fff; border-radius:50%; animation:spin 1s linear infinite; display:inline-block; margin-right:8px }
@keyframes spin { to { transform: rotate(360deg) }}
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:16px }
.card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius:8px; overflow:hidden; display:flex; flex-direction:column }
.thumb { width:100%; height:160px; object-fit:cover; background:#111 }
.info { padding:12px 12px 4px 12px }
.info h3 { margin:0 0 6px 0 }
.actions { display:flex; gap:8px; padding: 8px 12px 12px 12px }
.btn { flex:1; padding:10px 12px; border:none; border-radius:6px; background: rgba(255,255,255,0.1); color:#fff; cursor:pointer }
.btn:hover { background: rgba(255,255,255,0.2) }
</style>

