<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import SolarSystem from '../components/SolarSystem.vue'
import { usePlanetStore } from '../store/planets'

const router = useRouter()
const planetStore = usePlanetStore()

const planets = computed(() => planetStore.planets)
const isLoading = computed(() => planetStore.loading && !planetStore.planets.length)
const error = computed(() => planetStore.error)
const cartIds = computed(() => planetStore.cartIds)

const ALL = 'Toutes les collections'
const categories = computed(() => planetStore.categories)
const categoryFilters = computed(() => [ALL, ...categories.value])
const activeCategory = ref(ALL)
const activePlanetId = ref(null)

const filteredPlanets = computed(() => {
  if (activeCategory.value === ALL) {
    return planets.value
  }
  return planets.value.filter((planet) => planet.category === activeCategory.value)
})

const selectedPlanet = computed(() => {
  if (!filteredPlanets.value.length) return null
  return filteredPlanets.value.find((planet) => planet.id === activePlanetId.value) ?? filteredPlanets.value[0]
})

watch(
  filteredPlanets,
  (value) => {
    if (!value.length) {
      activePlanetId.value = null
      return
    }
    if (!value.some((planet) => planet.id === activePlanetId.value)) {
      activePlanetId.value = value[0].id
    }
  },
  { immediate: true },
)

const setCategory = (category) => {
  activeCategory.value = category
}

const handleSelectPlanet = (planetId) => {
  if (activePlanetId.value === planetId) {
    router.push(`/planet/${planetId}`)
    return
  }
  activePlanetId.value = planetId
}

const handleView = (id) => {
  router.push(`/planet/${id}`)
}

const handleAddToCart = (planet) => {
  const result = planetStore.addToCart(planet.id)
  if (!result?.success && result?.reason === 'duplicate') {
    alert('Cette planète est déjà réservée dans votre panier cosmique !')
  } else if (!result?.success) {
    alert('Impossible d’ajouter cette planète. Merci de réessayer dans une autre dimension.')
  } else {
    alert('Planète ajoutée ! Votre certificat d’adoption vous attend dans le panier galactique.')
  }
}

const formatPrice = (value) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
</script>

