<template>
    <nav>
        <div class="content">
            <!-- Logo/Titre -->
            <router-link 
                to="/" 
                class="brand-link"
                @click="closeMenu"
            >
                <PhPlanet :size="32" />

                <span>SpaceShop</span>
            </router-link>

            <!-- Menu de navigation -->
            <ul class="nav-menu" :class="{ 'is-active': isMenuOpen }">
                <li>
                    <router-link 
                        to="/" 
                        class="nav-link"
                        :class="{ 'is-active': $route.path === '/' }"
                        @click="closeMenu"
                    >
                        <PhMapTrifold :size="15" />


                        <span>Carte 3D</span>
                    </router-link>
                </li>
                
                <!-- Catalogue optionnel: garder un lien vers la liste -->
                <li>
                    <router-link 
                        to="/planets" 
                        class="nav-link"
                        :class="{ 'is-active': $route.path.startsWith('/planets') }"
                        @click="closeMenu"
                    >
                        <span>Catalogue</span>
                    </router-link>
                </li>
                <li>
                    <router-link 
                        to="/cart" 
                        class="nav-link"
                        :class="{ 'is-active': $route.path.startsWith('/cart') }"
                        @click="closeMenu"
                    >
                        <span>Panier ({{ cartCount }})</span>
                    </router-link>
                </li>
                
                <li>
                    <router-link 
                        v-if="!isLogged"
                        to="/login" 
                        class="nav-link"
                        @click="closeMenu"
                    >
                        <span>Connexion</span>
                    </router-link>
                    <button 
                        v-else 
                        class="nav-link nav-cta" 
                        @click="logout"
                    >
                        <span>Déconnexion</span>
                    </button>
                </li>
            </ul>

            <!-- Bouton menu mobile -->
            <button 
                class="nav-toggle"
                @click="toggleMenu"
                :class="{ 'is-active': isMenuOpen }"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import session from '../services/session'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

import { cart } from '../services/cart'
const isLogged = computed(() => !!session.accessToken.value)
const cartCount = computed(() => cart.count.value)
function logout() {
  session.setAccessToken(null)
}
</script>

<style scoped>
    nav {
        width: 100vw;
        padding: 10px;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10;
    }

    .content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        height: 75px;

        padding: 0 20px;

        background: var(--panel);
        border-radius: 14px;
        backdrop-filter: blur(15px);
        border: 1px solid var(--panel-border);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    }

    /* Brand */
    .brand-link {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        font-weight: bold;
        text-decoration: none;
        color: white;
        transition: all 0.2s ease;
    }

    .brand-link:hover {
        color: #87CEEB;
        transform: scale(1.05);
    }

    .brand-icon {
        font-size: 1.8rem;
    }

    /* Menu */
    .nav-menu {
        display: flex;
        flex-direction: row;
        gap: 15px;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        color: var(--text);
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.2s ease;
        font-weight: 500;
        position: relative;
    }

    .nav-link:hover {
        color: var(--text);
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-1px);
    }

    .nav-link.is-active {
        color: var(--text);
        background: rgba(255, 255, 255, 0.12);
    }

    .nav-link.is-active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: #87CEEB;
        border-radius: 1px;
    }

    /* Bouton CTA */
    .nav-cta {
        background: linear-gradient(135deg, var(--accent), var(--accent-2)) !important;
        color: #0a0a0a !important;
        margin-left: 8px;
    }

    .nav-cta:hover {
        filter: brightness(1.05) !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(120, 255, 214, 0.25);
    }

    /* Bouton menu mobile */
    .nav-toggle {
        display: none;
        flex-direction: column;
        justify-content: space-around;
        width: 30px;
        height: 30px;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
    }

    .nav-toggle span {
        width: 100%;
        height: 3px;
        background: #fff;
        border-radius: 2px;
        transition: all 0.3s ease;
        transform-origin: center;
    }

    .nav-toggle.is-active span:nth-child(1) {
        transform: rotate(45deg) translate(7px, 7px);
    }

    .nav-toggle.is-active span:nth-child(2) {
        opacity: 0;
    }

    .nav-toggle.is-active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -7px);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .content {
            padding: 0 15px;
        }
        
        .nav-toggle {
            display: flex;
        }
        
        .nav-menu {
            position: fixed;
            top: 120px;
            left: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            flex-direction: column;
            align-items: stretch;
            padding: 20px;
            gap: 5px;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .nav-menu.is-active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .nav-link {
            justify-content: center;
            padding: 15px 20px;
            font-size: 1.1rem;
        }
        
        .nav-cta {
            margin-left: 0;
            margin-top: 10px;
        }
    }

    @media (max-width: 480px) {
        .content {
            padding: 0 10px;
            height: 80px;
        }
        
        .brand-link {
            font-size: 1.3rem;
        }
        
        .brand-icon {
            font-size: 1.5rem;
        }
        
        .nav-menu {
            top: 100px;
        }
    }
</style>
