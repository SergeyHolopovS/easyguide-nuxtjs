import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, UserResponse } from '~/types/api'

export function useAuth() {
  const { $api } = useNuxtApp()
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax'
  })
  const user = useState<UserResponse | null>('auth_user', () => null)

  const isAuthenticated = computed(() => !!token.value)

  function setSession(response: AuthResponse) {
    token.value = response.token
    user.value = response.user
  }

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

  function logout() {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, register, login, fetchUser, updateProfile, logout }
}
