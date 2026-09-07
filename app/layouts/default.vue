<template>
  <div class="min-h-screen flex flex-col gap-0">
    <AppHeader />
    <div class="w-screen flex justify-center">
      <div class="max-w-300 px-2 flex flex-col gap-2 w-full">
        <slot />
      </div>
    </div>
    <AppFooter />
  </div>
</template>
