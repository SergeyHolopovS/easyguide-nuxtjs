<template>
  <header class="w-screen border-b border-gray flex items-center justify-center">
    <div class="max-w-300 w-full px-2 py-2 flex items-center justify-between">
      <NuxtLink href="/" class="font-extrabold text-black text-2xl">EasyGuide</NuxtLink>
      <div class="flex items-center gap-4">
        <template v-if="route.path === '/'">
          <a href="/">Туры</a>
          <a href="/">Категории</a>
          <a href="/">Гидам</a>
        </template>
        <NuxtLink href="/signin" class="px-3 py-1 font-bold text-lg border border-gray text-black">Войти</NuxtLink>
        <NuxtLink href="/signup"
          class="px-4 py-1 font-bold text-lg border-2 border-red text-white bg-red hover:bg-red/0 hover:text-red duration-200">Регистрация</NuxtLink>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
const route = useRoute()
</script>
