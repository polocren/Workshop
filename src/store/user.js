import { defineStore } from 'pinia'

const USERS_KEY = 'galactic-basket-users'
const CURRENT_USER_KEY = 'galactic-basket-current-user'

const hasWindow = () => typeof window !== 'undefined'

const load = (key, fallback) => {
  if (!hasWindow()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn('[user-store] Failed to parse localStorage key', key, error)
    return fallback
  }
}

const save = (key, value) => {
  if (!hasWindow()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

const generateId = () => {
  if (hasWindow() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    users: [],
    initialized: false,
    error: null,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.currentUser),
    displayName: (state) => state.currentUser?.alias || state.currentUser?.email,
  },
  actions: {
    init() {
      if (this.initialized) return
      this.users = load(USERS_KEY, [])
      this.currentUser = load(CURRENT_USER_KEY, null)
      this.initialized = true
    },
    register({ email, password, alias }) {
      this.error = null
      if (!email || !password) {
        this.error = 'Même les courtiers lunaires ont besoin d’un email et d’un mot de passe.'
        return false
      }

      const normalizedEmail = email.trim().toLowerCase()
      const aliasName = alias?.trim() || normalizedEmail.split('@')[0]

      if (this.users.some((user) => user.email === normalizedEmail)) {
        this.error = 'Un être cosmique utilise déjà cet email.'
        return false
      }

      const user = {
        id: generateId(),
        email: normalizedEmail,
        alias: aliasName,
        password: password.trim(),
      }

      this.users.push(user)
      save(USERS_KEY, this.users)
      this.currentUser = { id: user.id, email: user.email, alias: user.alias }
      save(CURRENT_USER_KEY, this.currentUser)
      return true
    },
    login({ email, password }) {
      this.error = null
      const normalizedEmail = email?.trim().toLowerCase()
      const passwordInput = password?.trim()

      const user = this.users.find(
        (candidate) => candidate.email === normalizedEmail && candidate.password === passwordInput,
      )

      if (!user) {
        this.error = 'Identifiants introuvables dans le multivers connu.'
        return false
      }

      this.currentUser = { id: user.id, email: user.email, alias: user.alias }
      save(CURRENT_USER_KEY, this.currentUser)
      return true
    },
    logout() {
      this.currentUser = null
      save(CURRENT_USER_KEY, this.currentUser)
    },
    clearAll() {
      this.users = []
      this.currentUser = null
      save(USERS_KEY, this.users)
      save(CURRENT_USER_KEY, this.currentUser)
    },
  },
})
