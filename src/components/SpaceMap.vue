<template>
  <div class="space-map-container">
    <!-- Indicateur de chargement -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Chargement des planètes...</p>
      </div>
    </div>
    
    <!-- Message d'erreur -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <h3>Erreur de connexion</h3>
        <p>{{ error }}</p>
        <button @click="loadPlanets" class="retry-btn">Réessayer</button>
      </div>
    </div>
    
    <canvas ref="canvasRef" class="space-canvas"></canvas>
    
    <!-- Interface utilisateur pour les informations des planètes -->
    <PlanetInfo 
      :planet="selectedPlanet" 
      @close="closePlanetInfo" 
    />

    <!-- Contrôles de navigation -->
    <NavigationControls />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import type { Planet } from '../types/Planet'
import PlanetInfo from './PlanetInfo.vue'
import NavigationControls from './NavigationControls.vue'
import planetAPI from '../services/planetAPI'

// Variables réactives
const canvasRef = ref<HTMLCanvasElement>()
const selectedPlanet = ref<Planet | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Variables Three.js
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2
let planets: Planet[] = []
// Texture loader + simple cache for planet textures
const textureLoader = new THREE.TextureLoader()
const textureCache = new Map<string, THREE.Texture>()

// Variables pour les contrôles de caméra
let isMouseDown = false
let mouseX = 0
let mouseY = 0
let targetRotationX = 0
let targetRotationY = 0
let currentRotationX = 0
let currentRotationY = 0
let cameraDistance = 70
let hoveredPlanet: Planet | null = null
let isDragging = false
let dragStartTime = 0

// Charger les planètes depuis l'API
const loadPlanets = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Vérifier la santé de l'API
    const isApiHealthy = await planetAPI.healthCheck()
    if (!isApiHealthy) {
      throw new Error('L\'API n\'est pas disponible. Assurez-vous que le serveur backend est en cours d\'exécution.')
    }
    
    const apiPlanets = await planetAPI.getAllPlanets()
    
    // Convertir les données de l'API au format attendu par Three.js
    planets = apiPlanets.map(planet => ({
      ...planet,
      position: new THREE.Vector3(
        planet.position.x || 0, 
        planet.position.y || 0, 
        planet.position.z || 0
      ),
      color: typeof planet.color === 'string' ? parseInt(planet.color, 16) : planet.color
    }))
    
    // Créer les planètes dans la scène 3D après le chargement
    if (scene) {
      createPlanets()
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des planètes'
    console.error('Erreur lors du chargement des planètes:', err)
  } finally {
    loading.value = false
  }
}

// Initialisation de la scène 3D
const initThreeJS = async () => {
  if (!canvasRef.value) return

  // Scène
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x16213e)

  // Caméra
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 20, cameraDistance)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Définir le curseur par défaut
  canvasRef.value.style.cursor = 'grab'

  // Éclairage
  const ambientLight = new THREE.AmbientLight(0x404040, 1.2)
  scene.add(ambientLight)

  const sunLight = new THREE.PointLight(0xFFFFFF, 2, 200)
  sunLight.position.set(0, 0, 0)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 2048
  sunLight.shadow.mapSize.height = 2048
  scene.add(sunLight)

  // Lumière directionnelle pour mieux éclairer les planètes
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5)
  directionalLight.position.set(10, 10, 5)
  scene.add(directionalLight)

  // Raycaster pour la détection de clic
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Charger les planètes depuis l'API
  await loadPlanets()

  // Ajouter des étoiles en arrière-plan
  createStarField()

  // Démarrer la boucle de rendu
  animate()
}

