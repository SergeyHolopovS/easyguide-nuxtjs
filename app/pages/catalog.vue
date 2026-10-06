<script setup lang="ts">
const cities = [
  { id: 'tehran', label: 'Тегеран' },
  { id: 'istanbul', label: 'Стамбул' },
  { id: 'lisbon', label: 'Лиссабон' },
  { id: 'tbilisi', label: 'Тбилиси' },
  { id: 'yerevan', label: 'Ереван' },
  { id: 'baku', label: 'Баку' },
]
const categories = [
  { id: 'walking', label: 'Пешие экскурсии' },
  { id: 'food', label: 'Гастрономические туры' },
  { id: 'nature', label: 'Природа и приключения' },
  { id: 'history', label: 'История и культура' },
  { id: 'nightlife', label: 'Ночная жизнь' },
  { id: 'workshops', label: 'Мастер-классы' },
]
const sortOptions = [
  { id: 'popular', label: 'По популярности' },
  { id: 'price-asc', label: 'Сначала дешевле' },
  { id: 'price-desc', label: 'Сначала дороже' },
  { id: 'rating', label: 'По рейтингу' },
  { id: 'date', label: 'Ближайшие по дате' },
]
const tours = [
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'тегеран',
    title: 'Базары и мечети Тегерана',
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
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'стамбул',
    title: 'Босфор на закате',
    price: 48,
    rating: 4.7
  },
  {
    image: 'https://c.ekstatic.net/shared/images/destination/v1/airports/IKA/480x480.jpg',
    city: 'лиссабон',
    title: 'Крыши и дворы Алфамы',
    price: 45,
    rating: 4.9
  }
]

const city = ref<string>('')
const category = ref<string>('')
const date = ref<string>('')
const priceFrom = ref<number | null>(null)
const priceTo = ref<number | null>(null)
const sort = ref<string>('popular')

const fieldClass = 'w-full p-2 border border-gray-text/50 bg-gray/10 text-sm outline-none focus:border-red duration-200'
</script>

<template>
  <div class="flex w-full gap-5 py-16">
    <div class="w-[calc(25%-20px)] flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="catalog-title" class="text-sm text-gray-text">Наименование</label>
        <input id="catalog-title" type="text" class="text-gray-text" :class="fieldClass">
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-city" class="text-sm text-gray-text">Город</label>
        <select id="catalog-city" v-model="city" class="cursor-pointer"
          :class="[fieldClass, city ? 'text-black' : 'text-gray-text']">
          <option value="">Все города</option>
          <option v-for="option in cities" :key="option.id" :value="option.id" class="text-black">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-category" class="text-sm text-gray-text">Категория</label>
        <select id="catalog-category" v-model="category" class="cursor-pointer"
          :class="[fieldClass, category ? 'text-black' : 'text-gray-text']">
          <option value="">Все категории</option>
          <option v-for="option in categories" :key="option.id" :value="option.id" class="text-black">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-date" class="text-sm text-gray-text">Дата</label>
        <input id="catalog-date" v-model="date" type="date" class="cursor-pointer"
          :class="[fieldClass, date ? 'text-black' : 'text-gray-text']">
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-price-from" class="text-sm text-gray-text">Цена, €</label>
        <div class="flex gap-2">
          <input id="catalog-price-from" v-model.number="priceFrom" type="number" min="0" placeholder="от"
            class="min-w-0 placeholder:text-gray-text" :class="fieldClass" aria-label="Цена от">
          <input id="catalog-price-to" v-model.number="priceTo" type="number" min="0" placeholder="до"
            class="min-w-0 placeholder:text-gray-text" :class="fieldClass" aria-label="Цена до">
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-sort" class="text-sm text-gray-text">Сортировка</label>
        <select id="catalog-sort" v-model="sort" class="cursor-pointer text-gray-text" :class="fieldClass">
          <option v-for="option in sortOptions" :key="option.id" :value="option.id">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="w-3/4 flex flex-col gap-3">
      <div class="flex items-end gap-1">
        <h2 class="text-3xl font-extrabold">Туры</h2>
        <p class="text-[16px] text-gray-text">({{ tours.length }})</p>
      </div>
      <div class="grid grid-cols-2 gap-5">
        <TourBar v-for="tour in tours" :key="tour.title" v-bind="tour" />
      </div>
      <div class="flex justify-center gap-2">
        <button class="size-10 bg-red text-xl font-bold text-white cursor-pointer">1</button>
        <button class="size-10 text-xl font-bold text-red border-2 border-red cursor-pointer hover:bg-red hover:text-white duration-200">2</button>
      </div>
    </div>
  </div>
</template>
