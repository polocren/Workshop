<template>
  <div class="planet-form">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="btn btn-secondary back-btn">
        <i class="icon-arrow-left"></i>
        Retour
      </button>
      <h1>{{ isEditing ? 'Modifier' : 'Ajouter' }} une planète</h1>
    </div>

    <!-- Messages d'état -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      {{ isEditing ? 'Chargement des données...' : 'Sauvegarde en cours...' }}
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="error = ''" class="btn btn-secondary">Fermer</button>
    </div>

    <div v-if="success" class="success">
      <p>{{ success }}</p>
    </div>

    <!-- Formulaire -->
    <form @submit.prevent="submitForm" v-if="!loading" class="form">
      <!-- Informations de base -->
      <div class="form-section">
        <h2>Informations générales</h2>
        
        <div class="form-group">
          <label for="name">Nom de la planète *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="form-input"
            placeholder="Ex: Mars"
            :class="{ 'error': errors.name }"
          />
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="type">Type de planète *</label>
          <select
            id="type"
            v-model="form.type"
            required
            class="form-select"
            :class="{ 'error': errors.type }"
          >
            <option value="">Sélectionner un type</option>
            <option value="Tellurique">Tellurique</option>
            <option value="Gazeuse">Gazeuse</option>
            <option value="Naine">Naine</option>
            <option value="Géante de glace">Géante de glace</option>
          </select>
          <span v-if="errors.type" class="error-text">{{ errors.type }}</span>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-textarea"
            rows="4"
            placeholder="Description de la planète..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="imageUrl">URL de l'image</label>
          <input
            id="imageUrl"
            v-model="form.imageUrl"
            type="url"
            class="form-input"
            placeholder="https://exemple.com/image.jpg"
          />
          <div v-if="form.imageUrl" class="image-preview">
            <img 
              :src="form.imageUrl" 
              alt="Aperçu"
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </div>
        </div>
      </div>

      <!-- Caractéristiques physiques -->
      <div class="form-section">
        <h2>Caractéristiques physiques</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label for="mass">Masse (en Terres) *</label>
            <input
              id="mass"
              v-model.number="form.mass"
              type="number"
              step="0.01"
              min="0"
              required
              class="form-input"
              placeholder="1.0"
              :class="{ 'error': errors.mass }"
            />
            <span v-if="errors.mass" class="error-text">{{ errors.mass }}</span>
          </div>

          <div class="form-group">
            <label for="radius">Rayon (en Terres) *</label>
            <input
              id="radius"
              v-model.number="form.radius"
              type="number"
              step="0.01"
              min="0"
              required
              class="form-input"
              placeholder="1.0"
              :class="{ 'error': errors.radius }"
            />
            <span v-if="errors.radius" class="error-text">{{ errors.radius }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="distanceFromSun">Distance du Soleil (UA) *</label>
            <input
              id="distanceFromSun"
              v-model.number="form.distanceFromSun"
              type="number"
              step="0.1"
              min="0"
              required
              class="form-input"
              placeholder="1.0"
              :class="{ 'error': errors.distanceFromSun }"
            />
            <span v-if="errors.distanceFromSun" class="error-text">{{ errors.distanceFromSun }}</span>
          </div>

          <div class="form-group">
            <label for="orbitalPeriod">Période orbitale (jours)</label>
            <input
              id="orbitalPeriod"
              v-model.number="form.orbitalPeriod"
              type="number"
              step="0.1"
              min="0"
              class="form-input"
              placeholder="365.25"
            />
          </div>
        </div>
      </div>

      <!-- Position dans l'espace 3D -->
      <div class="form-section">
        <h2>Position 3D</h2>
        <p class="section-description">
          Position de la planète dans l'espace 3D (coordonnées en unités arbitraires)
        </p>
        
        <div class="form-row">
          <div class="form-group">
            <label for="posX">Position X *</label>
            <input
              id="posX"
              v-model.number="form.position.x"
              type="number"
              step="0.1"
              required
              class="form-input"
              placeholder="0"
              :class="{ 'error': errors.position }"
            />
          </div>

          <div class="form-group">
            <label for="posY">Position Y *</label>
            <input
              id="posY"
              v-model.number="form.position.y"
              type="number"
              step="0.1"
              required
              class="form-input"
              placeholder="0"
            />
          </div>

          <div class="form-group">
            <label for="posZ">Position Z *</label>
            <input
              id="posZ"
              v-model.number="form.position.z"
              type="number"
              step="0.1"
              required
              class="form-input"
              placeholder="0"
            />
          </div>
        </div>
        
        <div class="position-helper">
          <button type="button" @click="generateRandomPosition" class="btn btn-info">
            <i class="icon-dice"></i>
            Position aléatoire
          </button>
          <button type="button" @click="centerPosition" class="btn btn-secondary">
            <i class="icon-center"></i>
            Centrer (0,0,0)
          </button>
        </div>
      </div>

      <!-- Couleur et apparence -->
      <div class="form-section">
        <h2>Apparence</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label for="color">Couleur principale</label>
            <div class="color-input-group">
              <input
                id="color"
                v-model="form.color"
                type="color"
                class="form-color"
              />
              <input
                v-model="form.color"
                type="text"
                class="form-input"
                placeholder="#FF6B35"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="temperature">Température (K)</label>
            <input
              id="temperature"
              v-model.number="form.temperature"
              type="number"
              min="0"
              class="form-input"
              placeholder="288"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn btn-secondary">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <span v-if="submitting">
            {{ isEditing ? 'Modification...' : 'Ajout...' }}
          </span>
          <span v-else>
            {{ isEditing ? 'Modifier' : 'Ajouter' }} la planète
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import planetAPI from '../services/planetAPI'

const router = useRouter()
const route = useRoute()

// État réactif
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const success = ref('')

const isEditing = computed(() => !!route.params.id)

// Formulaire réactif
const form = reactive({
  name: '',
  type: '',
  description: '',
  imageUrl: '',
  mass: 1,
  radius: 1,
  distanceFromSun: 1,
  orbitalPeriod: 365,
  position: {
    x: 0,
    y: 0,
    z: 0
  },
  color: '#FF6B35',
  temperature: 288
})

// Erreurs de validation
const errors = reactive<Record<string, string>>({
  name: '',
  type: '',
  mass: '',
  radius: '',
  distanceFromSun: '',
  position: ''
})

// Validation du formulaire
const validateForm = () => {
  // Reset des erreurs
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Nom requis
  if (!form.name.trim()) {
    errors.name = 'Le nom est requis'
    isValid = false
  }

  // Type requis
  if (!form.type) {
    errors.type = 'Le type est requis'
    isValid = false
  }

  // Valeurs numériques positives
  if (form.mass <= 0) {
    errors.mass = 'La masse doit être positive'
    isValid = false
  }

  if (form.radius <= 0) {
    errors.radius = 'Le rayon doit être positif'
    isValid = false
  }

  if (form.distanceFromSun <= 0) {
    errors.distanceFromSun = 'La distance doit être positive'
    isValid = false
  }

  return isValid
}

// Charger les données pour l'édition
const loadPlanetData = async () => {
  if (!isEditing.value) return

  loading.value = true
  error.value = ''

  try {
    const planet = await planetAPI.getPlanetById(route.params.id as string)

    // Extraire et convertir les données depuis le format API
    const distanceValue = parseFloat(planet.distance?.replace(' UA', '') || '1')
    const diameterValue = parseFloat(planet.diameter?.replace(' km', '') || '12756')
    const radiusValue = diameterValue / 12756 // Convertir diamètre en rayon Terre
    const tempValue = parseFloat(planet.temperature?.replace(' K', '') || '288')
    const orbitalValue = parseFloat(planet.orbitalPeriod?.replace(' jours', '') || '365')

    // Remplir le formulaire avec les données existantes
    Object.assign(form, {
      name: planet.name,
      type: planet.type,
      description: planet.description || '',
      imageUrl: planet.image || '',
      mass: 1, // Valeur par défaut si pas dans composition
      radius: radiusValue,
      distanceFromSun: distanceValue,
      orbitalPeriod: orbitalValue,
      position: { ...planet.position },
      color: planet.color || '#FF6B35',
      temperature: tempValue
    })

  } catch (err) {
    console.error('Erreur lors du chargement de la planète:', err)
    error.value = 'Impossible de charger les données de la planète'
  } finally {
    loading.value = false
  }
}

// Soumettre le formulaire
const submitForm = async () => {
  if (!validateForm()) return

  submitting.value = true
  error.value = ''
  success.value = ''

  try {
    // Transformer les données du formulaire vers le format attendu par l'API
    const planetData = {
      name: form.name,
      type: form.type,
      description: form.description || '',
      distance: `${form.distanceFromSun} UA`,
      diameter: `${form.radius * 12756} km`, // Convertir rayon Terre vers km
      position: form.position,
      color: form.color,
      size: form.radius,
      image: form.imageUrl || '/images/planets/default.svg',
      discoveryDate: null,
      moons: 0,
      orbitalPeriod: form.orbitalPeriod ? `${form.orbitalPeriod} jours` : undefined,
      temperature: form.temperature ? `${form.temperature} K` : undefined,
      composition: `Masse: ${form.mass} M⊕`
    }

    if (isEditing.value) {
      await planetAPI.updatePlanet(route.params.id as string, planetData)
      success.value = 'Planète modifiée avec succès !'
    } else {
      await planetAPI.createPlanet(planetData)
      success.value = 'Planète ajoutée avec succès !'
    }

    // Rediriger après un délai
    setTimeout(() => {
      router.push('/planets')
    }, 1500)

  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err)
    error.value = isEditing.value 
      ? 'Impossible de modifier la planète' 
      : 'Impossible d\'ajouter la planète'
  } finally {
    submitting.value = false
  }
}

