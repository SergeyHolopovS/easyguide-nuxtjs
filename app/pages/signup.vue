<template>
  <div class="max-w-104 w-full mx-auto flex flex-col gap-6 pt-12">
    <div class="flex flex-col gap-2">
      <p class="text-red-text tracking-widest text-[16px] uppercase font-light">регистрация</p>
      <h2 class="text-4xl font-extrabold">Создать аккаунт</h2>
      <p class="text-gray-text text-lg">Находите туры и бронируйте у местных гидов по всему миру.</p>
    </div>
    <form class="flex flex-col gap-3">
      <BaseInput label="Имя" placeholder="Ваше имя" />
      <BaseInput label="Email" placeholder="you@example.com" />
      <BaseInput label="Пароль" placeholder="********" type="password" />
      <BaseInput label="Подтверждение пароля" placeholder="********" type="password" />
      <button type="submit" class="w-full py-1 border-2 border-red bg-red text-white font-extrabold cursor-pointer hover:bg-red/0 hover:text-red duration-200">
        Зарегистрироваться
      </button>
      <p class="text-sm text-gray-text">
        Уже есть аккаунт?
        <NuxtLink href="/signin" class="underline text-red-text hover:text-red duration-200">Войти</NuxtLink>
      </p>
    </form>
  </div>
</template>
