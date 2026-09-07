<template>
  <div class="flex justify-center pt-12">
    <div class="flex flex-col gap-10 max-w-200 w-full">
      <div class="flex flex-col gap-2">
        <p class="text-red-text tracking-widest text-[16px] uppercase font-light">Личный кабинет гида</p>
        <h2 class="text-4xl font-extrabold">Заявки на бронирование</h2>
      </div>
      <div class="flex items-center flex-wrap w-full gap-2">
        <button v-for="(status, index) in statusFilters" :key="status"
          class="text-[16px] px-3 py-1 border-2 border-gray cursor-pointer hover:scale-101"
          :class="index === 0 ? 'text-red-text' : 'text-red'">
          {{ status }}
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <h3 class="text-2xl font-extrabold">Ожидают решения</h3>
        <div class="p-5 border-2 border-red flex flex-col gap-5 bg-smooth-bg">
          <div class="flex w-full justify-between">
            <div class="flex flex-col gap-1">
              <h4 class="text-xl font-extrabold">Прогулка по крышам старого города</h4>
              <p class="text-[16px] text-gray-text">12 сентября, 10:00 · 2 мест · €90</p>
            </div>
            <div class="p-3 text-red-text/50 bg-red/10 h-fit">Ожидает решения</div>
          </div>
          <div class="flex flex-col gap-2 text-[16px]">
            <p>Покупатель: Анна Соколова</p>
            <p class="text-gray-text">Комментарий: «Можно с ребёнком 8 лет?»</p>
          </div>
          <div class="flex gap-4">
            <button class="px-3 py-1 bg-red border-2 border-red hover:bg-red/0 duration-200 text-[16px] cursor-pointer font-bold text-white hover:text-red">
              Подтвердить
            </button>
            <button class="px-3 py-1 border-2 border-gray duration-200 text-[16px] cursor-pointer font-bold text-black hover:text-red">
              Отклонить
            </button>
          </div>
        </div>
        <div class="p-5 border-2 border-red flex flex-col gap-5 bg-smooth-bg">
          <div class="flex w-full justify-between">
            <div class="flex flex-col gap-1">
              <h4 class="text-xl font-extrabold">Гончарная мастерская в Фесе</h4>
              <p class="text-[16px] text-gray-text">14 сентября, 15:30 · 1 мест · €35</p>
            </div>
            <div class="p-3 text-red-text/50 bg-red/10 h-fit">Ожидает решения</div>
          </div>
          <div class="flex flex-col gap-2 text-[16px]">
            <p>Покупатель: Марк Ковалёв</p>
          </div>
          <div class="flex gap-4">
            <button class="px-3 py-1 bg-red border-2 border-red hover:bg-red/0 duration-200 text-[16px] cursor-pointer font-bold text-white hover:text-red">
              Подтвердить
            </button>
            <button class="px-3 py-1 border-2 border-gray duration-200 text-[16px] cursor-pointer font-bold text-black hover:text-red">
              Отклонить
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <h3 class="text-2xl font-extrabold">Обработанные</h3>
        <div class="p-5 flex flex-col gap-5 bg-smooth-bg">
          <div class="flex w-full justify-between">
            <div class="flex flex-col gap-1">
              <h4 class="text-xl font-extrabold">Прогулка по крышам старого города</h4>
              <p class="text-[16px] text-gray-text">5 сентября, 10:00 · 3 мест · €135</p>
            </div>
            <div class="p-3 text-red-text/50 bg-red/10 h-fit">Подтверждена</div>
          </div>
          <div class="flex flex-col gap-2 text-[16px]">
            <p>Покупатель: Ирина Петрова</p>
            <p>Телефон: +7 900 333-44-55 · Email: irina@example.com</p>
          </div>
        </div>
        <div class="p-5 flex flex-col gap-5 bg-smooth-bg">
          <div class="flex w-full justify-between">
            <div class="flex flex-col gap-1">
              <h4 class="text-xl font-extrabold">Прогулка по крышам старого города</h4>
              <p class="text-[16px] text-gray-text">5 сентября, 10:00 · 3 мест · €135</p>
            </div>
            <div class="p-3 text-gray-text bg-bg h-fit">Отклонена</div>
          </div>
          <div class="flex flex-col gap-2 text-[16px]">
            <p>Покупатель: Дмитрий Орлов</p>
            <p class="text-gray-text">Комментарий: «Опоздаю на 10 минут»</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const statusFilters = ['Все', 'Ожидают', 'Подтверждены', 'Отклонены']
</script>