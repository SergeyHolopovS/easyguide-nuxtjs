<template>
  <div class="py-20 px-2 flex flex-col gap-10">
    <div class="flex flex-col gap-2">
      <p class="uppercase text-red-text text-[16px] tracking-widest">популярные туры</p>
      <p class="text-4xl font-extrabold">Начните с этих туров</p>
    </div>

    <p v-if="error" role="alert" class="text-lg text-gray-text">
      Не удалось загрузить туры.
      <button type="button" class="underline text-red-text cursor-pointer" @click="refresh()">Повторить</button>
    </p>
    <p v-else-if="!tours.length" class="text-lg text-gray-text">
      Туров пока нет — загляните позже.
    </p>
    <div v-else class="grid grid-cols-3 gap-5">
      <TourBar v-for="tour in tours" :key="tour.id" :to="{ path: '/timetable', query: { id: tour.id } }" :image="apiUrl(tour.coverUrl)" :city="tour.city" :title="tour.title" :price="tour.price"
        :rating="tour.rating" />
    </div>
  </div>
  <div class="w-full h-0.75 bg-gray"></div>
</template>

<script lang="ts" setup>
const POPULAR_COUNT = 6

const { searchTours } = useTours()
const apiUrl = useApiUrl()

const { data, error, refresh } = await useAsyncData('home-popular-tours',
  () => searchTours({ sort: 'rating', size: POPULAR_COUNT }))

const tours = computed(() => data.value?.content ?? [])
</script>
