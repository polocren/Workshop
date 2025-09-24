<template>
	<div class="planet-list">
		<!-- Header avec titre et bouton d'ajout -->
		<div class="header">
			<h1>Gestion des Planètes</h1>
			<div v-if="isAdmin" class="header-actions">
				<button class="add-btn" @click="navigateToAdd">Ajouter une planète</button>
			</div>
		</div>

		<!-- Barre de recherche -->
		<div class="search-bar">
			<input 
				v-model.trim="searchQuery" 
				type="text" 
				placeholder="Rechercher une planète..."
				class="search-input"
			/>
			
			<button @click="refreshList" class="btn btn-secondary">
				<PhArrowCounterClockwise :size="10" />

				Actualiser
			</button>
		</div>

		<!-- Messages d'état -->
		<div v-if="loading" class="loading">
			<div class="spinner"></div>
			Chargement des planètes...
		</div>

		<div v-if="error" class="error">
			<p>{{ error }}</p>
			<button @click="loadPlanets" class="btn btn-secondary">Réessayer</button>
		</div>

		<!-- Liste des planètes -->
		<div v-if="!loading && !error" class="planets-grid">
			<div 
				v-for="planet in filteredPlanets" 
				:key="planet.id" 
				class="planet-card"
			>
				<div class="planet-header">
					<!-- Image de la planète -->
					<div class="planet-image">
						<img 
							:src="planet.image || '/images/planets/default.svg'" 
							:alt="planet.name"
							loading="lazy"
							decoding="async"
							@error="handleImageError"
						/>
					</div>

					<div class="planet-title">
						<h3>{{ planet.name }}</h3>
						<span class="planet-type">{{ planet.type }}</span>
					</div>
				</div>

				<!-- Informations de la planète -->
				<div class="planet-details">
					<div class="detail-item"><strong>Distance :</strong> <span>{{ planet.distance }}</span></div>
					<div class="detail-item"><strong>Diamètre :</strong> <span>{{ planet.diameter }}</span></div>
					<div class="detail-item"><strong>Composition :</strong> <span>{{ planet.composition }}</span></div>
					<div class="detail-item"><strong>Position :</strong> <span>({{ planet.position.x.toFixed(1) }}, {{ planet.position.y.toFixed(1) }}, {{ planet.position.z.toFixed(1) }})</span></div>
				</div>
				

				<!-- Actions -->
				<div class="planet-actions">
					<button 
						@click="addToCart(planet)" 
						class="btn-modify"
						:disabled="planet.isAvailable === false"
						title="Ajouter au panier"
					>
						Ajouter au panier
					</button>
					<button 
						@click="viewInSpace(planet)" 
						class="btn-view"
						title="Voir dans l'espace 3D"
					>
						Voir
					</button>
					<!-- Admin actions -->
					<button v-if="isAdmin" @click="editPlanet(planet)">Modifier</button>
					<button v-if="isAdmin" @click="deletePlanet(planet)" class="btn-delete">Supprimer</button>
				</div>
			</div>
		</div>

		<!-- Message si aucune planète -->
		<div v-if="!loading && !error && filteredPlanets.length === 0" class="empty-state">
			<div class="empty-icon">○</div>
			<h3>Aucune planète trouvée</h3>
			<p v-if="searchQuery">
				Aucun résultat pour "{{ searchQuery }}"
			</p>
			<p v-else>
				<span v-if="isAdmin">Commencez par ajouter votre première planète !</span>
				<span v-else>Aucune planète disponible pour le moment.</span>
			</p>
			<button v-if="isAdmin" @click="navigateToAdd" class="btn btn-primary">
				Ajouter une planète
			</button>
		</div>

		<!-- Suppression/modification retirées en mode achat -->
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { cart } from '../services/cart'
import { useRouter } from 'vue-router'
import planetAPI from '../services/planetAPI'
import type { Planet } from '../types/Planet'
import authAPI from '../services/authAPI'
import session from '../services/session'
import toast from '../services/toast'

const router = useRouter()

