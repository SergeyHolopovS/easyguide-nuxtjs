<template>
  <div class="w-full flex flex-col py-20 gap-10">
    <div class="flex gap-12">
      <div class="aspect-square bg-gray size-50"></div>
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <p class="text-red-text uppercase text-lg">Гид · Лиссабон</p>
          <h1 class="text-6xl font-extrabold">Тиаго Фариа</h1>
        </div>
        <p class="max-w-175 text-xl text-black/80">Родился и вырос в Алфаме. Десять лет работал
          архитектором-реставратором и знаю, как устроены старые дома
          изнутри, поэтому мои прогулки — про крыши, дворы и лестницы, которых нет на картах. Вожу небольшие группы,
          чтобы можно было спокойно поговорить и задать вопросы.</p>
      </div>
    </div>
    <div class="w-full flex justify-between items-stretch border-t-2 border-b-2 border-gray">
      <div class="w-1/3 py-5 flex flex-col gap-3">
        <p class="uppercase text-sm text-red">Рейтинг</p>
        <div class="flex flex-col gap-2">
          <h5 class="text-4xl font-bold">★ 4.8</h5>
          <p class="text-sm text-gray-text">69 отзывов по всем турам</p>
        </div>
      </div>
      <div class="w-1/3 py-5 flex flex-col gap-3 border-l-2 border-r-2 px-5">
        <p class="uppercase text-sm text-red">Языки</p>
        <p class="text-lg">Португальский, английский, испанский</p>
      </div>
      <div class="w-1/3 py-5 flex flex-col gap-3 pl-5">
        <p class="uppercase text-sm text-red">На Маршруте</p>
        <p class="text-lg">С марта 2024 года</p>
      </div>
    </div>
    <div class="flex flex-col gap-8">
      <h2 class="text-4xl font-extrabold">Туры гида</h2>
      <div class="grid grid-cols-3 gap-4">
        <TourBar v-for="tour in tours" :key="tour.title" v-bind="tour" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const tours = [
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'лиссабон',
    title: 'Крыши и дворы Алфамы',
    price: 45,
    rating: 4.9
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'лиссабон',
    title: 'Лестницы и смотровые площадки',
    price: 38,
    rating: 4.8
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'лиссабон',
    title: 'Архитектура старого Лиссабона',
    price: 52,
    rating: 4.7
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'лиссабон',
    title: 'Байша и Шиаду: город после землетрясения',
    price: 40,
    rating: 4.8
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'лиссабон',
    title: 'Закатная прогулка по Мурарии',
    price: 35,
    rating: 4.9
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'лиссабон',
    title: 'Азулежу: истории на стенах',
    price: 48,
    rating: 4.6
  }
]
</script>
