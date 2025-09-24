<template>
  <footer class="app-footer">
    <div class="footer-content">
      <!-- Nom du site -->
      <div class="footer-brand">
        <h3>SpaceShop</h3>
        <p>Explorez l'univers en 3D</p>
      </div>

      <!-- Navigation rapide -->
      <div class="footer-nav">
        <h4>Navigation</h4>
        <ul class="footer-links">
          <li>
            <router-link to="/" class="footer-link">
              <PhMapTrifold :size="16" />
              <span>Carte 3D</span>
            </router-link>
          </li>
          <li>
            <router-link to="/planets" class="footer-link">
              <PhList :size="16" />
              <span>Catalogue</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Copyright -->
    <div class="footer-bottom">
      <p>&copy; 2025 SpaceMap - Système Solaire Interactif</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { PhMapTrifold, PhList, PhPlus } from '@phosphor-icons/vue'
</script>

<style scoped>
.app-footer {
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 40px;
  padding: 40px 20px 20px;
  backdrop-filter: blur(10px);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: start;
}

/* Marque du site */
.footer-brand {
  text-align: center;
}

.footer-brand h3 {
  color: #fff;
  font-size: 1.8rem;
  margin-bottom: 8px;
  font-weight: 700;
}

.footer-brand p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

/* Navigation du footer */
.footer-nav h4 {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.footer-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.footer-link.router-link-active {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

/* Copyright */
.footer-bottom {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }
  
  .footer-nav {
    align-self: center;
  }
  
  .footer-links {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .footer-link {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .app-footer {
    padding: 30px 15px 15px;
  }
  
  .footer-brand h3 {
    font-size: 1.5rem;
  }
  
  .footer-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>