// État réactif
const planets = ref<Planet[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const debouncedQuery = ref('')
const isAdmin = ref(false)

// Planètes filtrées selon la recherche
const filteredPlanets = computed(() => {
	if (!debouncedQuery.value) return planets.value
	
	const query = debouncedQuery.value.toLowerCase()
	return planets.value.filter(planet => 
		planet.name.toLowerCase().includes(query) ||
		planet.type.toLowerCase().includes(query)
	)
})

// Charger les planètes
const loadPlanets = async () => {
	loading.value = true
	error.value = ''
	
	try {
		const data = await planetAPI.getAllPlanets()
		planets.value = data
	} catch (err) {
		console.error('Erreur lors du chargement des planètes:', err)
		error.value = 'Impossible de charger les planètes. Vérifiez votre connexion.'
	} finally {
		loading.value = false
	}
}

// Actualiser la liste
const refreshList = () => {
	loadPlanets()
}

// Admin only helpers
const ADMIN_EMAIL = ((import.meta as any).env?.VITE_ADMIN_EMAIL || 'paulcren@gmail.com').toLowerCase()

async function checkAdmin() {
  try {
    const token = session.getAccessToken()
    if (!token) return
    const res = await authAPI.me(token)
    const email = res?.data?.email?.toLowerCase?.()
    isAdmin.value = !!email && email === ADMIN_EMAIL
  } catch (e) {
    isAdmin.value = false
  }
}

const navigateToAdd = () => router.push('/planets/new')
const editPlanet = (planet: Planet) => router.push(`/planets/${planet.id}/edit`)
async function deletePlanet(planet: Planet) {
  try {
    const ok = window.confirm(`Supprimer la planète "${planet.name}" ?`)
    if (!ok) return
    await planetAPI.deletePlanet(planet.id)
    toast.success('Planète supprimée')
    await loadPlanets()
  } catch (e: any) {
    toast.error(e?.message || 'Suppression impossible')
  }
}
// Voir la planète dans l'espace 3D
const viewInSpace = (planet: any) => {
	// Stocker la planète sélectionnée et naviguer vers la carte 3D
	sessionStorage.setItem('selectedPlanetId', planet.id)
	router.push('/')
}

// Gestion des erreurs d'image
const handleImageError = (event: Event) => {
	const img = event.target as HTMLImageElement
	img.src = '/images/planets/default.svg'
}

// Initialisation
onMounted(() => {
    loadPlanets()
    checkAdmin()
})

// Debounce recherche
let t: any
watch(searchQuery, (v) => {
  clearTimeout(t)
  t = setTimeout(() => { debouncedQuery.value = v }, 150)
})

// Panier
const addToCart = (planet: Planet) => {
  cart.add(planet)
}
</script>

<style scoped>
.planet-list {
	max-width: 1200px;
	margin: 0 auto;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  margin: 30px 0 16px;
  padding-bottom: 10px;
  padding-top: 70px;

  border-bottom: 1px solid #333;

  h1 {
    color: #fff;
    margin: 0;
    font-size: 2.1rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
  }

  .add-btn {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: .5px solid rgba(255, 255, 255, 0.3);
    border-radius: 5px;
    color: #fff;
    font-size: .875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .add-btn:hover {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
  }
}

/* Barre de recherche */
.search-bar {
	display: flex;
	gap: 15px;
	align-items: center;

	margin-bottom: 30px;

	.search-input {
		flex: 1;
		
		padding: 12px 16px;

		background: rgba(255, 255, 255, 0.1);
		border: .5px solid rgba(255, 255, 255, 0.3);
		border-radius: 5px;
		
		color: #fff;
		font-size: .875rem;

		&:focus {
			outline: none;
			border-color: #4CAF50;
			box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
		}
	}

	button {
		padding: 12px 16px;

		background: rgba(255, 255, 255, 0.1);
		border: .5px solid rgba(255, 255, 255, 0.3);
		border-radius: 5px;
		
		color: #fff;
		font-size: .875rem;

		cursor: pointer;

		transition: all 0.2s ease;

		&:hover {
			outline: none;
			border-color: #4CAF50;
			box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
		}
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}
}

/* États de chargement et erreur */
.loading, .error {
	text-align: center;
	padding: 40px;
	color: #fff;
}

.spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(255, 255, 255, 0.3);
	border-top: 4px solid #4CAF50;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 15px;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.error {
	background: rgba(244, 67, 54, 0.1);
	border: 1px solid rgba(244, 67, 54, 0.3);
	border-radius: 8px;
}

/* Grille des planètes */
.planets-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

/* Cartes des planètes */
.planet-card {
	width: 100%;
	max-width: calc((100% - 20px * 2) / 3);
	
	background: rgba(0, 0, 0, 0.9);
	border: .5px solid rgba(255, 255, 255, 0.1);
	border-radius: 5px;
	transition: all 0.3s ease;

	.planet-header {
		display: flex;
		align-items: center;
		gap: 20px;

		padding: 20px;

		border-bottom: .5px solid rgba(255, 255, 255, 0.2);

		.planet-image {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			
			width: 80px;
			height: 80px;

			border-radius: 50%;

			background: linear-gradient(135deg, rgba(169, 3, 146, 0.1), rgba(255, 255, 255, 0.05));
			border: 1px solid rgba(255, 255, 255, 0.3);
		}

		.planet-image img {
			width: 100%;
			height: 100%;
			object-fit: cover;

			border-radius: 50%;
		}
		
		.planet-title {
			h3 {
				margin: 0 0 5px 0;

				color: #d1d1d1;
				font-size: 1.5em;
				text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
			}

			.planet-type {
				display: inline-block;

				padding: 4px 10px;

				border-radius: 5px;
				background: linear-gradient(135deg, #545454, #274a67);
				
				color: white;
				font-size: 0.8em;
				font-weight: 500;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}
		}
	}
}


.planet-details, .planet-description {
	display: flex;
	flex-direction: column;

	.detail-item, p {
		flex: 1;

		background: rgba(255, 255, 255, 0.05);
		padding: 10px 20px;
		border: .5px solid rgba(255, 255, 255, 0.1);

		&:nth-child(odd) {
			background-color: rgba(11, 11, 11, 0.2);
		}

		strong {
			display: block;
			color: #545454;
			font-size: 0.65em;
			margin-bottom: 0px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}

		span {
			color: #E0E0E0;
			font-size: 1.2em;
			font-weight: 500;
			letter-spacing: -.5px;
		}
	}
}

/* Actions */
.planet-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: .5px solid rgba(255, 255, 255, 0.2);
}

.planet-actions button {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: .78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  transition: all .2s ease;
  cursor: pointer;
  border-right: .5px solid rgba(255, 255, 255, 0.12);
}

.planet-actions button:nth-child(2n) {
  border-right: none;
}

.planet-actions button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.planet-actions .btn-delete:hover {
  color: #FF5252;
  background-color: rgba(255, 82, 82, 0.08);
}

/* État vide */
.empty-state {
	text-align: center;
	padding: 60px 20px;
	color: #fff;
}

.empty-icon {
	font-size: 4rem;
	margin-bottom: 20px;
}

.empty-state h3 {
	margin: 0 0 10px 0;
	color: #fff;
}

.empty-state p {
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: 25px;
}

/* Modal */
.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal {
	background: #1a1a1a;
	border: .5px solid rgba(255, 255, 255, 0.2);
	border-radius: 5px;
	/* padding: 30px; */
	max-width: 400px;
	width: 90%;
	text-align: center;
}

.modal h3 {
	color: #fff;
	/* margin: 0 0 15px 0; */
}

.modal p {
	color: rgba(255, 255, 255, 0.8);
	/* margin-bottom: 15px; */
}

.warning {
	color: #FF9800 !important;
	font-weight: 500;
}

.modal-actions {
	display: flex;
	justify-content: center;

	button {
		flex: 1;

		padding: 12px 30px;

		background-color: transparent;
		border: none;
		border-top: .5px solid rgba(255, 255, 255, 0.2);

		color: white;
		font-size: .8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;

		transition: all 0.3s ease;

		cursor: pointer;

		&.btn-delete {
			&:hover {
				color: #FF5252;
				background-color: rgba(255, 82, 82, 0.1);
			}		
		}

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}
}


/* Responsive */
@media (max-width: 768px) {
	.planet-list {
		padding: 15px;
	}
	
	.header {
		flex-direction: column;
		gap: 15px;
		text-align: center;
	}
	
	.planets-grid {
		grid-template-columns: 1fr;
	}
	
	.search-bar {
		flex-direction: column;
	}
	
    	.planet-actions {
    		flex-wrap: wrap;
    	}
    }

/* (Overrides retirés pour garder la grille et le style existants) */
    </style>
