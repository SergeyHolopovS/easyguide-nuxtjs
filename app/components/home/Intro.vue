<template>
  <div class="flex gap-6 flex-col pt-20">
    <h1 class="text-7xl font-extrabold leading-19">Туры от местных жителей.
      Для гостей города и для гидов.</h1>
    <p class="text-xl text-gray-text max-w-166 leading-8">
      Маршрут связывает путешественников с локальными гидами по всему миру. Ищете тур — укажите город и дату и смотрите
      готовый каталог. Знаете город и умеете провести экскурсию — публикуйте свой тур и принимайте гостей.
    </p>
    <div class="p-6 border-2 border-gray flex items-end gap-5">
      <div class="flex flex-col gap-2 w-5/8">
        <p class="text-sm text-gray-text">Город</p>
        <input placeholder="Например, Лиссабон" type="text" class="text-lg text-gray-text placeholder:text-gray-text border border-gray bg-smooth-bg py-2 px-3 outline-none">
      </div>
      <div class="flex items-end w-[calc(37.5%-20px)] justify-between gap-5">
        <div class="flex flex-col gap-2 w-4/7">
          <p class="text-sm text-gray-text">Дата</p>
          <input type="date" class="text-lg text-gray-text border border-gray bg-smooth-bg py-2 px-3 outline-none">
        </div>
        <button class="text-lg font-extrabold text-white bg-red border-2 border-red hover:text-red hover:bg-red/0 duration-200 w-3/7 py-2">Найти туры</button>
      </div>
    </div>
    <div class="w-full h-0.75 bg-gray mt-12"></div>
  </div>
</template>

<script lang="ts" setup>

</script>