<template>
  <section class="catalog-shell">
    <div class="hero-header">
      <span class="hero-tag">
        <span class="dot"></span>
        Bureau Planétaire™ vous ouvre les portes du système solaire loufoque
      </span>
      <h1>Adoptez une planète dans notre système animé</h1>
      <p>
        Survolez le théâtre orbital, observez les mondes délirants tourner autour de notre soleil synthwave, puis
        devenez propriétaire intergalactique en un clic ridiculement sérieux.
      </p>
    </div>

    <div v-if="categoryFilters.length > 1" class="filters">
      <button
        v-for="category in categoryFilters"
        :key="category"
        :class="['filter-pill', activeCategory === category ? 'filter-pill--active' : '']"
        type="button"
        @click="setCategory(category)"
      >
        {{ category }}
      </button>
    </div>

    <div v-if="isLoading" class="state-card">
      Préparation de la navigation interdimensionnelle… Merci de patienter pendant l’alignement des planètes.
    </div>

    <div v-else-if="error" class="state-card state-card--error">{{ error }}</div>

    <div
      v-else-if="!filteredPlanets.length"
      class="state-card state-card--empty"
    >
      Aucun monde ne correspond à cette collection. Essayez une autre orbite ou laissez la fortune cosmique décider.
    </div>

    <div v-else class="solar-layout">
      <div class="solar-stage">
        <SolarSystem
          :planets="filteredPlanets"
          :active-planet-id="selectedPlanet?.id ?? null"
          @select="handleSelectPlanet"
        />

        <div v-if="selectedPlanet" class="planet-tooltip">
          <div class="tooltip-header">
            <span class="tooltip-name">{{ selectedPlanet.name }}</span>
            <span class="tooltip-price">{{ formatPrice(selectedPlanet.price) }}</span>
          </div>
          <p class="tooltip-description">{{ selectedPlanet.shortDescription }}</p>
          <button class="tooltip-action" type="button" @click="handleView(selectedPlanet.id)">
            Voir la fiche
          </button>
        </div>
      </div>

      <aside class="planet-panel" v-if="selectedPlanet">
        <div class="panel-header">
          <span class="panel-category">{{ selectedPlanet.category }}</span>
          <h2>{{ selectedPlanet.name }}</h2>
          <p>{{ selectedPlanet.shortDescription }}</p>
        </div>

        <div class="panel-body">
          <dl class="detail-grid">
            <div>
              <dt>Diamètre</dt>
              <dd>{{ selectedPlanet.diameter }}</dd>
            </div>
            <div>
              <dt>Température</dt>
              <dd>{{ selectedPlanet.temperature }}</dd>
            </div>
            <div>
              <dt>Prix orbitif</dt>
              <dd>{{ formatPrice(selectedPlanet.price) }}</dd>
            </div>
          </dl>

          <div class="resources">
            <h3>Ressources improbables</h3>
            <ul>
              <li v-for="resource in selectedPlanet.resources" :key="resource">{{ resource }}</li>
            </ul>
          </div>
        </div>

        <div class="panel-actions">
          <button class="btn-primary" type="button" @click="handleView(selectedPlanet.id)">
            Voir la fiche détaillée
          </button>
          <button
            :class="['btn-secondary', cartIds.includes(selectedPlanet.id) ? 'btn-disabled' : '']"
            :disabled="cartIds.includes(selectedPlanet.id)"
            type="button"
            @click="handleAddToCart(selectedPlanet)"
          >
            {{ cartIds.includes(selectedPlanet.id) ? 'Déjà réservée' : 'Ajouter au panier cosmique' }}
          </button>
        </div>
      </aside>
    </div>

    <div class="subscribe-card">
      <h3>Inscrivez-vous parmi les premiers acheteurs intergalactiques</h3>
      <div class="subscribe-form">
        <input type="email" placeholder="Votre e-mail de capitaine spatial" />
        <button type="button">S’abonner</button>
      </div>
      <p class="small-print">Promis, nous n’envoyons pas de spam intersidéral. Juste des bons plans planétaires.</p>
    </div>
  </section>
</template>

<style scoped>
.catalog-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  color: #f8fafc;
  padding-bottom: 5rem;
}

.catalog-shell::before {
  content: '';
  position: absolute;
  inset: -8rem -12rem;
  background: radial-gradient(circle at 30% 15%, rgba(59, 130, 246, 0.28), transparent 50%),
    radial-gradient(circle at 70% 20%, rgba(244, 114, 182, 0.25), transparent 55%),
    radial-gradient(circle at 50% 60%, rgba(251, 191, 36, 0.2), transparent 60%),
    linear-gradient(180deg, rgba(3, 7, 18, 0.96) 0%, rgba(2, 6, 23, 1) 45%, rgba(1, 3, 15, 1) 100%);
  pointer-events: none;
  z-index: -1;
}

.hero-header {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  max-width: 760px;
}

.hero-header h1 {
  font-size: clamp(2.6rem, 4.4vw, 3.6rem);
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-weight: 700;
  color: #f9fbff;
  text-shadow: 0 14px 45px rgba(8, 13, 31, 0.75);
}

.hero-header p {
  font-size: 1rem;
  line-height: 1.75;
  color: rgba(203, 213, 225, 0.84);
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(96, 165, 250, 0.35);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(191, 219, 254, 0.92);
  box-shadow: 0 12px 30px rgba(8, 11, 34, 0.55);
}

.hero-tag .dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #60a5fa, #c084fc);
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.95);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
}

.filter-pill {
  border-radius: 9999px;
  padding: 0.6rem 1.3rem;
  background: rgba(15, 23, 42, 0.6);
  color: rgba(226, 232, 240, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.25);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: background 0.2s ease, transform 0.2s ease, border 0.2s ease;
}

