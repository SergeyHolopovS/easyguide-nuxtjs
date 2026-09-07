<template>
  <div class="h-116 relative w-full border-2 border-gray flex flex-col gap-0">
    <img :src="image" class="w-full h-2/3 object-cover">
    <div class="absolute bottom-0 left-0 w-full bg-bg h-fit flex p-4 flex-col gap-4 min-h-1/3 justify-between">
      <div class="flex flex-col gap-1">
        <p class="text-gray-text uppercase tracking-wider text-[16px] font-light">
          {{ city }}
        </p>
        <h4 class="text-2xl max-w-4/5 font-extrabold">{{ title }}</h4>
      </div>
      <div class="flex w-full justify-between items-center">
        <p class="text-2xl font-bold">€{{ price }}</p>
        <p class="text-red-text">★ {{ rating }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  image: string
  city: string
  title: string
  price: number
  rating: number
}>()
</script>
