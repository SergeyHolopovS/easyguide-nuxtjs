<template>
  <div class="max-w-104 w-full mx-auto flex flex-col gap-6 pt-12">
    <div class="flex flex-col gap-2">
      <p class="text-red-text tracking-widest text-[16px] uppercase font-light">вход</p>
      <h2 class="text-4xl font-extrabold">Войти в аккаунт</h2>
      <p class="text-gray-text text-lg">Находите туры и бронируйте у местных гидов по всему миру.</p>
    </div>
    <form class="flex flex-col gap-3">
      <BaseInput label="Email" placeholder="you@example.com" />
      <BaseInput label="Пароль" placeholder="********" type="password" />
      <button type="submit" class="w-full py-1 border-2 border-red bg-red text-white font-extrabold cursor-pointer hover:bg-red/0 hover:text-red duration-200">
        Войти
      </button>
      <p class="text-sm text-gray-text">
        Нет аккаунта?
        <NuxtLink href="/signup" class="underline text-red-text hover:text-red duration-200">Зарегистрироваться</NuxtLink>
      </p>
    </form>
  </div>
</template>
