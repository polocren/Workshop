<template>
  <div class="toast-host" aria-live="polite" aria-atomic="true">
    <div 
      v-for="t in toasts" 
      :key="t.id" 
      class="toast" 
      :class="t.kind"
      @click="remove(t.id)"
      role="status"
    >
      {{ t.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import toastSvc from '../services/toast'
const toasts = toastSvc.toasts
const remove = toastSvc.remove
</script>

<style scoped>
.toast-host {
  position: fixed;
  top: 90px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
}
.toast {
  min-width: 220px;
  max-width: 360px;
  color: #0a0a0a;
  font-weight: 700;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  user-select: none;
}
.toast.success { background: linear-gradient(135deg, #78ffd6 0%, #a8ff78 100%); }
.toast.error { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.toast.info { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
</style>

