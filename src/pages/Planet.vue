<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanetStore } from '../store/planets'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const planetStore = usePlanetStore()

const planet = computed(() => planetStore.planetById(props.id))
const cartIds = computed(() => planetStore.cartIds)
const isInCart = computed(() => (planet.value ? cartIds.value.includes(planet.value.id) : false))

const formattedPrice = computed(() => {
  if (!planet.value) return ''
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(planet.value.price)
})

const handlePurchase = () => {
  if (!planet.value) return

  if (isInCart.value) {
    alert('Cette planète est déjà dans votre panier cosmique. Finalisez votre conquête dans le panier !')
    router.push('/cart')
    return
  }

  const result = planetStore.addToCart(planet.value.id)
  if (!result?.success) {
    alert('Impossible de réserver cette planète pour le moment. Réessayez dans une autre constellation !')
    return
  }

  alert('Transaction enregistrée ! Votre planète sera emballée dans un ruban d’énergie quantique.')
  router.push('/cart')
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <section v-if="planet" class="space-y-8">
    <div class="flex items-center justify-between">
      <button class="btn-secondary" type="button" @click="goBack">← Retour au catalogue</button>
      <span class="sublabel">Fiche technique cosmique</span>
    </div>

    <article class="card grid gap-8 lg:grid-cols-[2fr,3fr]">
      <div class="relative overflow-hidden rounded-3xl border border-slate-700/50">
        <img
          :alt="`Illustration ${planet.name}`"
          :src="planet.image"
          class="h-72 w-full object-cover lg:h-full"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent" />
      </div>

      <div class="space-y-6">
        <header class="space-y-2">
          <span class="badge">{{ planet.category }}</span>
          <h1 class="text-4xl font-display font-semibold text-slate-50">{{ planet.name }}</h1>
          <p class="text-slate-300/90">{{ planet.shortDescription }}</p>
          <p class="text-2xl font-bold text-sky-200">{{ formattedPrice }}</p>
        </header>

        <p class="text-sm leading-relaxed text-slate-300/85">{{ planet.description }}</p>

        <dl class="grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 text-sm lg:grid-cols-2">
          <div>
            <dt class="sublabel">Diamètre approximatif</dt>
            <dd class="mt-1 text-slate-200">{{ planet.diameter }}</dd>
          </div>
          <div>
            <dt class="sublabel">Température moyenne</dt>
            <dd class="mt-1 text-slate-200">{{ planet.temperature }}</dd>
          </div>
          <div class="lg:col-span-2">
            <dt class="sublabel">Ressources farfelues</dt>
            <dd class="mt-2">
              <ul class="flex flex-wrap gap-2">
                <li
                  v-for="resource in planet.resources"
                  :key="resource"
                  class="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-widest text-indigo-100"
                >
                  {{ resource }}
                </li>
              </ul>
            </dd>
          </div>
        </dl>

        <button
          :class="['btn-primary w-full', isInCart ? 'cursor-not-allowed opacity-60' : '']"
          :disabled="isInCart"
          type="button"
          @click="handlePurchase"
        >
          {{ isInCart ? 'Déjà dans votre panier' : 'Acheter cette merveille' }}
        </button>
      </div>
    </article>
  </section>

  <section v-else class="surface-panel text-center">
    <p class="text-muted">Impossible de retrouver cette planète. Elle a peut-être glissé dans un trou de ver administratif.</p>
    <button class="btn-secondary mt-4" type="button" @click="goBack">Retour au catalogue</button>
  </section>
</template>
