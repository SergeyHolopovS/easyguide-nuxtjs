<template>
  <div class="flex justify-center w-full">
    <div class="w-200 flex flex-col gap-20 py-20">
      <div class="flex flex-col gap-8">
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
            <p class="text-sm text-gray-text">Имя</p>
            <input type="text" placeholder="Анна Соколова" class="px-3 py-2 border border-gray bg-gray/10">
          </div>
          <div class="flex flex-col gap-2">
            <p class="text-sm text-gray-text">Телефон</p>
            <input type="text" placeholder="+7 900 111-22-33" class="px-3 py-2 border border-gray bg-gray/10">
          </div>
          <div class="flex flex-col gap-2">
            <p class="text-sm text-gray-text">Email</p>
            <div class="flex flex-col gap-px">
              <input type="text" placeholder="anna@example.com" class="px-3 py-2 border border-gray bg-gray/10">
              <p class="text-gray-text text-[12px]">Email и пароль меняются в настройках безопасности.</p>
            </div>
          </div>
          <button
            class="text-[16px] font-extrabold text-white bg-red px-6 py-2 w-fit hover:text-red hover:bg-red/0 duration-200 cursor-pointer border border-red">Сохранить
            изменения</button>
        </div>
      </div>

      <div class="relative flex flex-col gap-8 py-20 w-full text-white">
        <div class="w-screen h-full absolute left-1/2 top-0 -translate-x-1/2 bg-red -z-1"></div>
        <h3 class="text-5xl font-extrabold">Станьте гидом</h3>
        <p class=" text-lg">Публикуйте свои туры в каталоге, сами задавайте цену и расписание, принимайте заявки от
          путешественников.
          Появится публичный профиль гида с вашими турами и отзывами.</p>
        <button
          class="w-fit px-3 py-1 text-lg font-bold border border-white text-white hover:bg-white hover:text-red duration-200 cursor-pointer">Включить
          роль гида</button>
      </div>
    </div>
  </div>
</template>