<template>
  <HomeIntro />
  <HomePopular />
  <HomeCategories />
  <!-- Гиду призыв стать гидом не нужен -->
  <HomeBecomeGuide v-if="!user?.isGuide" />
</template>

<script lang="ts" setup>
const { user, loadUser } = useAuth()

// Без ожидания профиля сервер отрисует блок раньше, чем шапка его загрузит
await loadUser()
</script>
