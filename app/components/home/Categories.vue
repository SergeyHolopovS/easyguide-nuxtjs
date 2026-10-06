<template>
  <div class="py-20 px-2 flex flex-col gap-10">
    <div class="flex flex-col gap-2">
      <p class="uppercase text-red-text text-[16px] tracking-widest">категории</p>
      <p class="text-4xl font-extrabold">Выбирайте по интересу</p>
    </div>
    <div class="flex gap-3 items-center flex-wrap w-full">
      <NuxtLink v-for="(label, category) in CATEGORY_LABELS" :key="category"
        :to="{ path: '/catalog', query: { category } }"
        class="px-4 py-3 border border-red text-lg text-red hover:text-white hover:bg-red duration-200 cursor-pointer">
        {{ label }}
      </NuxtLink>
    </div>
  </div>
</template>
