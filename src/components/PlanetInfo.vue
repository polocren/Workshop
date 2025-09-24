<template>
	<div v-if="planet" class="planet-info">
    <div class="content glass">
      <div class="modern-header">
        <div class="avatar ring">
          <img :src="planet.image || '/images/planets/default.svg'" :alt="planet.name" />
        </div>
        <div class="title-block">
          <h3>{{ planet.name }}</h3>
          <span class="type-badge">{{ planet.type }}</span>
        </div>
        <span v-if="planet.isAvailable === false" class="status-badge">Vendue</span>
      </div>
			
      <div class="planet-details modern-grid">
        <div class="detail-item">
          <strong>Distance du Soleil</strong>
          <span>{{ planet.distance }}</span>
        </div>
        <div class="detail-item">
          <strong>Diamètre</strong>
          <span>{{ planet.diameter }}</span>
        </div>
      </div>
			
      <div class="planet-description">
        <p>{{ planet.description }}</p>
      </div>

			<!-- Achat -->
      <div class="buy-section">
        <div v-if="planet.isAvailable !== false" class="buy-box card glow">
          <div class="price-card">
            <div class="label">Prix</div>
            <div class="value">{{ displayPrice }}</div>
          </div>

          <div v-if="!isLogged" class="login-inline">
            <div class="fields">
              <input v-model="email" type="email" placeholder="Email" class="input" />
              <input v-model="password" type="password" placeholder="Mot de passe" class="input" />
            </div>
            <button @click="onLogin" class="btn-primary btn">Se connecter</button>
          </div>

          <div v-else class="actions">
            <button @click="addToCart" class="btn btn-secondary">Ajouter au panier</button>
            <button @click="onBuy" class="btn btn-primary">Acheter maintenant</button>
          </div>

          <div v-if="buyError" class="buy-error">{{ buyError }}</div>
          <div v-if="buySuccess" class="buy-success">Félicitations, vous avez acheté cette planète !</div>
        </div>
        <div v-else class="sold">Déjà vendue</div>
      </div>
			
			<button @click="$emit('close')" class="close-btn">Fermer</button>
		</div>
	</div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { Planet } from '../types/Planet'
  import authAPI from '../services/authAPI'
  import purchaseAPI from '../services/purchaseAPI'
  import session from '../services/session'
  import toast from '../services/toast'

	// Props
	const props = defineProps<{
		planet: Planet | null
	}>()

	// Events
	defineEmits<{
		close: []
	}>()

  // Session
  const getToken = () => session.getAccessToken()
  const isLogged = computed(() => !!session.accessToken.value)

  // Local state
  const email = ref('')
  const password = ref('')
  const buyError = ref<string | null>(null)
  const buySuccess = ref(false)
  // Simplification: pas de certificat ici, juste une validation visible

  const displayPrice = computed(() => {
    const p = props.planet as Planet | null
    const price = Number(p?.price ?? 0)
    return `${price.toFixed(2)} ¤`
  })

  // Panier
  import { cart } from '../services/cart'
  function addToCart() {
    if (props.planet) cart.add(props.planet)
  }

  async function onLogin() {
    buyError.value = null
    buySuccess.value = false
    try {
      const res = await authAPI.login(email.value, password.value)
      if (!res.success) throw new Error(res.error || 'Login échoué')
      const access = res.data?.session?.access_token
      if (!access) throw new Error('Token manquant')
      session.setAccessToken(access)
    } catch (e: any) {
      buyError.value = e.message || 'Login échoué'
    }
  }

  async function onBuy() {
    buyError.value = null
    buySuccess.value = false
    try {
      const t = getToken()
      if (!t) throw new Error('Veuillez vous connecter')
      const p = props.planet as Planet | null
      if (!p) throw new Error('Aucune planète sélectionnée')
      const res = await purchaseAPI.buyPlanet(p.id, t)
      if (!res.success) throw new Error(res.error || 'Achat échoué')
      buySuccess.value = true
      // Pas de dépendance au certificat PDF
      // Répercuter immédiatement l'état d'indisponibilité dans l'UI
      ;(props.planet as any).isAvailable = false
      toast.success('Planète bien achetée !')
    } catch (e: any) {
      buyError.value = e.message || 'Achat échoué'
      toast.error(buyError.value)
    }
  }

  // (suppression du téléchargement de certificat pour simplifier l'expérience)
