import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'catalog',
      component: () => import('./pages/Catalog.vue'),
    },
    {
      path: '/planet/:id',
      name: 'planet-details',
      component: () => import('./pages/Planet.vue'),
      props: true,
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('./pages/Cart.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('./pages/Login.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
