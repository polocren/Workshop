<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { usePlanetStore } from './store/planets'
import { useUserStore } from './store/user'

const planetStore = usePlanetStore()
const userStore = useUserStore()

onMounted(() => {
  planetStore.init()
  userStore.init()
})

const cartCount = computed(() => planetStore.cartCount)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const displayName = computed(() => userStore.displayName)

const logout = () => {
  userStore.logout()
}
</script>

<template>
  <div class="app-shell min-h-screen text-slate-100">
    <div class="app-backdrop"></div>

    <header class="app-header">
      <nav class="nav-bar">
        <RouterLink class="brand" to="/">
          <span class="brand-logo">Bureau Planétaire™</span>
          <span class="brand-sub">Boutique de mondes absurdes</span>
        </RouterLink>

        <div class="nav-actions">
          <RouterLink class="nav-pill" to="/">Catalogue</RouterLink>
          <RouterLink class="nav-pill" to="/cart">
            Panier
            <span v-if="cartCount" class="nav-count">{{ cartCount }}</span>
          </RouterLink>

          <RouterLink v-if="!isLoggedIn" class="nav-pill" to="/login">Espace client</RouterLink>
          <div v-else class="nav-user">
            <span class="nav-user-label">Bienvenue {{ displayName }}</span>
            <button class="nav-pill" type="button" @click="logout">Déconnexion</button>
          </div>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      © {{ new Date().getFullYear() }} Bureau Planétaire™ — Une filiale très sérieuse du Département des Nébuleuses Loufoques.
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  background: radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.16), transparent 45%),
    radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.16), transparent 50%),
    linear-gradient(180deg, #020617 0%, #01030f 60%, #000109 100%);
  overflow: hidden;
}

.app-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% -20%, rgba(251, 191, 36, 0.25), transparent 55%),
    radial-gradient(circle at 10% 70%, rgba(56, 189, 248, 0.12), transparent 55%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.15), transparent 50%);
  pointer-events: none;
  opacity: 0.7;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(2, 6, 23, 0.82);
  backdrop-filter: blur(18px);
}

.nav-bar {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
}

@media (min-width: 640px) {
  .nav-bar {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-decoration: none;
}

.brand-logo {
  font-size: 0.78rem;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: rgba(191, 219, 254, 0.85);
}

.brand-sub {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(99, 102, 241, 0.35);
  background: rgba(15, 23, 42, 0.7);
  color: rgba(226, 232, 240, 0.88);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: border 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.nav-pill:hover {
  border-color: rgba(191, 219, 254, 0.7);
  color: #f8fafc;
  background: rgba(30, 41, 59, 0.9);
}

.nav-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.9), rgba(139, 92, 246, 0.88));
  color: #050505;
  font-weight: 700;
  font-size: 0.75rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.nav-user-label {
  font-size: 0.65rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
}

.app-main {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  z-index: 5;
}

.app-footer {
  position: relative;
  border-top: 1px solid rgba(96, 165, 250, 0.18);
  background: rgba(2, 6, 23, 0.9);
  text-align: center;
  font-size: 0.75rem;
  padding: 1.5rem 1rem 2rem;
  color: rgba(148, 163, 184, 0.75);
  backdrop-filter: blur(14px);
}
</style>
