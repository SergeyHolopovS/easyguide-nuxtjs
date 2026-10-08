<script lang="ts" setup>
import type { BookingListItemResponse, CreateReviewRequest, ErrorDto, ReviewListItemResponse } from '~/types/api'

// API отдаёт слоты не больше чем за 92 дня
const SLOTS_WINDOW_DAYS = 92
// Защита от бесконечной загрузки: 25 страниц по 20 броней
const MAX_BOOKING_PAGES = 25
const REVIEW_FORMS: [string, string, string] = ['отзыв', 'отзыва', 'отзывов']
const PEOPLE_FORMS: [string, string, string] = ['человека', 'человек', 'человек']

const route = useRoute()
const { getTour, getTourReviews, getSlots } = useTours()
const { getGuideProfile } = useGuides()
const { getMyBookings, createReview } = useBookings()
const { isAuthenticated } = useAuth()
const apiUrl = useApiUrl()

const tourId = computed(() => typeof route.query.id === 'string' ? route.query.id : '')

// Даты — строки YYYY-MM-DD по локальному календарю, без перевода в UTC
function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const today = new Date()
const windowEnd = new Date(today)
windowEnd.setDate(windowEnd.getDate() + SLOTS_WINDOW_DAYS - 1)

const { data: tour, error: tourError, refresh: refreshTour } = await useAsyncData('tour-details',
  () => tourId.value ? getTour(tourId.value) : Promise.resolve(null), { watch: [tourId] })

const tourNotFound = computed(() => isHttpError(tourError.value) && tourError.value.statusCode === 404)

useHead({ title: () => tour.value ? `${tour.value.title} — EasyGuide` : 'Тур — EasyGuide' })

