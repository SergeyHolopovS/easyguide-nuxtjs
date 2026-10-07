import type { AuthResponse } from '~/types/api'

// Эти запросы сами выдают или отзывают токены — их не обновляем и не повторяем
const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout']

// Клиент бэкенда: базовый URL из runtimeConfig + JWT из cookie.
// При 401 один раз обновляет пару токенов по refresh-токену и повторяет запрос
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { accessToken, refreshToken, setSession, clearSession } = useAuthSession()

  const request = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (accessToken.value) {
        options.headers.set('Authorization', `Bearer ${accessToken.value}`)
      }
    }
  })

  // Refresh-токен одноразовый, а повторное использование завершает все сессии пользователя,
  // поэтому параллельные запросы ждут одно обновление
  let refreshing: Promise<boolean> | null = null

  function refreshTokens() {
    refreshing ??= withRefreshLock(doRefresh).finally(() => {
      refreshing = null
    })
    return refreshing
  }

  async function doRefresh() {
    // Другая вкладка могла уже обновить пару — тогда берём её токены из cookie, а старый не тратим
    if (import.meta.client) {
      const used = refreshToken.value
      refreshCookie('auth_refresh')
      if (refreshToken.value && refreshToken.value !== used) {
        refreshCookie('auth_token')
        return true
      }
    }

    if (!refreshToken.value) return false

    try {
      setSession(await $fetch<AuthResponse>('/api/auth/refresh', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: { refreshToken: refreshToken.value }
      }))
      return true
    } catch (error) {
      // Refresh-токен отозван или истёк — выходим; при сбое сети или сервера сессию сохраняем
      if (isHttpError(error) && error.statusCode < 500) clearSession()
      return false
    }
  }

  // Вкладки браузера обновляют токены по очереди
  function withRefreshLock(task: () => Promise<boolean>) {
    if (import.meta.client && navigator.locks) {
      return navigator.locks.request('easyguide-auth-refresh', task)
    }
    return task()
  }

  type ApiOptions = Parameters<typeof request>[1]

  async function api<T = unknown>(url: string, options?: ApiOptions): Promise<T> {
    const usedToken = accessToken.value
    try {
      return await request<T>(url, options)
    } catch (error) {
      if (!isHttpError(error) || error.statusCode !== 401 || AUTH_ENDPOINTS.includes(url)) throw error

      // Пока запрос шёл, токен уже обновили — просто повторяем
      if (accessToken.value && accessToken.value !== usedToken) return request<T>(url, options)

      if (await refreshTokens()) return request<T>(url, options)
      throw error
    }
  }

  return { provide: { api } }
})
