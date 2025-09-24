import { ref, computed } from 'vue'
import type { Planet } from '../types/Planet'

type CartItem = { planet: Planet }

const key = 'cart_items'
const items = ref<CartItem[]>(load())

function load(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

function persist() {
  localStorage.setItem(key, JSON.stringify(items.value))
}

export const cart = {
  items,
  count: computed(() => items.value.length),
  total: computed(() => items.value.reduce((sum, it) => sum + Number(it.planet.price ?? 0), 0)),
  add(planet: Planet) {
    if (items.value.find(i => i.planet.id === planet.id)) return
    items.value.push({ planet })
    persist()
  },
  remove(id: string) {
    items.value = items.value.filter(i => i.planet.id !== id)
    persist()
  },
  clear() {
    items.value = []
    persist()
  },
  ids(): string[] { return items.value.map(i => i.planet.id) }
}

export default cart

