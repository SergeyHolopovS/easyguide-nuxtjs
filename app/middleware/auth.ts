// Пускает на страницу только с токеном, иначе — на вход с возвратом обратно
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo({ path: '/signin', query: { redirect: to.fullPath } })
  }
})
