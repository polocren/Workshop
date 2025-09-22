<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanetStore } from '../store/planets'

const router = useRouter()
const planetStore = usePlanetStore()

const form = reactive({
  name: '',
  price: '',
  shortDescription: '',
  category: '',
  description: '',
  image: '',
  diameter: '',
  temperature: '',
  resources: '',
  mapX: '',
  mapY: '',
})

const errors = ref([])

const handleSubmit = () => {
  errors.value = []
  if (!form.name.trim()) errors.value.push('Un nom digne d’un panneau lumineux spatial est requis.')
  if (!form.price || Number.isNaN(Number(form.price))) errors.value.push('Merci de préciser un prix en créduliums galactiques.')
  if (!form.shortDescription.trim()) errors.value.push('Ajoutez un slogan absurde, nos clients adorent ça.')
  if (form.mapX && Number.isNaN(Number(form.mapX))) errors.value.push('La position X de la carte doit être un nombre entre 0 et 100.')
  if (form.mapY && Number.isNaN(Number(form.mapY))) errors.value.push('La position Y de la carte doit être un nombre entre 0 et 100.')

  if (errors.value.length) return

  const created = planetStore.addPlanet({
    ...form,
    price: Number(form.price),
    resources: form.resources,
    mapPosition: form.mapX || form.mapY ? { x: Number(form.mapX), y: Number(form.mapY) } : undefined,
  })

  router.push(`/planet/${created.id}`)
}

const cancel = () => {
  router.push('/')
}
</script>

<template>
  <section class="space-y-10">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="space-y-2">
        <p class="sublabel">Créer une nouvelle anomalie planétaire</p>
        <h1 class="section-heading">Ajouter une planète improbable</h1>
        <p class="section-intro">
          Déposez votre monde sur notre marché cosmique. Racontez son histoire, précisez sa localisation dans l’atlas et
          laissez nos clients interstellaires tomber sous le charme.
        </p>
      </div>
      <button class="btn-secondary w-max" type="button" @click="cancel">← Retour au catalogue</button>
    </div>

    <form class="card space-y-6" @submit.prevent="handleSubmit">
      <div
        v-if="errors.length"
        class="rounded-2xl border border-rose-400/40 bg-rose-900/30 p-4 text-sm text-rose-100"
      >
        <p class="font-semibold">Quelques ajustements sont requis :</p>
        <ul class="mt-2 list-inside list-disc space-y-1">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <div class="form-grid">
        <label class="flex flex-col gap-2">
          <span class="sublabel">Nom de la planète</span>
          <input v-model="form.name" class="input-field" placeholder="Ex. Banania Prime Deluxe" type="text" />
        </label>
        <label class="flex flex-col gap-2">
          <span class="sublabel">Prix (en €)</span>
          <input
            v-model="form.price"
            class="input-field"
            inputmode="decimal"
            min="0"
            step="0.01"
            type="number"
          />
        </label>
      </div>

      <label class="flex flex-col gap-2">
        <span class="sublabel">Accroche commerciale</span>
        <input
          v-model="form.shortDescription"
          class="input-field"
          placeholder="Un monde composé à 98% de mousse au chocolat cosmique"
          type="text"
        />
      </label>

      <label class="flex flex-col gap-2">
        <span class="sublabel">Collection cosmique</span>
        <input
          v-model="form.category"
          class="input-field"
          placeholder="Snacks Extrêmes, Desserts Orbitales, Océans Loufoques..."
          type="text"
        />
      </label>

      <label class="flex flex-col gap-2">
        <span class="sublabel">Description détaillée</span>
        <textarea
          v-model="form.description"
          class="input-field"
          placeholder="Décrivez cette sphère improbable avec passion et mauvaise foi."
        ></textarea>
      </label>

      <div class="grid gap-4 md:grid-cols-3">
        <label class="flex flex-col gap-2 md:col-span-2">
          <span class="sublabel">URL de l’image</span>
          <input
            v-model="form.image"
            class="input-field"
            placeholder="https://robohash.org/monde-bizarre.png?set=set3"
            type="url"
          />
        </label>
        <label class="flex flex-col gap-2">
          <span class="sublabel">Diamètre approximatif</span>
          <input v-model="form.diameter" class="input-field" placeholder="42 000 km de pure excentricité" type="text" />
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <label class="flex flex-col gap-2">
          <span class="sublabel">Position sur la carte (X %)</span>
          <input
            v-model="form.mapX"
            class="input-field"
            placeholder="18"
            type="number"
            min="0"
            max="100"
            step="1"
          />
        </label>
        <label class="flex flex-col gap-2">
          <span class="sublabel">Position sur la carte (Y %)</span>
          <input
            v-model="form.mapY"
            class="input-field"
            placeholder="42"
            type="number"
            min="0"
            max="100"
            step="1"
          />
        </label>
        <div class="self-end text-xs text-slate-400">
          Placez la planète sur l’atlas: 0 correspond au coin supérieur gauche, 100 au coin inférieur droit.
        </div>
      </div>

      <div class="form-grid">
        <label class="flex flex-col gap-2">
          <span class="sublabel">Température de surface</span>
          <input
            v-model="form.temperature"
            class="input-field"
            placeholder="De -80°C à +600°C selon l’humeur"
            type="text"
          />
        </label>
        <label class="flex flex-col gap-2">
          <span class="sublabel">Ressources (séparées par des virgules)</span>
          <input
            v-model="form.resources"
            class="input-field"
            placeholder="Cristaux de fou-rire, Vapeur de chips, Pluie de mousse"
            type="text"
          />
        </label>
      </div>

      <div class="flex flex-wrap justify-end gap-3">
        <button class="btn-secondary" type="button" @click="cancel">Annuler</button>
        <button class="btn-primary" type="submit">Publier cette planète</button>
      </div>
    </form>
  </section>
</template>
