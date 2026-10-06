<template>
  <component :is="to ? NuxtLink : 'div'" :to="to"
    class="h-116 relative w-full border-2 border-gray flex flex-col gap-0"
    :class="{ 'group cursor-pointer hover:border-red duration-200': to }">
    <img v-if="image" :src="image" alt="" class="w-full h-2/3 object-cover">
    <div v-else class="w-full h-2/3 bg-smooth-bg"></div>
    <div class="absolute bottom-0 left-0 w-full bg-bg h-fit flex p-4 flex-col gap-4 min-h-1/3 justify-between">
      <div class="flex flex-col gap-1">
        <p class="text-gray-text uppercase tracking-wider text-[16px] font-light">
          {{ city }}
        </p>
        <h4 class="text-2xl max-w-4/5 font-extrabold group-hover:text-red-text duration-200">{{ title }}</h4>
      </div>
      <div class="flex w-full justify-between items-center">
        <p v-if="price != null" class="text-2xl font-bold">€{{ price }}</p>
        <p v-else class="text-gray-text">Цена не указана</p>
        <p v-if="rating != null" class="text-red-text">★ {{ rating.toFixed(1) }}</p>
        <p v-else class="text-gray-text text-sm">Нет отзывов</p>
      </div>
    </div>
  </component>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const NuxtLink = resolveComponent('NuxtLink')

defineProps<{
  // Если задан — карточка становится ссылкой
  to?: RouteLocationRaw
  image?: string | null
  city: string
  title: string
  // null — у тура с бэкенда цена не задана или ещё нет отзывов
  price: number | null
  rating: number | null
}>()
</script>
