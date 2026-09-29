<template>
  <div class="flex justify-center w-full">
    <div class="w-200 flex flex-col gap-8 py-20">
      <div class="flex flex-col gap-2">
        <p class="uppercase text-red-text text-[16px] tracking-widest">Личный кабинет</p>
        <p class="text-4xl font-extrabold">Мои поездки</p>
      </div>
      <div class="flex gap-0 items-stretch p-1 bg-smooth-bg w-fit">
        <button class="px-2 py-1 text-[16px] bg-red text-white">Активные (3)</button>
        <button class="px-2 py-1 text-[16px] bg-bg text-black">Прошедшие (4)</button>
      </div>
      <div class="w-full p-5 bg-smooth-bg flex flex-col gap-6">
        <div class="flex justify-between items-start">
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-extrabold">Восход на вулкане Батур</h3>
            <p class="text-sm text-gray-text">25 сентября, 04:00 (Бали, UTC+8) · 2 места · €110</p>
          </div>
          <div class="px-3 py-1 bg-red/10 text-red-text">Подтверждена</div>
        </div>
        <p class="text-sm">Гид Ваян Сурья: +62 812 3456 7890 · wayan@example.com</p>
        <p class="text-sm text-gray-text">Поездка уже началась — отменить её нельзя.</p>
      </div>
      <div class="w-full p-5 bg-smooth-bg flex flex-col gap-6">
        <div class="flex justify-between items-start">
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-extrabold">Прогулка по крышам старого города</h3>
            <p class="text-sm text-gray-text">27 сентября, 10:00 (Лиссабон, UTC+1) · 2 места · €90</p>
          </div>
          <div class="px-3 py-1 bg-red/10 text-red-text">Подтверждена</div>
        </div>
        <p class="text-sm">Гид Тиаго Фариа: +351 912 345 678 · tiago@example.com</p>
        <button class="text-[16px] font-extrabold px-3 py-2 border-2 w-fit border-gray hover:border-red hover:text-red duration-200">Отменить поездку</button>
      </div>
      <div class="w-full p-5 bg-smooth-bg flex flex-col gap-6 border-2 border-red">
        <div class="flex justify-between items-start">
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-extrabold">Ночная жизнь Синдзюку</h3>
            <p class="text-sm text-gray-text">27 сентября, 10:00 (Лиссабон, UTC+1) · 2 места · €90</p>
          </div>
          <div class="px-3 py-1 bg-red/10 text-red-text">Подтверждена</div>
        </div>
        <p class="text-sm">Гид Тиаго Фариа: +351 912 345 678 · tiago@example.com</p>
        <button class="text-[16px] font-extrabold px-3 py-2 border-2 w-fit border-gray hover:border-red hover:text-red duration-200">Отменить поездку</button>
      </div>
    </div>
  </div>
</template>