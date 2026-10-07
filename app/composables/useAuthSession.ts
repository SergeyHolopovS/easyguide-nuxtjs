import type { AuthResponse, UserResponse } from '~/types/api'

// Срок жизни refresh-токена бэкенд не сообщает; если он истечёт раньше, /api/auth/refresh вернёт 401
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

interface AuthSession {
  accessToken: Ref<string | null>
  refreshToken: Ref<string | null>
  user: Ref<UserResponse | null>
  setSession: (response: AuthResponse) => void
  clearSession: () => void
}

// Одна пара cookie-ref на приложение (на сервере — на запрос): копии useCookie
// с одним именем на сервере не синхронизируются, и плагин с useAuth расходились бы
const sessions = new WeakMap<object, AuthSession>()

export function useAuthSession(): AuthSession {
  const nuxtApp = useNuxtApp()
  const existing = sessions.get(nuxtApp)
  if (existing) return existing

  // Access-токен живёт 15 минут, но cookie держим дольше: просроченный токен обновится по refresh
  const cookieOptions = { maxAge: REFRESH_COOKIE_MAX_AGE, sameSite: 'lax' as const }
  const accessToken = useCookie<string | null>('auth_token', cookieOptions)
  const refreshToken = useCookie<string | null>('auth_refresh', cookieOptions)
  const user = useState<UserResponse | null>('auth_user', () => null)

  const session: AuthSession = {
    accessToken,
    refreshToken,
    user,
    setSession(response) {
      accessToken.value = response.token
      refreshToken.value = response.refreshToken
      user.value = response.user
    },
    clearSession() {
      accessToken.value = null
      refreshToken.value = null
      user.value = null
    }
  }

  sessions.set(nuxtApp, session)
  return session
}
