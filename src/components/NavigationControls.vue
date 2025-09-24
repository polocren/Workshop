<template>
  <div class="controls">
    <div class="controls-header">
      <h4>Navigation Spatiale</h4>
    </div>
    <div class="controls-content">
      <div class="control-item">
        <PhHandGrabbing :size="20" />

        <p>Clic + glisser pour naviguer dans l'espace</p>
      </div>
      <div class="control-item">
        <PhMouseLeftClick :size="20" />

        <p>Cliquez sur une planète pour voir ses informations</p>
      </div>
      <div class="control-item">
        <PhMouseScroll :size="20" />

        <p>Molette de souris pour zoomer</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pas de logique nécessaire pour ce composant d'affichage
</script>

<style scoped>
.controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 280px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.controls-header {
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 10px;
}

.controls-header h4 {
  margin: 0;
  font-size: 16px;
}

.controls-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.control-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.control-item p {
  margin: 0;
  font-size: 14px;
  line-height: 1.3;
  color: #E0E0E0;
}

/* Responsive design */
@media (max-width: 768px) {
  .controls {
    bottom: 10px;
    left: 10px;
    right: 10px;
    min-width: auto;
    padding: 15px;
  }
  
  .control-item {
    gap: 8px;
  }
  
  .control-item p {
    font-size: 13px;
  }
  
  .control-icon {
    font-size: 16px;
    width: 20px;
  }
}
</style>