// Helpers pour la position
const generateRandomPosition = () => {
  form.position.x = Math.round((Math.random() - 0.5) * 100 * 10) / 10
  form.position.y = Math.round((Math.random() - 0.5) * 100 * 10) / 10
  form.position.z = Math.round((Math.random() - 0.5) * 100 * 10) / 10
}

const centerPosition = () => {
  form.position.x = 0
  form.position.y = 0
  form.position.z = 0
}

// Gestion des images
const handleImageError = () => {
  // Image par défaut si l'URL ne fonctionne pas
}

const handleImageLoad = () => {
  // Image chargée avec succès
}

// Navigation
const goBack = () => {
  router.push('/planets')
}

// Initialisation
onMounted(() => {
  if (isEditing.value) {
    loadPlanetData()
  }
})
</script>

<style scoped>
.planet-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
}

.back-btn {
  min-width: auto;
}

.header h1 {
  color: #fff;
  margin: 0;
  font-size: 2.2rem;
}

/* Messages d'état */
.loading, .error, .success {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.loading {
  color: #fff;
}

.error {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
}

.success {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4CAF50;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

/* Formulaire */
.form {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px;
}

.form-section {
  margin-bottom: 40px;
}

.form-section h2 {
  color: #fff;
  margin: 0 0 15px 0;
  font-size: 1.4rem;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.section-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #fff;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}

.form-input.error, .form-select.error {
  border-color: #f44336;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.3);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-color {
  width: 60px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-input-group .form-input {
  flex: 1;
}

/* Aperçu d'image */
.image-preview {
  margin-top: 10px;
  text-align: center;
}

.image-preview img {
  max-width: 100px;
  max-height: 100px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* Helpers de position */
.position-helper {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* Erreurs */
.error-text {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* Boutons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-info {
  background: #2196F3;
  color: white;
}

.btn-info:hover {
  background: #1976D2;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Icônes */
.icon-arrow-left::before { content: '←'; }
.icon-dice::before { content: '🎲'; }
.icon-center::before { content: '⊙'; }

/* Responsive */
@media (max-width: 768px) {
  .planet-form {
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    text-align: center;
  }
  
  .form {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .position-helper {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .color-input-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
