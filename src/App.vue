<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainNavigation from './components/MainNavigation.vue'
import AppFooter from './components/AppFooter.vue'
import ToastHost from './components/ToastHost.vue'

const route = useRoute()

// Afficher le footer seulement sur les pages autres que la map (accueil)
const showFooter = computed(() => route.path !== '/')
</script>

<template>
    <MainNavigation />
    <main class="main-content">
      <transition name="fade-slide" mode="out-in">
        <router-view />
      </transition>
    </main>
    <ToastHost />
    <AppFooter v-if="showFooter" />
</template>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    min-height: 100vh;
    overflow-x: hidden;
  }

  #app {
    min-height: 100vh;
    color: #fff;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    /* espace pour la navigation fixe */
    flex: 1;
    min-height: 100vh;
  }

  ul {
    li {
      list-style: none;
    }
  }

  /* Scrollbar personnalisée */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  /* Page transitions */
  .fade-slide-enter-from { opacity: 0; transform: translateY(8px) }
  .fade-slide-leave-to { opacity: 0; transform: translateY(-8px) }
  .fade-slide-enter-active, .fade-slide-leave-active { transition: all .25s ease }
</style>
