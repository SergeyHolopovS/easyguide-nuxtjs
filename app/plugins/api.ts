// Клиент бэкенда: базовый URL из runtimeConfig + JWT из cookie
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token')
  const user = useState('auth_user')

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (token.value) {
        options.headers.set('Authorization', `Bearer ${token.value}`)
      }
    },
    // Токен просрочен или невалиден — сбрасываем сессию
    onResponseError({ response }) {
      if (response.status === 401 && token.value) {
        token.value = null
        user.value = null
      }
    }
  })

  return { provide: { api } }
})
