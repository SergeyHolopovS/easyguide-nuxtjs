<script setup lang="ts">
const categories = [
  { id: 'walking', label: 'Пешие экскурсии' },
  { id: 'food', label: 'Гастрономические туры' },
  { id: 'nature', label: 'Природа и приключения' },
  { id: 'history', label: 'История и культура' },
  { id: 'nightlife', label: 'Ночная жизнь' },
  { id: 'workshops', label: 'Мастер-классы' },
]
const category = ref<string>('')

const fieldClass = 'text-[16px] px-3 py-2 border border-gray-text/75 bg-gray/10 placeholder:text-gray-text outline-none focus:border-red duration-200'
</script>

<template>
  <div class="flex justify-center w-full">
    <div class="w-200 flex flex-col gap-10 pt-20">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-2">
          <p class="uppercase text-red-text text-[16px] tracking-widest">Новый тур</p>
          <h1 class="text-5xl font-extrabold">Создать тур</h1>
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <div class="flex flex-col gap-5">
          <h2 class="text-xl font-extrabold">Основное</h2>
          <div class="flex flex-col gap-2">
            <label for="tour-title" class="text-sm text-gray-text">Название *</label>
            <input id="tour-title" type="text" :class="fieldClass"
              placeholder="Например, прогулка по крышам старого города" />
            <p class="text-red-text text-sm">Укажите название</p>
          </div>
          <div class="flex flex-col gap-2">
            <label for="tour-description" class="text-sm text-gray-text">Описание *</label>
            <textarea id="tour-description" rows="5" class="resize-y" :class="fieldClass"
              placeholder="Расскажите, что увидят участники и чем тур отличается от других"></textarea>
            <p class="text-gray-text text-sm">0 / минимум 50 символов <span class="text-red-text">Добавьте
                описание</span></p>
          </div>
          <div class="flex gap-4">
            <div class="flex flex-col gap-2 w-1/2">
              <label for="tour-city" class="text-sm text-gray-text">Город *</label>
              <input id="tour-city" type="text" :class="fieldClass" placeholder="Лиссабон" />
            </div>
            <div class="flex flex-col gap-2 w-1/2">
              <label for="tour-category" class="text-sm text-gray-text">Категория *</label>
              <select id="tour-category" v-model="category" class="cursor-pointer"
                :class="[fieldClass, category ? 'text-black' : 'text-gray-text']">
                <option value="">Выберите категорию</option>
                <option v-for="option in categories" :key="option.id" :value="option.id" class="text-black">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label for="tour-meeting-point" class="text-sm text-gray-text">Место встречи *</label>
            <input id="tour-meeting-point" type="text" :class="fieldClass" placeholder="Адрес или ориентир" />
          </div>
          <div class="flex gap-3">
            <div class="flex flex-col gap-2 w-1/3">
              <label for="tour-duration" class="text-sm text-gray-text">Длительность, часов *</label>
              <input id="tour-duration" type="number" min="1" :class="fieldClass" placeholder="4" />
            </div>
            <div class="flex flex-col gap-2 w-1/3">
              <label for="tour-price" class="text-sm text-gray-text">Цена за человека, € *</label>
              <input id="tour-price" type="number" min="0" :class="fieldClass" placeholder="30" />
            </div>
            <div class="flex flex-col gap-2 w-1/3">
              <label for="tour-capacity" class="text-sm text-gray-text">Макс. участников *</label>
              <input id="tour-capacity" type="number" min="1" :class="fieldClass" placeholder="8" />
            </div>
          </div>
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <div class="flex flex-col gap-3">
          <div class="flex items-end justify-between w-full">
            <h2 class="text-2xl font-bold">Фотографии *</h2>
            <p class="text-sm text-gray-text">Пока нет фотографий</p>
          </div>
          <p class="text-[16px] text-gray-text">JPG, PNG или WebP, до 5 МБ каждая. Первая фотография станет обложкой.
          </p>
          <div class="grid grid-cols-5 gap-3">
            <button class="relative aspect-4/3 flex flex-col justify-end text-start gap-2 p-3 cursor-pointer group">
              <svg class="absolute inset-0 size-full text-gray pointer-events-none group-hover:text-black duration-200">
                <rect width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-dasharray="8 6" />
              </svg>
              <svg class="size-[1.1rem] text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="3" stroke-linecap="round">
                <path d="M12 4v16M4 12h16" />
              </svg>
              <p class="text-[16px]">Добавить фото</p>
            </button>
          </div>
        </div>
      </div>
      <div
        class="sticky bottom-0 z-10 py-4 before:absolute before:inset-y-0 before:left-1/2 before:w-screen before:-translate-x-1/2 before:-z-1 before:border-t-2 before:border-gray before:bg-bg">
        <div class="flex gap-4 h-12">
          <button
            class="px-3 py-1 text-lg font-extrabold border border-gray-text hover:border-black hover:bg-smooth-bg duration-200 cursor-pointer">Сохранить
            черновик</button>
          <button
            class="px-3 py-1 text-lg font-extrabold border border-red text-white cursor-pointer bg-red hover:bg-transparent hover:text-red duration-200">Опубликовать</button>
        </div>
      </div>
    </div>
  </div>
</template>
