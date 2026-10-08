<template>
  <form class="flex flex-col gap-3" @submit.prevent="submit">
    <div class="flex flex-col gap-1">
      <p :id="`${id}-rating`" class="text-gray-text text-sm">Оценка</p>
      <div class="flex gap-1" role="radiogroup" :aria-labelledby="`${id}-rating`">
        <button v-for="star in 5" :key="star" type="button" role="radio" :aria-checked="rating === star"
          :aria-label="`${star} из 5`" class="text-2xl cursor-pointer duration-200"
          :class="star <= rating ? 'text-red-text' : 'text-gray-text/50 hover:text-red-text'"
          @click="rating = star">★</button>
      </div>
    </div>
    <div class="flex flex-col gap-1">
      <label :for="`${id}-text`" class="text-gray-text text-sm">Отзыв (необязательно)</label>
      <textarea :id="`${id}-text`" v-model="text" rows="3" :maxlength="REVIEW_MAX_LENGTH"
        placeholder="Что понравилось, что можно улучшить"
        class="text-[16px] px-3 py-1.5 border border-gray bg-bg outline-none focus:border-black duration-200 resize-none"></textarea>
    </div>
    <p v-if="error" role="alert" class="text-sm text-red-text">{{ error }}</p>
    <div class="flex gap-3">
      <button type="submit" :disabled="!rating || pending"
        class="text-[16px] font-extrabold px-3 py-2 border-2 w-fit border-red bg-red text-white enabled:hover:bg-transparent enabled:hover:text-red duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        {{ pending ? 'Отправляем…' : 'Отправить отзыв' }}
      </button>
      <button type="button" class="text-[16px] px-3 py-2 text-gray-text hover:text-black duration-200 cursor-pointer"
        @click="emit('cancel')">Отмена</button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import type { CreateReviewRequest } from '~/types/api'

const REVIEW_MAX_LENGTH = 2000

defineProps<{
  // Префикс id полей, чтобы на странице могло быть несколько форм
  id: string
  pending?: boolean
  error?: string
}>()

const emit = defineEmits<{
  submit: [payload: CreateReviewRequest]
  cancel: []
}>()

const rating = ref(0)
const text = ref('')

function submit() {
  if (!rating.value) return
  emit('submit', { rating: rating.value, text: text.value.trim() || null })
}
</script>
