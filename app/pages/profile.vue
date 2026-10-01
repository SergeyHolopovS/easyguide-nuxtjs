<template>
  <div class="flex justify-center w-full">
    <div class="w-200 flex flex-col gap-8 py-20">
      <div class="flex flex-col gap-2">
        <p class="uppercase text-red-text text-[16px] tracking-widest">Личный кабинет</p>
        <p class="text-4xl font-extrabold">Профиль</p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="gap-5 flex items-center">
          <div class="size-40 bg-gray"></div>
          <p class="text-sm text-gray-text">Аватар: перетащите изображение на квадрат слева.</p>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm">Имя</p>
          <input type="text" class="px-3 py-2 border">
        </div>
      </div>
    </div>
  </div>
</template>