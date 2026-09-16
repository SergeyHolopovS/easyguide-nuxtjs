<script lang="ts" setup>
const stats: { field: string; value: string }[] = [
  {
    field: "длительность",
    value: "3 часа"
  },
  {
    field: "размер группы",
    value: "До 8 человек"
  },
  {
    field: "место встречи",
    value: "Площадь Комерсио, у фонтана"
  },
  {
    field: "цена",
    value: "€45"
  }
]

const reviews: { author: string; date: string; rating: number; text: string }[] = [
  {
    author: "Ольга В.",
    date: "2 сентября 2026",
    rating: 5,
    text: "Невероятные виды и очень душевный гид, показал места, которых нет в путеводителях."
  },
  {
    author: "James R.",
    date: "20 августа 2026",
    rating: 5,
    text: "Great pace, small group, Tiago knows every rooftop in Alfama."
  },
  {
    author: "Мария К.",
    date: "5 августа 2026",
    rating: 4,
    text: "Очень понравилось, единственное — было жарко в середине дня."
  }
]

const options: { id: string, label: string }[] = [
  {
    id: '1',
    label: 'Option 1'
  },
  {
    id: '2',
    label: 'Option 1'
  },
  {
    id: '3',
    label: 'Option 1'
  },
  {
    id: '4',
    label: 'Option 1'
  },
  {
    id: '5',
    label: 'Option 1'
  },
  {
    id: '6',
    label: 'Option 1'
  },
  {
    id: '7',
    label: 'Option 1'
  },
  {
    id: '8',
    label: 'Option 1'
  },
  {
    id: '9',
    label: 'Option 1'
  },
  {
    id: '10',
    label: 'Option 1'
  },
  {
    id: '11',
    label: 'Option 1'
  },
] 
</script>

<template>
  <div class="w-full flex gap-5 pt-10 justify-between items-start">
    <div class="w-[calc(100%-340px)] flex flex-col gap-10">
      <img class="aspect-video w-full border border-black/10 bg-smooth-bg" src="" />
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <p class="text-red-text bg-red/10 text-sm w-fit px-2 py-0.5">Пешие экскурсии</p>
          <h2 class="text-6xl font-extrabold">Прогулка по крышам старого города</h2>
          <div class="flex gap-2 items-centertext-sm text-gray-text">
            <p>Лиссабон</p>
            <p>★ 4.9 (3 отзывов)</p>
          </div>
        </div>
        <p class="text-lg text-black">Трёхчасовая прогулка по террасам и крышам Алфамы с видами на реку Тежу. Заходим во
          дворы, куда не попадают обычные туристические маршруты, и заканчиваем на смотровой площадке к закату.</p>
      </div>
      <div class="h-0.5 w-full bg-gray"></div>
      <div class="grid grid-cols-3 grid-rows-2 gap-10">
        <div v-for="item in stats" class="flex flex-col gap-2">
          <h6 class="text-[16px] text-red-text uppercase">{{ item.field }}</h6>
          <p class="text-[16px]">{{ item.value }}</p>
        </div>
      </div>
      <div class="h-0.5 w-full bg-gray"></div>
      <div class="flex flex-col gap-4">
        <h5 class="text-[16px] text-red-text uppercase">гид</h5>
        <div class="flex gap-3 items-center">
          <img src="" alt="" class="size-20 rounded-full bg-smooth-bg border border-black/10">
          <div class="flex flex-col gap-0.5">
            <h6 class="text-lg font-extrabold">Тиаго Фариа</h6>
            <p class="text-[16px] text-gray-text">Языки: португальский, английский, испанский</p>
            <NuxtLink class="text-red-text cursor-pointer text-[16px]">Профиль гида →</NuxtLink>
          </div>
        </div>
      </div>
      <div class="h-0.5 w-full bg-gray"></div>
      <div class="flex flex-col gap-4">
        <h5 class="text-red-text uppercase text-[16px]">После бронирования</h5>
        <p class="text-[16px] text-gray-text">Гид подтверждает заявку вручную — обычно в течение суток. Оплата происходит не онлайн, гид укажет способ оплаты после подтверждения.</p>
      </div>
      <div class="h-0.5 w-full bg-gray"></div>
      <div class="flex flex-col gap-5">
        <h5 class="text-red-text uppercase text-[16px]">Отзывы ({{ reviews.length }})</h5>
        <div v-for="review in reviews" :key="review.author + review.date" class="flex flex-col gap-1">
          <div class="flex justify-between items-center w-full">
            <h6 class="text-xl font-extrabold">{{ review.author }}</h6>
            <p class="text-gray-text text-lg">{{ review.date }}</p>
          </div>
          <p class="text-red-text text-xl">★ {{ review.rating }}</p>
          <p class="text-xl text-black">{{ review.text }}</p>
        </div>
      </div>
    </div>
    <div class="w-90 h-fit flex flex-col gap-2.5 p-5 bg-smooth-bg">
      <h4 class="text-2xl font-extrabold">€45</h4>
      <p class="text-[16px] text-gray-text">за человека · время указано по Лиссабону (WEST, UTC+1)</p>
      <div class="flex flex-col gap-1">Дата</div>
      <Selector placeholder="Выберите дату" :handler="(id: string) => console.log(id)" :options="options" />
    </div>
  </div>
</template>