// Création des planètes
const createPlanets = () => {
  // Nettoyer les planètes existantes de la scène
  planets.forEach(planet => {
    if (planet.mesh) {
      scene.remove(planet.mesh)
    }
  })
  
  planets = planets.map(planetData => {
    const geometry = new THREE.SphereGeometry(planetData.size, 48, 48)

    // Matériau: utiliser la texture de l'image si disponible, sinon la couleur
    let material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial
    if (planetData.name === 'Soleil') {
      material = new THREE.MeshBasicMaterial({ color: new THREE.Color(planetData.color) })
    } else {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(planetData.color as any),
        roughness: 0.7,
        metalness: 0.1
      })
      const img = typeof planetData.image === 'string' ? planetData.image : ''
      if (img) {
        const cached = textureCache.get(img)
        if (cached) {
          // Pour bien voir la texture, on utilise un BasicMaterial non influencé par la lumière
          material = new THREE.MeshBasicMaterial({ map: cached })
        } else {
          // Charge la texture et mets-la en cache
          textureLoader.load(
            img,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace
              textureCache.set(img, tex)
              // Remplace le matériau par un Basic avec la texture
              const basic = new THREE.MeshBasicMaterial({ map: tex })
              mesh.material = basic
            },
            undefined,
            // En cas d'échec, on garde juste la couleur
            () => {}
          )
        }
      }
    }

    const mesh = new THREE.Mesh(geometry, material as THREE.Material)
    
    // S'assurer que position est un Vector3
    if (planetData.position instanceof THREE.Vector3) {
      mesh.position.copy(planetData.position)
    } else {
      mesh.position.set(planetData.position.x, planetData.position.y, planetData.position.z)
    }
    
    mesh.castShadow = true
    mesh.receiveShadow = true
    
    // Ajouter un nom à la mesh pour le debug
    mesh.name = planetData.name
    
    // Supprimer les lignes de contour (wireframe) pour un rendu plus propre

    scene.add(mesh)
    
    // Ajouter des anneaux pour Saturne (mais pas dans la détection)
    if (planetData.name === "Saturne") {
      const ringGeometry = new THREE.RingGeometry(planetData.size * 1.5, planetData.size * 2.5, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xDDDDDD, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      })
      const rings = new THREE.Mesh(ringGeometry, ringMaterial)
      rings.rotation.x = Math.PI / 2
      rings.name = planetData.name + '_rings'
      mesh.add(rings)
    }
    
    const planet = { ...planetData, mesh }
    return planet
  })
}

// Création du champ d'étoiles
const createStarField = () => {
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 20
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200
    positions[i + 1] = (Math.random() - 0.5) * 200
    positions[i + 2] = (Math.random() - 0.5) * 200
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const starMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5 })
  const stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)
}

// Gestion des événements de souris
const onMouseDown = (event: MouseEvent) => {
  // Vérifier que l'événement provient bien du canvas
  if (!canvasRef.value || event.target !== canvasRef.value) return
  
  isMouseDown = true
  isDragging = false
  dragStartTime = Date.now()
  mouseX = event.clientX
  mouseY = event.clientY
}

const onMouseUp = (event: MouseEvent) => {
  const dragDuration = Date.now() - dragStartTime
  const dragDistance = Math.abs(event.clientX - mouseX) + Math.abs(event.clientY - mouseY)
  
  // Si le mouvement est minimal et rapide, c'est un clic
  if (dragDuration < 300 && dragDistance < 10 && !isDragging) {
    handlePlanetClick(event)
  }
  
  isMouseDown = false
  isDragging = false
}

// Fonction séparée pour gérer le clic sur les planètes
const handlePlanetClick = (event: MouseEvent) => {
  
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  
  // Ne tester que les meshes principales des planètes
  const planetMeshes = planets.map(p => p.mesh).filter(mesh => mesh !== undefined)
  const intersects = raycaster.intersectObjects(planetMeshes, false) // false = pas les enfants

  if (intersects.length > 0) {
    const clickedObject = intersects[0]?.object
    if (clickedObject) {
      const planet = planets.find(p => p.mesh === clickedObject)
      if (planet) {
        selectedPlanet.value = planet
      }
    }
  }
}

