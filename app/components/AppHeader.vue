<template>
  <header class="w-screen border-b border-gray flex items-center justify-center">
    <div class="max-w-300 w-full px-2 py-2 flex items-center justify-between">
      <NuxtLink href="/" class="font-extrabold text-black text-2xl">EasyGuide</NuxtLink>
      <div class="flex items-center gap-4">
        <template v-if="isAuthenticated">
          <template v-if="user?.isGuide">
            <NuxtLink to="/my-tours" class="hover:text-red-text duration-200">Мои туры</NuxtLink>
            <NuxtLink to="/booking-requests" class="flex items-center gap-1 hover:text-red-text duration-200"
              :aria-label="pendingCount ? `Заявки: ${pendingCount} ждут решения` : undefined">
              Заявки
              <span v-if="pendingCount" class="min-w-5 h-5 px-1 rounded-full bg-red text-white text-xs font-bold flex items-center justify-center">{{ pendingCount }}</span>
            </NuxtLink>
          </template>
          <NuxtLink to="/my-trips" class="hover:text-red-text duration-200">Мои поездки</NuxtLink>
          <!-- Меню раскрывается при наведении и при фокусе с клавиатуры -->
          <div class="group/profile relative">
            <NuxtLink to="/profile" class="group flex items-center gap-2" aria-label="Профиль">
              <span class="size-9 rounded-full overflow-hidden bg-smooth-bg border border-gray flex items-center justify-center font-bold text-red-text">
                <img v-if="user?.avatarUrl" :src="apiUrl(user.avatarUrl)" alt="" class="size-full object-cover">
                <template v-else>{{ initial }}</template>
              </span>
              <span v-if="user" class="font-bold text-lg group-hover:text-red-text duration-200">{{ user.name }}</span>
            </NuxtLink>
            <!-- pt-2 — «мостик», чтобы меню не закрывалось, пока курсор идёт к нему -->
            <div class="absolute right-0 top-full pt-2 z-10 invisible opacity-0 duration-200 group-hover/profile:visible group-hover/profile:opacity-100 group-focus-within/profile:visible group-focus-within/profile:opacity-100">
              <div class="bg-bg border border-gray min-w-40 flex flex-col">
                <NuxtLink v-if="user?.isGuide" :to="{ path: '/guide', query: { id: user.id } }"
                  class="px-4 py-2 font-bold text-lg text-black hover:bg-red hover:text-white duration-200 whitespace-nowrap">Профиль гида</NuxtLink>
                <button type="button" class="px-4 py-2 text-left font-bold text-lg text-black hover:bg-red hover:text-white duration-200 cursor-pointer"
                  @click="onLogout">Выйти</button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink href="/signin" class="px-3 py-1 font-bold text-lg border border-gray text-black">Войти</NuxtLink>
          <NuxtLink href="/signup"
            class="px-4 py-1 font-bold text-lg border-2 border-red text-white bg-red hover:bg-red/0 hover:text-red duration-200">Регистрация</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
const { user, isAuthenticated, loadUser, logout } = useAuth()
const apiUrl = useApiUrl()

await loadUser()

// Счётчик заявок, ждущих решения, — только для гидов
const { loadPendingCount } = useBookings()
const { data: pendingCount } = await loadPendingCount()

const initial = computed(() => user.value?.name.trim().charAt(0).toUpperCase() || '?')

async function onLogout() {
  await logout()
  await navigateTo('/')
}
</script>
