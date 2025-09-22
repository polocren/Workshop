<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  planets: {
    type: Array,
    default: () => [],
  },
  activePlanetId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select'])

const container = ref(null)

let scene
let camera
let renderer
let animationFrameId
let resizeObserver

const planetEntries = ref([])
const centralBodies = []
const textureLoader = new THREE.TextureLoader()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let hoverPlanetId = null

const starLayers = []

const buildStarfield = () => {
  const layers = [
    { count: 900, spread: 320, size: 1, opacity: 0.25 },
    { count: 700, spread: 280, size: 1.4, opacity: 0.2 },
  ]

  layers.forEach((layer, index) => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    for (let i = 0; i < layer.count; i += 1) {
      const radius = THREE.MathUtils.randFloat(60, layer.spread)
      const angle = Math.random() * Math.PI * 2
      const y = THREE.MathUtils.randFloatSpread(40)
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      positions.push(x, y, z)
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: layer.size,
      transparent: true,
      opacity: layer.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const stars = new THREE.Points(geometry, material)
    stars.userData = { speedFactor: 0.006 + index * 0.01 }
    scene.add(stars)
    starLayers.push(stars)
  })
}

const createSun = () => {
  const sunGroup = new THREE.Group()

  const sunGeometry = new THREE.SphereGeometry(16, 64, 64)
  const sunMaterial = new THREE.MeshStandardMaterial({
    emissive: new THREE.Color(0xff9f43),
    emissiveIntensity: 2.6,
    color: 0xffebc6,
    roughness: 0.3,
    metalness: 0.1,
  })
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial)
  sunGroup.add(sunMesh)

  const glowGeometry = new THREE.SphereGeometry(22, 48, 48)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb86c,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
  sunGroup.add(new THREE.Mesh(glowGeometry, glowMaterial))

  scene.add(sunGroup)
  centralBodies.push(sunGroup)
}

const seededRand = (seed) => {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return (h >>> 0) / 4294967295
}

const orbitPalette = [
  0x7645d8,
  0x5e7bff,
  0xff6ea9,
  0x39c5ff,
]

const buildPlanets = () => {
  planetEntries.value.forEach((entry) => {
    scene.remove(entry.group)
    entry.geometry.dispose()
    entry.material.dispose()
    if (entry.orbit) {
      entry.orbit.geometry.dispose()
      entry.orbit.material.dispose()
    }
  })
  planetEntries.value = []

  const baseRadius = 36
  const radiusSpacing = 14

  props.planets.forEach((planet, index) => {
    const orbitRadius = baseRadius + radiusSpacing * index
    const planetScale = 5 + seededRand(`${planet.id}-scale`) * 5
    const speed = 0.08 + seededRand(`${planet.id}-speed`) * 0.22
    const phase = seededRand(`${planet.id}-phase`) * Math.PI * 2

    const geometry = new THREE.SphereGeometry(planetScale, 64, 64)
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL((index / props.planets.length + 0.68) % 1, 0.55, 0.6),
      roughness: 0.45,
      metalness: 0.25,
      emissive: new THREE.Color(0x293663).multiplyScalar(0.35),
      emissiveIntensity: 0.9,
    })

    if (planet.image) {
      textureLoader.load(
        planet.image,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          material.map = texture
          material.needsUpdate = true
        },
        undefined,
        () => {},
      )
    }

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(Math.cos(phase) * orbitRadius, 0, Math.sin(phase) * orbitRadius)

    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.4, orbitRadius + 0.4, 256)
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: orbitPalette[index % orbitPalette.length],
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
    orbit.rotation.x = Math.PI / 2

    const group = new THREE.Group()
    group.add(orbit)
    group.add(mesh)

    group.userData = {
      planet,
      mesh,
      orbitRadius,
      speed,
      angle: phase,
      baseScale: planetScale,
    }

    scene.add(group)

    planetEntries.value.push({ group, mesh, material, geometry, orbit })
  })
}

const updateCamera = () => {
  if (!container.value || !camera) return
  const { clientWidth, clientHeight } = container.value
  const aspect = clientWidth / clientHeight
  const frustum = 220
  camera.left = (-frustum * aspect) / 2
  camera.right = (frustum * aspect) / 2
  camera.top = frustum / 2
  camera.bottom = -frustum / 2
  camera.updateProjectionMatrix()
}