const onMouseMove = (event: MouseEvent) => {
  // Vérifier que l'événement provient bien du canvas
  if (!canvasRef.value || event.target !== canvasRef.value) return
  
  if (isMouseDown) {
    const deltaX = event.clientX - mouseX
    const deltaY = event.clientY - mouseY

    // Si on commence à bouger, c'est un glissement
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      isDragging = true
    }

    if (isDragging) {
      targetRotationY += deltaX * 0.01
      targetRotationX += deltaY * 0.01

      // Limiter la rotation verticale
      targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX))

      mouseX = event.clientX
      mouseY = event.clientY
    }
  } else {
    // Gestion du survol des planètes seulement si on ne fait pas glisser
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    
    // Ne tester que les meshes principales des planètes
    const planetMeshes = planets.map(p => p.mesh).filter(mesh => mesh !== undefined)
    const intersects = raycaster.intersectObjects(planetMeshes, false) // false = pas les enfants

    // Réinitialiser l'état de survol précédent
    if (hoveredPlanet && hoveredPlanet.mesh) {
      hoveredPlanet.mesh.scale.set(1, 1, 1)
    }
    hoveredPlanet = null

    if (intersects.length > 0) {
      const hoveredObject = intersects[0]?.object
      if (hoveredObject) {
        const planet = planets.find(p => p.mesh === hoveredObject)
        if (planet) {
          hoveredPlanet = planet
          // Agrandir légèrement la planète survolée
          planet.mesh?.scale.set(1.2, 1.2, 1.2)
          // Changer le curseur
          if (canvasRef.value) {
            canvasRef.value.style.cursor = 'pointer'
          }
        }
      }
    } else {
      // Réinitialiser le curseur
      if (canvasRef.value) {
        canvasRef.value.style.cursor = isDragging ? 'grabbing' : 'grab'
      }
    }
  }
}

const onWheel = (event: WheelEvent) => {
  // Vérifier que l'événement provient bien du canvas
  if (!canvasRef.value || event.target !== canvasRef.value) return
  
  cameraDistance += event.deltaY * 0.01
  cameraDistance = Math.max(10, Math.min(150, cameraDistance))
}

// Fermer les informations de la planète
const closePlanetInfo = () => {
  selectedPlanet.value = null
}

// Boucle d'animation
const animate = () => {
  requestAnimationFrame(animate)

  // Animation fluide de la rotation de la caméra
  currentRotationX += (targetRotationX - currentRotationX) * 0.05
  currentRotationY += (targetRotationY - currentRotationY) * 0.05

  // Mettre à jour la position de la caméra
  camera.position.x = Math.cos(currentRotationY) * Math.cos(currentRotationX) * cameraDistance
  camera.position.y = Math.sin(currentRotationX) * cameraDistance
  camera.position.z = Math.sin(currentRotationY) * Math.cos(currentRotationX) * cameraDistance
  camera.lookAt(0, 0, 0)

  // Rotation des planètes sur elles-mêmes
  planets.forEach(planet => {
    if (planet.mesh) {
      planet.mesh.rotation.y += 0.01
    }
  })

  renderer.render(scene, camera)
}

// Gestion du redimensionnement
const onWindowResize = () => {
  if (!canvasRef.value) return
  
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// Lifecycle hooks
onMounted(() => {
  initThreeJS()
  
  // Attacher les événements de navigation uniquement au canvas
  if (canvasRef.value) {
    canvasRef.value.addEventListener('mousedown', onMouseDown)
    canvasRef.value.addEventListener('mousemove', onMouseMove)
    canvasRef.value.addEventListener('wheel', onWheel, { passive: false })
    canvasRef.value.addEventListener('mouseleave', onMouseUp) // Arrêter le glissement si on sort du canvas
  }
  
  // Les événements mouseup doivent être globaux pour capturer le relâchement même en dehors du canvas
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  // Nettoyer les événements du canvas
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousedown', onMouseDown)
    canvasRef.value.removeEventListener('mousemove', onMouseMove)
    canvasRef.value.removeEventListener('wheel', onWheel)
    canvasRef.value.removeEventListener('mouseleave', onMouseUp)
  }
  
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style scoped>

.space-map-container {
  position: relative;
  width: 100vw;
  /* height: calc(100vh - 70px); Soustraire la hauteur de la navigation */
  overflow: hidden;
}

.space-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.loading-overlay, .error-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content, .error-content {
  text-align: center;
  color: white;
  padding: 30px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #FFD700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  margin: 0;
  font-size: 18px;
  color: #E0E0E0;
}

.error-content h3 {
  color: #FF6B6B;
  margin: 0 0 15px 0;
  font-size: 24px;
}

.error-content p {
  color: #E0E0E0;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.retry-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.retry-btn:hover {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}
</style>