.filter-pill:hover {
  transform: translateY(-1px);
  border-color: rgba(96, 165, 250, 0.6);
}

.filter-pill--active {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.85), rgba(139, 92, 246, 0.8));
  color: #0b1120;
  border-color: rgba(191, 219, 254, 0.85);
  box-shadow: 0 12px 35px rgba(96, 165, 250, 0.45);
}

.state-card {
  border-radius: 1.8rem;
  padding: 1.8rem;
  border: 1px solid rgba(96, 165, 250, 0.3);
  background: rgba(15, 23, 42, 0.68);
  color: rgba(226, 232, 240, 0.9);
  text-align: center;
  font-size: 0.95rem;
  backdrop-filter: blur(18px);
  box-shadow: 0 25px 60px rgba(4, 7, 22, 0.45);
}

.state-card--error {
  border-color: rgba(248, 113, 113, 0.5);
  background: rgba(239, 68, 68, 0.2);
}

.state-card--empty {
  border-style: dashed;
}

.solar-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 2.75rem;
  align-items: start;
}

.solar-stage {
  position: relative;
  border-radius: 2.6rem;
}

.planet-tooltip {
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(96, 165, 250, 0.35);
  box-shadow: 0 18px 40px rgba(2, 6, 23, 0.45);
  min-width: 240px;
  text-align: left;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.tooltip-name {
  font-weight: 700;
  font-size: 1rem;
}

.tooltip-price {
  font-size: 0.85rem;
  color: rgba(96, 165, 250, 0.9);
  font-weight: 600;
}

.tooltip-description {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.78);
}

.tooltip-action {
  align-self: flex-start;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  border: none;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.75), rgba(191, 219, 254, 0.9));
  color: #0b1220;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.planet-panel {
  border-radius: 2rem;
  border: 1px solid rgba(99, 102, 241, 0.4);
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8));
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 35px 90px rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(18px);
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.panel-category {
  align-self: flex-start;
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgba(96, 165, 250, 0.2);
  color: rgba(191, 219, 254, 0.95);
  border: 1px solid rgba(148, 163, 255, 0.4);
}

.panel-header h2 {
  font-size: 1.9rem;
  font-weight: 700;
  color: #f8fafc;
}

.panel-header p {
  color: rgba(203, 213, 225, 0.82);
  line-height: 1.6;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
}

.detail-grid dt {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(148, 163, 255, 0.75);
}

.detail-grid dd {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f1f5f9;
}

.resources h3 {
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(148, 163, 255, 0.78);
  margin-bottom: 0.65rem;
}

.resources ul {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  color: rgba(226, 232, 240, 0.75);
  font-size: 0.93rem;
}

.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.subscribe-card {
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-radius: 1.6rem;
  padding: 1.8rem 2rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(96, 165, 250, 0.35);
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.45);
  text-align: center;
  max-width: 560px;
}

.subscribe-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(224, 231, 255, 0.95);
}

.subscribe-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  width: 100%;
}

.subscribe-form input {
  flex: 1 1 220px;
  min-width: 200px;
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 255, 0.4);
  background: rgba(15, 23, 42, 0.7);
  color: #e0e7ff;
  padding: 0.65rem 1rem;
}

.subscribe-form button {
  padding: 0.65rem 1.4rem;
  border-radius: 0.9rem;
  border: none;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #041225;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.small-print {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.8);
}

@media (max-width: 1200px) {
  .solar-layout {
    grid-template-columns: 1fr;
  }

  .planet-panel {
    max-width: 540px;
    margin-inline: auto;
  }

  .planet-tooltip {
    top: 10%;
  }
}

@media (max-width: 768px) {
  .catalog-shell {
    gap: 1.8rem;
  }

  .planet-panel {
    padding: 1.6rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .planet-tooltip {
    min-width: 220px;
  }
}
</style>
