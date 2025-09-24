import { ref } from 'vue'

const accessToken = ref<string | null>(localStorage.getItem('access_token'))

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem('access_token', token)
  } else {
    localStorage.removeItem('access_token')
  }
  accessToken.value = token
}

export function getAccessToken() {
  return accessToken.value
}

export default { accessToken, setAccessToken, getAccessToken }

