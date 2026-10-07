import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, UserResponse } from '~/types/api'

export function useAuth() {
  const { $api } = useNuxtApp()
  const { accessToken: token, refreshToken, user, setSession, clearSession } = useAuthSession()

  // Просроченный access-токен не мешает: первый же запрос обновит его по refresh-токену
  const isAuthenticated = computed(() => !!token.value || !!refreshToken.value)

  async function register(payload: RegisterRequest) {
    const response = await $api<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: payload
    })
    setSession(response)
    return response.user
  }

  async function login(payload: LoginRequest) {
    const response = await $api<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: payload
    })
    setSession(response)
    return response.user
  }

  async function fetchUser() {
    user.value = await $api<UserResponse>('/api/auth/me')
    return user.value
  }

  async function updateProfile(payload: UpdateProfileRequest) {
    user.value = await $api<UserResponse>('/api/users/me', {
      method: 'PATCH',
      body: payload
    })
    return user.value
  }

  // Бэкенд требует заполненные bio, city и хотя бы один язык; для гида вызов ничего не меняет
  async function becomeGuide() {
    user.value = await $api<UserResponse>('/api/users/me/become-guide', { method: 'POST' })
    return user.value
  }

  // Профиль по токену из cookie: общий ключ, чтобы шапка и страницы не грузили его дважды.
  // При 401 плагин уже попробовал обновить токены и, если не вышло, сбросил сессию
  function loadUser() {
    return useAsyncData('auth-user', async () => {
      if (!isAuthenticated.value || user.value) return user.value
      try {
        return await fetchUser()
      } catch {
        return null
      }
    }, { watch: [isAuthenticated] })
  }

  // Отзываем refresh-токен на бэкенде; выходим локально, даже если запрос не прошёл
  async function logout() {
    const pending = refreshToken.value
    clearSession()
    if (!pending) return
    try {
      await $api('/api/auth/logout', { method: 'POST', body: { refreshToken: pending } })
    } catch {
      // Access-токен истечёт сам, а отозвать refresh можно будет только повторным входом
    }
  }

  return { token, user, isAuthenticated, register, login, fetchUser, updateProfile, becomeGuide, loadUser, logout }
}
