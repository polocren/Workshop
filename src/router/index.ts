import { createRouter, createWebHistory } from 'vue-router'
import SpaceMap from '../components/SpaceMap.vue'
import PlanetList from '../components/PlanetList.vue'
import PlanetForm from '../components/PlanetForm.vue'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import Cart from '../components/Cart.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: SpaceMap,
    meta: {
      title: 'Carte de l\'espace 3D'
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { title: 'Panier' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Connexion' }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { title: 'Créer un compte' }
  },
  {
    path: '/planets',
    name: 'PlanetList',
    component: PlanetList,
    meta: {
      title: 'Catalogue des planètes'
    }
  },
  {
    // Route de fallback pour les pages non trouvées
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navigation pour mettre à jour le titre de la page
router.beforeEach((to, _from, next) => {
  // Mettre à jour le titre de la page
  if (to.meta.title) {
    document.title = `${to.meta.title} - SpaceMap`
  } else {
    document.title = 'SpaceMap'
  }
  
  next()
})

export default router
