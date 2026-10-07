<template>
  <div v-if="!guide" class="w-full flex flex-col gap-4 py-20">
    <template v-if="!guideId || notFound">
      <h1 class="text-4xl font-extrabold">Гид не найден</h1>
      <p class="text-lg text-gray-text">Возможно, ссылка устарела. Посмотрите туры в каталоге.</p>
      <NuxtLink to="/catalog" class="text-lg text-red-text underline w-fit">Перейти в каталог</NuxtLink>
    </template>
    <p v-else role="alert" class="text-lg text-gray-text">
      Не удалось загрузить профиль гида.
      <button type="button" class="underline text-red-text cursor-pointer" @click="refresh()">Повторить</button>
    </p>
  </div>
  <div v-else class="w-full flex flex-col py-20 gap-10">
    <div class="flex gap-12">
      <img v-if="guide.avatarUrl" :src="apiUrl(guide.avatarUrl)" alt="" class="aspect-square size-50 shrink-0 object-cover">
      <div v-else class="aspect-square bg-gray size-50 shrink-0"></div>
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <p class="text-red-text uppercase text-lg">Гид<template v-if="guide.city"> · {{ guide.city }}</template></p>
          <h1 class="text-6xl font-extrabold">{{ guide.name }}</h1>
        </div>
        <p v-if="guide.bio" class="max-w-175 text-xl text-black/80 whitespace-pre-line">{{ guide.bio }}</p>
      </div>
    </div>
    <div class="w-full flex justify-between items-stretch border-t-2 border-b-2 border-gray">
      <div class="w-1/3 py-5 flex flex-col gap-3">
        <p class="uppercase text-sm text-red">Рейтинг</p>
        <div v-if="guide.averageRating != null" class="flex flex-col gap-2">
          <h5 class="text-4xl font-bold">★ {{ guide.averageRating.toFixed(1) }}</h5>
          <p class="text-sm text-gray-text">
            {{ guide.totalReviewsCount }} {{ pluralize(guide.totalReviewsCount, REVIEW_FORMS) }} по всем турам
          </p>
        </div>
        <p v-else class="text-lg text-gray-text">Отзывов пока нет</p>
      </div>
      <div class="w-1/3 py-5 flex flex-col gap-3 border-l-2 border-r-2 px-5">
        <p class="uppercase text-sm text-red">Языки</p>
        <p class="text-lg">{{ languages || 'Не указаны' }}</p>
      </div>
      <div class="w-1/3 py-5 flex flex-col gap-3 pl-5">
        <p class="uppercase text-sm text-red">На Маршруте</p>
        <p class="text-lg">{{ memberSince }}</p>
      </div>
    </div>
    <div class="flex flex-col gap-8">
      <h2 class="text-4xl font-extrabold">Туры гида</h2>
      <p v-if="!tours.length" class="text-lg text-gray-text">Опубликованных туров пока нет.</p>
      <div v-else class="grid grid-cols-3 gap-4">
        <TourBar v-for="tour in tours" :key="tour.id" :to="{ path: '/timetable', query: { id: tour.id } }"
          :image="apiUrl(tour.coverUrl)" :city="tour.city" :title="tour.title" :price="tour.price" :rating="tour.rating" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const REVIEW_FORMS: [string, string, string] = ['отзыв', 'отзыва', 'отзывов']

const route = useRoute()
const { getGuideProfile } = useGuides()
const { withCovers } = useTours()
const apiUrl = useApiUrl()

const guideId = computed(() => typeof route.query.id === 'string' ? route.query.id : '')

const { data: guide, error, refresh } = await useAsyncData('guide-profile', async () => {
  if (!guideId.value) return null
  const profile = await getGuideProfile(guideId.value)
  return { ...profile, tours: await withCovers(profile.tours) }
}, { watch: [guideId] })

const notFound = computed(() => isHttpError(error.value) && error.value.statusCode === 404)

useHead({ title: () => guide.value ? `${guide.value.name} — гид EasyGuide` : 'Гид — EasyGuide' })

const tours = computed(() => guide.value?.tours ?? [])

const languages = computed(() => {
  const list = (guide.value?.languages ?? []).map(languageLabel).join(', ')
  return list.charAt(0).toUpperCase() + list.slice(1).toLowerCase()
})

// «С марта 2024 года»: месяц в родительном падеже берём из полной даты
const memberSince = computed(() => {
  if (!guide.value) return ''
  const parts = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    .formatToParts(new Date(guide.value.createdAt))
  const month = parts.find(part => part.type === 'month')?.value
  const year = parts.find(part => part.type === 'year')?.value
  return `С ${month} ${year} года`
})
</script>
