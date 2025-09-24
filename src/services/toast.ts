import { ref } from 'vue'

export type ToastKind = 'success' | 'error' | 'info'
export type Toast = { id: number; kind: ToastKind; message: string; timeout?: number }

const toasts = ref<Toast[]>([])
let nextId = 1

function push(kind: ToastKind, message: string, timeout = 3000) {
  const id = nextId++
  toasts.value.push({ id, kind, message, timeout })
  if (timeout > 0) {
    setTimeout(() => remove(id), timeout)
  }
}

function remove(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export default {
  toasts,
  remove,
  success(msg: string, timeout?: number) { push('success', msg, timeout) },
  error(msg: string, timeout?: number) { push('error', msg, timeout) },
  info(msg: string, timeout?: number) { push('info', msg, timeout) },
}

