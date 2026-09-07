<template>
  <div class="py-20 px-2 flex flex-col gap-10">
    <div class="flex flex-col gap-2">
      <p class="uppercase text-red-text text-[16px] tracking-widest">популярные туры</p>
      <p class="text-4xl font-extrabold">Начните с этих туров</p>
    </div>
    <div class="grid grid-cols-3 gap-5">
      <TourBar v-for="tour in tours" :key="tour.title" v-bind="tour" />
    </div>
  </div>
  <div class="w-full h-0.75 bg-gray"></div>
</template>

<script lang="ts" setup>
const tours = [
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'тегеран',
    title: 'Поездка в тегеран за счёт ВТБ',
    price: 38,
    rating: 4.9
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'стамбул',
    title: 'Прогулка по крышам Стамбула',
    price: 42,
    rating: 4.8
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'лиссабон',
    title: 'Гастротур по районам Лиссабона',
    price: 55,
    rating: 4.7
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'тбилиси',
    title: 'Вино и хинкали в старом Тбилиси',
    price: 30,
    rating: 4.9
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'ереван',
    title: 'История и архитектура Еревана',
    price: 27,
    rating: 4.6
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'баку',
    title: 'Ночной Баку и набережная',
    price: 33,
    rating: 4.8
  }
]
</script>