const updateRenderer = () => {
  if (!renderer || !container.value) return
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

const clock = new THREE.Clock()

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  const elapsed = clock.getDelta()

  planetEntries.value.forEach(({ group, mesh }) => {
    const data = group.userData
    data.angle += elapsed * data.speed
    const x = Math.cos(data.angle) * data.orbitRadius
    const z = Math.sin(data.angle) * data.orbitRadius
    mesh.position.set(x, 0, z)
    mesh.rotation.y += elapsed * 0.35

    const targetScale = data.planet.id === hoverPlanetId || data.planet.id === props.activePlanetId ? 1.2 : 1
    mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08)
  })

  starLayers.forEach((layer) => {
    layer.rotation.z += layer.userData.speedFactor * elapsed
  })

  centralBodies.forEach((body) => {
    body.rotation.z += elapsed * 0.045
  })

  renderer.render(scene, camera)
}

const setupScene = () => {
  if (!container.value) return

  scene = new THREE.Scene()

  const { clientWidth, clientHeight } = container.value
  const aspect = clientWidth / clientHeight
  const frustum = 220
  camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    -500,
    1000,
  )
  camera.position.set(0, 220, 0)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x060715, 1)
  renderer.setSize(clientWidth, clientHeight)
  container.value.appendChild(renderer.domElement)

  const ambient = new THREE.AmbientLight(0xbcd4ff, 0.55)
  scene.add(ambient)

  const sunLight = new THREE.PointLight(0xffa95b, 2.6, 700)
  scene.add(sunLight)

  buildStarfield()
  createSun()
  buildPlanets()
  updateCamera()
  updateRenderer()
  animate()

  resizeObserver = new ResizeObserver(() => {
    updateCamera()
    updateRenderer()
  })
  resizeObserver.observe(container.value)

  renderer.domElement.addEventListener('pointermove', handlePointerMove)
  renderer.domElement.addEventListener('click', handleClick)
}

const disposeScene = () => {
  cancelAnimationFrame(animationFrameId)
  if (resizeObserver && container.value) resizeObserver.disconnect()

  if (renderer) {
    renderer.domElement.removeEventListener('pointermove', handlePointerMove)
    renderer.domElement.removeEventListener('click', handleClick)
    renderer.dispose()
  }

  planetEntries.value.forEach(({ group, geometry, material, orbit }) => {
    scene.remove(group)
    geometry.dispose()
    material.dispose()
    if (orbit) {
      orbit.geometry.dispose()
      orbit.material.dispose()
    }
  })

  starLayers.forEach((layer) => {
    scene.remove(layer)
    layer.geometry.dispose()
    layer.material.dispose()
  })
  starLayers.length = 0

  centralBodies.forEach((body) => {
    scene.remove(body)
    body.traverse((child) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) child.material.dispose()
    })
  })
  centralBodies.length = 0

  planetEntries.value = []
  scene = null
  camera = null
  renderer = null
}

const planetMeshes = computed(() => planetEntries.value.map((entry) => entry.mesh))

const updateHoverFromIntersections = (event) => {
  if (!renderer || !container.value || planetMeshes.value.length === 0) {
    hoverPlanetId = null
    renderer && (renderer.domElement.style.cursor = 'default')
    return
  }

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(planetMeshes.value, true)

  if (intersects.length > 0) {
    const mesh = intersects[0].object
    const entry = planetEntries.value.find((item) => item.mesh === mesh)
    hoverPlanetId = entry?.group.userData.planet.id ?? null
    renderer.domElement.style.cursor = 'pointer'
  } else {
    hoverPlanetId = null
    renderer.domElement.style.cursor = 'default'
  }
}

const handlePointerMove = (event) => {
  updateHoverFromIntersections(event)
}

const handleClick = (event) => {
  updateHoverFromIntersections(event)
  if (hoverPlanetId) {
    emit('select', hoverPlanetId)
  }
}

watch(
  () => props.planets,
  () => {
    if (!scene) return
    buildPlanets()
  },
  { deep: true },
)

watch(
  () => props.activePlanetId,
  (value) => {
    hoverPlanetId = value
  },
)

onMounted(() => {
  setupScene()
  renderer.domElement.addEventListener('pointermove', handlePointerMove)
  renderer.domElement.addEventListener('click', handleClick)
})

onBeforeUnmount(() => {
  disposeScene()
})
</script>

<template>
  <div ref="container" class="solar-system-container"></div>
</template>

<style scoped>
.solar-system-container {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 48px;
  overflow: hidden;
  border: 1px solid rgba(76, 110, 245, 0.45);
  box-shadow: inset 0 0 40px rgba(15, 23, 42, 0.8), 0 40px 120px rgba(0, 0, 0, 0.55);
  background: radial-gradient(circle at 50% 35%, rgba(255, 123, 72, 0.25), transparent 55%),
    radial-gradient(circle at 50% 65%, rgba(88, 111, 255, 0.22), transparent 60%),
    #050818;
}

canvas {
  border-radius: inherit;
}
</style>
