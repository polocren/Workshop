<script setup>
import { computed, reactive, ref, watch } from 'vue'
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

watch(
  planet,
  (value) => {
    if (!value) return
    form.name = value.name
    form.price = value.price
    form.shortDescription = value.shortDescription
    form.category = value.category
    form.description = value.description
    form.image = value.image
    form.diameter = value.diameter
    form.temperature = value.temperature
    form.resources = value.resources?.join(', ')
    form.mapX = value.mapPosition?.x ?? ''
    form.mapY = value.mapPosition?.y ?? ''
  },
  { immediate: true },
)

const handleSubmit = () => {
  errors.value = []
  if (!form.name.trim()) errors.value.push('Merci de conserver un nom officiel pour la planète.')
  if (!form.shortDescription.trim()) errors.value.push('Une accroche commerciale reste obligatoire.')
  if (form.price === '' || Number.isNaN(Number(form.price))) errors.value.push('Indiquez un prix valable.')
  if (form.mapX && Number.isNaN(Number(form.mapX))) errors.value.push('La position X doit être un nombre entre 0 et 100.')
  if (form.mapY && Number.isNaN(Number(form.mapY))) errors.value.push('La position Y doit être un nombre entre 0 et 100.')

  if (errors.value.length) return

  planetStore.updatePlanet(props.id, {
    ...form,
    price: Number(form.price),
    resources: form.resources,
    mapPosition: form.mapX || form.mapY ? { x: Number(form.mapX), y: Number(form.mapY) } : undefined,
  })

  router.push(`/planet/${props.id}`)
}

const cancel = () => {
  router.push(`/planet/${props.id}`)
}
</script>

<template>
  <section v-if="planet" class="space-y-10">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="space-y-2">
        <p class="sublabel">Mettre à jour la fiche planétaire</p>
        <h1 class="section-heading">Modifier {{ planet.name }}</h1>
        <p class="section-intro">
          Ajustez la présentation, la localisation et les ressources pour rester conforme aux dernières normes absurdes du
          secteur spatial.
        </p>
      </div>
      <button class="btn-secondary w-max" type="button" @click="cancel">← Retour à la fiche</button>
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
          <input v-model="form.name" class="input-field" type="text" />
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
        <input v-model="form.shortDescription" class="input-field" type="text" />
      </label>

      <label class="flex flex-col gap-2">
        <span class="sublabel">Collection cosmique</span>
        <input v-model="form.category" class="input-field" type="text" />
      </label>

      <label class="flex flex-col gap-2">
        <span class="sublabel">Description détaillée</span>
        <textarea v-model="form.description" class="input-field"></textarea>
      </label>

      <div class="grid gap-4 md:grid-cols-3">
        <label class="flex flex-col gap-2 md:col-span-2">
          <span class="sublabel">URL de l’image</span>
          <input v-model="form.image" class="input-field" type="url" />
        </label>
        <label class="flex flex-col gap-2">
          <span class="sublabel">Diamètre approximatif</span>
          <input v-model="form.diameter" class="input-field" type="text" />
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <label class="flex flex-col gap-2">
          <span class="sublabel">Position sur la carte (X %)</span>
          <input v-model="form.mapX" class="input-field" type="number" min="0" max="100" step="1" />
        </label>
        <label class="flex flex-col gap-2">
          <span class="sublabel">Position sur la carte (Y %)</span>
          <input v-model="form.mapY" class="input-field" type="number" min="0" max="100" step="1" />
        </label>
        <div class="self-end text-xs text-slate-400">Réglez la position du marqueur sur l’atlas.</div>
      </div>

      <div class="form-grid">
        <label class="flex flex-col gap-2">
          <span class="sublabel">Température de surface</span>
          <input v-model="form.temperature" class="input-field" type="text" />
        </label>
        <label class="flex flex-col gap-2">
          <span class="sublabel">Ressources (séparées par des virgules)</span>
          <input v-model="form.resources" class="input-field" type="text" />
        </label>
      </div>

      <div class="flex flex-wrap justify-end gap-3">
        <button class="btn-secondary" type="button" @click="cancel">Annuler</button>
        <button class="btn-primary" type="submit">Sauvegarder</button>
      </div>
    </form>
  </section>

  <section v-else class="surface-panel text-center">
    <p class="text-muted">Planète introuvable. Elle a sûrement pris la tangente hyperspatiale.</p>
    <button class="btn-secondary mt-4" type="button" @click="cancel">Retour au catalogue</button>
  </section>
</template>
