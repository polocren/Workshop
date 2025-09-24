<template>
  <div class="auth-2col">
    <div class="visual">
      <div class="brand">SpaceShop</div>
      <router-link to="/" class="back-btn">Retour au site →</router-link>
      <div class="visual-caption">
        <h3>Explore • Achète • Collectionne</h3>
        <p>Entrez dans la galaxie SpaceShop.</p>
      </div>
    </div>

    <div class="form glass">
      <h2>Connexion</h2>
      <p class="subtitle">Déjà client de l'univers ? Bienvenue.</p>

      <form @submit.prevent="onSubmit" class="form-grid">
        <label>Email</label>
        <input v-model="email" type="email" required placeholder="ton@email.com" />

        <label>Mot de passe</label>
        <input v-model="password" type="password" required placeholder="••••••••" />

        <button :disabled="loading" class="btn btn-primary submit">
          <span v-if="!loading">Se connecter</span>
          <span v-else>Connexion…</span>
        </button>

        <p v-if="error" class="error">{{ error }}</p>
        <p class="hint">Pas de compte ? <router-link to="/signup">Créer un compte</router-link></p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authAPI from '../services/authAPI'
import session from '../services/session'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const router = useRouter()


async function onSubmit() {
  loading.value = true
  error.value = null
  try {
    const res = await authAPI.login(email.value, password.value)
    if (!res.success) throw new Error(res.error || 'Login échoué')
    const access = res.data?.session?.access_token
    if (!access) throw new Error('Token manquant')
    session.setAccessToken(access)
    router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Login échoué'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-2col { min-height:100vh; padding: 90px 16px 24px; display:grid; grid-template-columns: 1.2fr 1fr; gap:22px }
.visual { position:relative; border-radius:18px; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,.35) }
.visual::before{ content:''; position:absolute; inset:0; background:
  linear-gradient(135deg, rgba(11,15,26,.5), rgba(11,15,26,.2)),
  url('https://static.nationalgeographic.fr/files/styles/image_3200/public/1086_0.jpg?w=1600&h=1201') center/cover no-repeat;
  filter: saturate(1.08);} 
.visual::after{ content:''; position:absolute; inset:0; background-image:
  radial-gradient(2px 2px at 20% 30%, #fff3 40%, transparent 41%),
  radial-gradient(2px 2px at 60% 70%, #fff3 40%, transparent 41%),
  radial-gradient(2px 2px at 80% 20%, #fff3 40%, transparent 41%),
  radial-gradient(2px 2px at 30% 80%, #fff3 40%, transparent 41%);
  animation: twinkle 6s linear infinite; }

.brand { position:absolute; top:14px; left:16px; font-weight:800; letter-spacing:.6px; color:#fff; z-index:2 }
.back-btn { position:absolute; top:14px; right:16px; z-index:2; padding:8px 12px; border-radius:999px; background: rgba(255,255,255,.12); color:#fff; text-decoration:none; backdrop-filter: blur(6px); border:1px solid rgba(255,255,255,.2) }
.back-btn:hover { background: rgba(255,255,255,.18) }
.visual-caption { position:absolute; bottom:24px; left:24px; right:24px; color:#fff; z-index:2 }
.visual-caption h3 { margin:0 0 6px 0; font-size:1.6rem; font-weight:800 }
.visual-caption p { margin:0 0 10px 0; opacity:.9 }


.form { padding: 28px; border-radius:18px; border:1px solid var(--panel-border); background: var(--panel) }
h2 { margin: 0 0 6px 0; font-weight: 800; letter-spacing: .3px }
.subtitle { margin: 0 0 18px 0; color: var(--muted) }
.form-grid { display:flex; flex-direction:column; gap:12px }
label { font-size: 0.85rem; color: #9fb3c8; letter-spacing:.4px; text-transform:uppercase }
input { padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.18); background: rgba(0,0,0,0.35); color: #fff }
input::placeholder { color: rgba(255,255,255,0.6) }
.submit { margin-top: 6px }
.btn:disabled { opacity: .6; cursor: default }
.error { color: #FF6B6B; margin-top: 8px }
.hint { margin-top: 6px; color:#b0bec5 }
.hint a { color: #78ffd6; font-weight:700 }

@media (max-width: 980px) {
  .auth-2col { grid-template-columns: 1fr; }
  .visual { min-height: 300px }
}
@keyframes twinkle { to { transform: translate3d(0,-10px,0) } }
</style>