</script>

<style scoped>
	.planet-info {
		display: flex;
		justify-content: center;
		align-items: center;

		background: rgba(0, 0, 0, 0.8);

		position: fixed;
		inset: 0;
		z-index: 10;

		animation: fadeIn 0.3s ease-out;

		.content {
			max-width: 500px;
			width: 90%;

			background: rgba(0, 0, 0, 0.9);
			border-radius: 5px;
			border: .5px solid rgba(255, 255, 255, 0.2);

			color: white;
			
			animation: slideIn 0.4s ease-out;

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
						font-size: 2em;
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
	}

	.planet-details, .planet-description {
		display: flex;

		.detail-item, p {
			flex: 1;

			background: rgba(255, 255, 255, 0.05);
			padding: 10px 20px;
			border: .5px solid rgba(255, 255, 255, 0.1);

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

	.close-btn {
		width: 100%;

		padding: 12px 30px;

		background-color: transparent;
		border: none;
		border-top: .5px solid rgba(255, 255, 255, 0.2);

		color: white;
		font-size: 16px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;

		transition: all 0.3s ease;

		cursor: pointer;

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.close-btn:active {
		transform: translateY(0);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.planet-header {
			flex-direction: column;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(50px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

  .buy-section { padding: 16px 20px 22px; }
  .buy-box { border: 1px solid var(--panel-border); padding: 16px; border-radius: 16px; background: var(--panel) }
  .price-card { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,.06); border:1px solid var(--panel-border) }
  .price-card .label { color: var(--muted); font-size:.8rem; letter-spacing:.5px; text-transform:uppercase }
  .price-card .value { color:#fff; font-weight:800; font-size:1.1rem }

  .login-inline { display:flex; align-items:flex-start; gap:10px; flex-wrap: wrap; }
  .fields { display:flex; gap:10px; flex:1; min-width: 220px; }
  .input { flex:1; min-width: 140px; padding:12px 12px; border-radius:10px; 
           border:1px solid rgba(255,255,255,0.18); background: rgba(0,0,0,0.35); color:#fff }
  .input::placeholder { color: rgba(255,255,255,0.6) }

  .btn { border-radius:12px }
  .btn-primary { margin-top:4px; padding:12px 14px; border:none; border-radius:12px; cursor:pointer; color:#0a0a0a; font-weight:800; background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%); box-shadow: 0 6px 18px rgba(120,255,214,0.25) }
  .btn-primary:hover { filter: brightness(1.05) }
  .actions { display:flex; justify-content:flex-end }
  .buy-error { color: #FF6B6B; margin-top:10px }
  .buy-success { color: #8BC34A; margin-top:10px }
  .sold { color:#FFA000; padding: 8px 20px; font-weight:600 }

  /* Modern header */
  .modern-header { display:flex; align-items:center; gap:14px; padding:16px; border-bottom:1px solid var(--panel-border); background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0)) }
  .avatar { width:64px; height:64px; border-radius:50%; overflow:hidden; position:relative }
  .ring::after{ content:''; position:absolute; inset:-6px; border-radius:50%; background: conic-gradient(from 0deg, var(--accent), var(--accent-2)); filter: blur(6px); opacity:.35 }
  .avatar img{ width:100%; height:100%; object-fit:cover }
  .title-block h3{ margin:0; font-size:1.6rem; font-weight:800 }
  .type-badge{ display:inline-block; margin-top:4px; padding:4px 10px; border-radius:999px; background: rgba(255,255,255,.1); color: var(--muted); font-size:.8rem }
  .status-badge{ margin-left:auto; padding:6px 10px; border-radius:999px; background: #ffb3b3; color:#380000; font-weight:800; font-size:.8rem }
</style>
