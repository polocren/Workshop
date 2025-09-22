<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const mode = ref('login')
const form = reactive({
  email: '',
  password: '',
  alias: '',
})

const isLogin = computed(() => mode.value === 'login')
const error = computed(() => userStore.error)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const displayName = computed(() => userStore.displayName)

const submit = () => {
  if (isLogin.value) {
    const success = userStore.login({ email: form.email, password: form.password })
    if (success) router.push('/')
  } else {
    const success = userStore.register({ email: form.email, password: form.password, alias: form.alias })
    if (success) router.push('/')
  }
}

const toggleMode = () => {
  mode.value = isLogin.value ? 'register' : 'login'
  userStore.error = null
}

const logout = () => {
  userStore.logout()
}
</script>

<template>
  <section class="mx-auto max-w-xl space-y-8">
    <header class="text-center space-y-3">
      <p class="sublabel">Espace client</p>
      <h1 class="section-heading">
        {{ isLogin ? 'Connexion au portail' : 'Inscription cosmique' }}
      </h1>
      <p class="section-intro">
        Accédez à votre cockpit Bureau Planétaire™ pour suivre vos acquisitions et recevoir les certificats d’adoption
        intergalactiques.
      </p>
    </header>

    <div v-if="isLoggedIn" class="card space-y-5 text-center">
      <p class="text-slate-200">
        Bonjour <span class="font-semibold text-sky-200">{{ displayName }}</span> !
        Votre compte est prêt à signer des contrats planétaires farfelus.
      </p>
      <div class="flex justify-center gap-3">
        <button class="btn-primary" type="button" @click="router.push('/')">Voir le catalogue</button>
        <button class="btn-secondary" type="button" @click="logout">Se déconnecter</button>
      </div>
    </div>

    <form v-else class="card space-y-5" @submit.prevent="submit">
      <div v-if="error" class="rounded-2xl border border-rose-400/40 bg-rose-900/25 p-4 text-sm text-rose-100">
        {{ error }}
      </div>

      <label class="flex flex-col gap-2">
        <span class="sublabel">Adresse intergalactique (email)</span>
        <input
          v-model="form.email"
          class="input-field"
          placeholder="agent@bureau-planetaire.space"
          required
          type="email"
        />
      </label>

      <label v-if="!isLogin" class="flex flex-col gap-2">
        <span class="sublabel">Alias public</span>
        <input
          v-model="form.alias"
          class="input-field"
          placeholder="Inspecteur Zéphyr Turbo"
          type="text"
        />
      </label>

      <label class="flex flex-col gap-2">
        <span class="sublabel">Mot de passe (minimum 4 glyphes)</span>
        <input
          v-model="form.password"
          class="input-field"
          minlength="4"
          required
          type="password"
        />
      </label>

      <button class="btn-primary w-full" type="submit">
        {{ isLogin ? 'Se connecter' : 'Créer un compte cosmique' }}
      </button>

      <p class="text-center text-xs text-slate-400">
        {{
          isLogin
            ? 'Pas encore membre de la Fédération des Clients ?'
            : 'Déjà enregistré auprès de la Fédération ?'
        }}
        <button class="text-sky-300 underline" type="button" @click="toggleMode">
          {{ isLogin ? "Inscrivez-vous ici" : 'Connectez-vous' }}
        </button>
      </p>
    </form>
  </section>
</template>
