import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PhosphorIcons from "@phosphor-icons/vue"
import './styles/theme.css'

createApp(App).use(router).use(PhosphorIcons).mount('#app')