const cover = computed(() => {
  const photo = [...(tour.value?.photos ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0]
  return apiUrl(photo?.url)
})

// Языки есть только в профиле гида; без них карточка тура всё равно показывается
const { data: guideProfile } = await useAsyncData('tour-guide',
  () => tour.value ? getGuideProfile(tour.value.guide.id).catch(() => null) : Promise.resolve(null),
  { watch: [() => tour.value?.guide.id] })

const guideLanguages = computed(() => {
  const list = (guideProfile.value?.languages ?? []).map(languageLabel).join(', ')
  return list.charAt(0).toUpperCase() + list.slice(1).toLowerCase()
})

// Отзывы

const reviews = ref<ReviewListItemResponse[]>([])
const reviewsPage = ref(0)
const reviewsLast = ref(true)
const reviewsPending = ref(false)
const reviewsError = ref(false)

async function loadReviews(page: number) {
  if (!tourId.value) return
  reviewsPending.value = true
  reviewsError.value = false
  try {
    const result = await getTourReviews(tourId.value, page)
    reviews.value = page === 0 ? result.content : [...reviews.value, ...result.content]
    reviewsPage.value = result.number
    reviewsLast.value = result.last
  } catch {
    reviewsError.value = true
  } finally {
    reviewsPending.value = false
  }
}

const { data: firstReviews, refresh: refreshReviews } = await useAsyncData('tour-reviews',
  () => tourId.value ? getTourReviews(tourId.value).catch(() => null) : Promise.resolve(null), { watch: [tourId] })

watch(firstReviews, (page) => {
  reviews.value = page?.content ?? []
  reviewsPage.value = 0
  reviewsLast.value = page?.last ?? true
  reviewsError.value = !page && !!tourId.value
}, { immediate: true })

// Новый отзыв: оставить можно по завершённой брони этого тура, один на бронь

async function loadCompletedBookings() {
  const all: BookingListItemResponse[] = []
  for (let page = 0; page < MAX_BOOKING_PAGES; page++) {
    const response = await getMyBookings({ status: 'COMPLETED', page })
    all.push(...response.content)
    if (response.last) break
  }
  return all.filter(booking => booking.tour.id === tourId.value)
}

const { data: completedBookings } = await useAsyncData('tour-completed-bookings',
  () => isAuthenticated.value && tourId.value ? loadCompletedBookings().catch(() => []) : Promise.resolve([]),
  { watch: [tourId, isAuthenticated] })

// API не сообщает, есть ли уже отзыв по брони, — узнаём об этом по 409 при отправке
const reviewedBookingIds = ref(new Set<string>())
const reviewableBookings = computed(() => (completedBookings.value ?? [])
  .filter(booking => !reviewedBookingIds.value.has(booking.id)))

const reviewFormOpen = ref(false)
const reviewPending = ref(false)
const reviewError = ref('')
const reviewMessage = ref('')

function openReviewForm() {
  reviewFormOpen.value = true
  reviewError.value = ''
  reviewMessage.value = ''
}

function closeReviewForm() {
  reviewFormOpen.value = false
  reviewError.value = ''
}

// Пробуем брони по очереди: по первым отзыв мог быть оставлен раньше
async function submitReview(payload: CreateReviewRequest) {
  reviewPending.value = true
  reviewError.value = ''
  try {
    for (const booking of reviewableBookings.value) {
      try {
        await createReview(booking.id, payload)
        reviewedBookingIds.value = new Set(reviewedBookingIds.value).add(booking.id)
        reviewFormOpen.value = false
        reviewMessage.value = 'Спасибо, отзыв опубликован.'
        // Рейтинг и число отзывов тура пересчитываются на бэкенде
        await Promise.all([refreshTour(), refreshReviews()])
        return
      } catch (error) {
        if (!isHttpError(error) || error.statusCode !== 409) throw error
        reviewedBookingIds.value = new Set(reviewedBookingIds.value).add(booking.id)
      }
    }
    reviewFormOpen.value = false
    reviewMessage.value = 'Вы уже оставили отзыв по каждой поездке на этот тур.'
  } catch (error) {
    reviewError.value = await describeReviewError(error)
  } finally {
    reviewPending.value = false
  }
}

async function describeReviewError(error: unknown) {
  if (!isHttpError(error)) return 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
  // Токен просрочен — плагин уже сбросил сессию
  if (error.statusCode === 401) {
    await navigateTo({ path: '/signin', query: { redirect: route.fullPath } })
    return ''
  }
  return (error.data as ErrorDto | undefined)?.message ?? 'Не удалось отправить отзыв.'
}

const reviewDateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

// «2 сентября 2026», без «г.»
function formatReviewDate(date: string) {
  return reviewDateFormatter.format(new Date(date)).replace(/\s?г\.$/, '')
}

// Даты со свободными слотами

const { data: slots } = await useAsyncData('tour-slots',
  () => tourId.value
    ? getSlots(tourId.value, { from: toIsoDate(today), to: toIsoDate(windowEnd) }).catch(() => [])
    : Promise.resolve([]),
  { watch: [tourId] })

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

const dateOptions = computed(() => {
  const dates = new Set((slots.value ?? []).filter(slot => slot.bookable).map(slot => slot.localDate))
  return [...dates].sort().map(date => ({ id: date, label: dateFormatter.format(new Date(`${date}T00:00`)) }))
})

// Выбор даты открывает расписание тура с этим днём
function onDateSelect(date: string) {
  return navigateTo({ path: '/timetable', query: { id: tourId.value, date } })
}

const timezoneLabel = computed(() => tour.value
  ? `${tour.value.city}, ${formatUtcOffset(tour.value.timezone)}`
  : '')
</script>

<template>
  <div v-if="!tour" class="w-full flex flex-col gap-4 py-20">
    <template v-if="!tourId || tourNotFound">
      <h1 class="text-4xl font-extrabold">Тур не найден</h1>
      <p class="text-lg text-gray-text">Возможно, его сняли с публикации. Посмотрите другие туры в каталоге.</p>
      <NuxtLink to="/catalog" class="text-lg text-red-text underline w-fit">Перейти в каталог</NuxtLink>
    </template>
    <p v-else role="alert" class="text-lg text-gray-text">
      Не удалось загрузить тур.
      <button type="button" class="underline text-red-text cursor-pointer" @click="refreshTour()">Повторить</button>
    </p>
  </div>
  <div v-else class="w-full flex justify-between py-10">
    <div class="w-[calc(70%-32px)] flex flex-col gap-4">
      <img v-if="cover" :src="cover" alt="" class="w-full aspect-8/5 object-cover">
      <div v-else class="bg-gray/20 border border-dashed w-full aspect-8/5"></div>
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <p class="px-2 py-0.5 bg-red/10 text-red-text text-sm w-fit">{{ CATEGORY_LABELS[tour.category] }}</p>
          <h4 class="text-5xl font-extrabold">{{ tour.title }}</h4>
          <div class="flex gap-3 items-center text-lg text-gray-text">
            <p>{{ tour.city }}</p>
            <p v-if="tour.rating != null">
              ★ {{ tour.rating.toFixed(1) }} ({{ tour.reviewsCount }} {{ pluralize(tour.reviewsCount, REVIEW_FORMS) }})
            </p>
            <p v-else>Нет отзывов</p>
          </div>
        </div>
        <p class="text-lg text-gray-text whitespace-pre-line">{{ tour.description }}</p>
        <div class="w-full h-0.5 bg-gray"></div>
        <div class="grid grid-cols-3 gap-5">
          <div class="flex flex-col gap-1 p-3">
            <p class="uppercase text-red text-sm">длительность</p>
            <p class="text-lg">{{ formatDuration(tour.durationMinutes) }}</p>
          </div>
          <div class="flex flex-col gap-1 p-3">
            <p class="uppercase text-red text-sm">Размер группы</p>
            <p class="text-lg">До {{ tour.maxPeople }} {{ pluralize(tour.maxPeople, PEOPLE_FORMS) }}</p>
          </div>
          <div class="flex flex-col gap-1 p-3">
            <p class="uppercase text-red text-sm">Место встречи</p>
            <p class="text-lg">{{ tour.meetingPoint }}</p>
          </div>
          <div class="flex flex-col gap-1 p-3">
            <p class="uppercase text-red text-sm">Цена</p>
            <p v-if="tour.price != null" class="text-lg">€{{ tour.price }}</p>
            <p v-else class="text-lg text-gray-text">Не указана</p>
          </div>
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <div class="flex flex-col gap-2">
          <p class="uppercase text-red text-sm">гид</p>
          <div class="flex items-center gap-4">
            <img v-if="tour.guide.avatarUrl" :src="apiUrl(tour.guide.avatarUrl)" alt=""
              class="size-20 rounded-full object-cover shrink-0">
            <div v-else class="size-20 rounded-full bg-gray/10 border border-dashed border-gray-text shrink-0"></div>
            <div class="flex flex-col gap-0.5">
              <h6 class="text-xl font-extrabold">{{ tour.guide.name }}</h6>
              <p v-if="guideLanguages" class="text-[16px] text-gray-text">Языки: {{ guideLanguages }}</p>
              <NuxtLink :to="{ path: '/guide', query: { id: tour.guide.id } }"
                class="text-[16px] text-red-text underline text-left">Профиль гида →</NuxtLink>
            </div>
          </div>
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <div class="flex flex-col gap-3">
          <p class="uppercase text-sm text-red">После бронирования</p>
          <p class="text-gray-text text-lg">Гид подтверждает заявку вручную — обычно в течение суток. Оплата происходит
            не онлайн, гид укажет способ оплаты после подтверждения.</p>
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <div class="flex flex-col gap-4">
          <p class="uppercase text-red text-sm">Отзывы ({{ tour.reviewsCount }})</p>
          <p v-if="reviewMessage" role="status" class="text-lg text-gray-text">{{ reviewMessage }}</p>
          <template v-if="reviewableBookings.length">
            <ReviewForm v-if="reviewFormOpen" id="tour-review" :pending="reviewPending" :error="reviewError"
              @submit="submitReview" @cancel="closeReviewForm" />
            <button v-else type="button"
              class="text-[16px] font-extrabold px-3 py-2 border-2 w-fit border-gray hover:border-red hover:text-red duration-200 cursor-pointer"
              @click="openReviewForm">Оставить отзыв</button>
          </template>
          <p v-if="!reviews.length && !reviewsError" class="text-lg text-gray-text">Отзывов пока нет.</p>
          <div v-for="review in reviews" :key="review.id" class="flex flex-col gap-1">
            <div class="flex w-full justify-between items-end">
              <p class="text-lg font-extrabold">{{ review.authorName }}</p>
              <p class="text-[16px] text-gray-text">{{ formatReviewDate(review.createdAt) }}</p>
            </div>
            <p class="text-lg text-red-text">★ {{ review.rating }}</p>
            <p v-if="review.text" class="text-lg text-gray-text whitespace-pre-line">{{ review.text }}</p>
          </div>
          <p v-if="reviewsError" role="alert" class="text-lg text-gray-text">
            Не удалось загрузить отзывы.
            <button type="button" class="underline text-red-text cursor-pointer"
              @click="loadReviews(reviews.length ? reviewsPage + 1 : 0)">Повторить</button>
          </p>
          <button v-else-if="!reviewsLast" type="button" :disabled="reviewsPending"
            class="text-lg text-red-text underline w-fit cursor-pointer disabled:opacity-50"
            @click="loadReviews(reviewsPage + 1)">
            {{ reviewsPending ? 'Загружаем…' : 'Показать ещё' }}
          </button>
        </div>
      </div>
    </div>
    <div class="w-3/10 flex flex-col p-6 gap-5 bg-gray/10 h-fit">
      <div class="flex flex-col gap-3">
        <h6 v-if="tour.price != null" class="text-3xl font-extrabold text-black">€{{ tour.price }}</h6>
        <h6 v-else class="text-3xl font-extrabold text-gray-text">Цена не указана</h6>
        <p class="text-[16px] text-gray-text">за человека · время указано по часовому поясу тура ({{ timezoneLabel }})</p>
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm text-gray-text">Дата</p>
        <Selector v-if="dateOptions.length" placeholder="Выберите дату" :handler="onDateSelect"
          :options="dateOptions" />
        <p v-else class="text-[16px] text-gray-text">Свободных дат пока нет</p>
      </div>
    </div>
  </div>
</template>
