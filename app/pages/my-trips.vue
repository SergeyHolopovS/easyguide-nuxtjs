<template>
  <div class="flex justify-center w-full">
    <div class="w-200 flex flex-col gap-8 py-20">
      <div class="flex flex-col gap-2">
        <p class="uppercase text-red-text text-[16px] tracking-widest">Личный кабинет</p>
        <p class="text-4xl font-extrabold">Мои поездки</p>
      </div>
      <div class="flex gap-2 items-stretch p-1 bg-smooth-bg w-fit" role="tablist">
        <button v-for="item in tabs" :key="item.id" type="button" role="tab" :aria-selected="tab === item.id"
          class="cursor-pointer px-2 py-1 text-[16px] duration-200"
          :class="tab === item.id ? 'bg-red text-white' : 'bg-bg text-black hover:bg-red hover:text-white'"
          @click="tab = item.id">
          {{ item.label }} ({{ item.id === 'active' ? activeTrips.length : pastTrips.length }})
        </button>
      </div>

      <p v-if="error" role="alert" class="text-lg text-gray-text">
        Не удалось загрузить поездки.
        <button type="button" class="underline text-red-text cursor-pointer" @click="refresh()">Повторить</button>
      </p>
      <p v-else-if="!visibleTrips.length" class="text-lg text-gray-text">
        <template v-if="tab === 'active'">
          Активных поездок нет.
          <NuxtLink to="/catalog" class="underline text-red-text">Найти тур в каталоге</NuxtLink>
        </template>
        <template v-else>Прошедших поездок пока нет.</template>
      </p>

      <div v-for="trip in visibleTrips" :key="trip.id" class="w-full p-5 bg-smooth-bg flex flex-col gap-6 border-2"
        :class="cancelingId === trip.id ? 'border-red' : 'border-transparent'">
        <div class="flex justify-between items-start gap-4">
          <div class="flex flex-col gap-1">
            <NuxtLink :to="{ path: '/timetable', query: { id: trip.tour.id } }"
              class="text-xl font-extrabold hover:text-red-text duration-200">{{ trip.tour.title }}</NuxtLink>
            <p class="text-sm text-gray-text">
              {{ formatSlot(trip) }} · {{ trip.seats }} {{ pluralize(trip.seats, SEAT_FORMS) }} · €{{ trip.totalPrice }}
            </p>
          </div>
          <div class="px-3 py-1 shrink-0" :class="statusBadges[trip.status].class">{{ statusBadges[trip.status].label }}</div>
        </div>

        <p v-if="guideContacts(trip)" class="text-sm">{{ guideContacts(trip) }}</p>
        <p v-if="trip.comment" class="text-sm text-gray-text">Ваш комментарий: {{ trip.comment }}</p>

        <!-- Отмена: API требует указать причину -->
        <template v-if="isCancellable(trip)">
          <form v-if="cancelingId === trip.id" class="flex flex-col gap-3" @submit.prevent="submitCancel(trip)">
            <div class="flex flex-col gap-1">
              <label :for="`cancel-reason-${trip.id}`" class="text-gray-text text-sm">Причина отмены — её увидит гид</label>
              <textarea :id="`cancel-reason-${trip.id}`" v-model="cancelReason" rows="2" maxlength="1000"
                placeholder="Например, изменились планы"
                class="text-[16px] px-3 py-1.5 border border-gray bg-bg outline-none focus:border-black duration-200 resize-none"></textarea>
            </div>
            <p v-if="actionError" role="alert" class="text-sm text-red-text">{{ actionError }}</p>
            <div class="flex gap-3">
              <button type="submit" :disabled="!cancelReason.trim() || actionPending"
                class="text-[16px] font-extrabold px-3 py-2 border-2 w-fit border-red bg-red text-white enabled:hover:bg-transparent enabled:hover:text-red duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {{ actionPending ? 'Отменяем…' : 'Отменить поездку' }}
              </button>
              <button type="button" class="text-[16px] px-3 py-2 text-gray-text hover:text-black duration-200 cursor-pointer"
                @click="closeForms">Не отменять</button>
            </div>
          </form>
          <button v-else type="button"
            class="text-[16px] font-extrabold px-3 py-2 border-2 w-fit border-gray hover:border-red hover:text-red duration-200 cursor-pointer"
            @click="openCancel(trip)">Отменить поездку</button>
        </template>
        <p v-else-if="trip.status === 'CONFIRMED' || trip.status === 'PENDING'" class="text-sm text-gray-text">
          Поездка уже началась — отменить её нельзя.
        </p>

        <!-- Отзыв: один на завершённую бронь -->
        <template v-if="trip.status === 'COMPLETED'">
          <p v-if="reviewedIds.has(trip.id)" role="status" class="text-sm text-gray-text">Спасибо, отзыв сохранён.</p>
          <form v-else-if="reviewingId === trip.id" class="flex flex-col gap-3" @submit.prevent="submitReview(trip)">
            <div class="flex flex-col gap-1">
              <p :id="`review-rating-${trip.id}`" class="text-gray-text text-sm">Оценка</p>
              <div class="flex gap-1" role="radiogroup" :aria-labelledby="`review-rating-${trip.id}`">
                <button v-for="star in 5" :key="star" type="button" role="radio" :aria-checked="review.rating === star"
                  :aria-label="`${star} из 5`" class="text-2xl cursor-pointer duration-200"
                  :class="star <= review.rating ? 'text-red-text' : 'text-gray-text/50 hover:text-red-text'"
                  @click="review.rating = star">★</button>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label :for="`review-text-${trip.id}`" class="text-gray-text text-sm">Отзыв (необязательно)</label>
              <textarea :id="`review-text-${trip.id}`" v-model="review.text" rows="3" :maxlength="REVIEW_MAX_LENGTH"
                placeholder="Что понравилось, что можно улучшить"
                class="text-[16px] px-3 py-1.5 border border-gray bg-bg outline-none focus:border-black duration-200 resize-none"></textarea>
            </div>
            <p v-if="actionError" role="alert" class="text-sm text-red-text">{{ actionError }}</p>
            <div class="flex gap-3">
              <button type="submit" :disabled="!review.rating || actionPending"
                class="text-[16px] font-extrabold px-3 py-2 border-2 w-fit border-red bg-red text-white enabled:hover:bg-transparent enabled:hover:text-red duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {{ actionPending ? 'Отправляем…' : 'Отправить отзыв' }}
              </button>
              <button type="button" class="text-[16px] px-3 py-2 text-gray-text hover:text-black duration-200 cursor-pointer"
                @click="closeForms">Отмена</button>
            </div>
          </form>
          <button v-else type="button"
            class="text-[16px] font-extrabold px-3 py-2 border-2 w-fit border-gray hover:border-red hover:text-red duration-200 cursor-pointer"
            @click="openReview(trip)">Оставить отзыв</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { BookingListItemResponse, BookingStatus, ErrorDto } from '~/types/api'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Мои поездки — EasyGuide' })

// Защита от бесконечной загрузки: 25 страниц по 20 броней
const MAX_PAGES = 25
const REVIEW_MAX_LENGTH = 2000

type Tab = 'active' | 'past'

const tabs: { id: Tab, label: string }[] = [
  { id: 'active', label: 'Активные' },
  { id: 'past', label: 'Прошедшие' },
]

const statusBadges: Record<BookingStatus, { label: string, class: string }> = {
  PENDING: { label: 'Ждёт подтверждения', class: 'border border-red text-red-text' },
  CONFIRMED: { label: 'Подтверждена', class: 'bg-red/10 text-red-text' },
  REJECTED: { label: 'Отклонена', class: 'bg-gray/15 text-gray-text' },
  CANCELLED: { label: 'Отменена', class: 'bg-gray/15 text-gray-text' },
  COMPLETED: { label: 'Завершена', class: 'bg-gray/15 text-black' },
}

const { getMyBookings, cancelBooking, createReview } = useBookings()

// Делить на вкладки приходится по статусу и времени начала, поэтому грузим все страницы
async function loadAllBookings() {
  const all: BookingListItemResponse[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await getMyBookings({ page })
    all.push(...response.content)
    if (response.last) break
  }
  return all
}

const { data, error, refresh } = await useAsyncData('my-trips', loadAllBookings)

// Токен просрочен — плагин уже сбросил сессию, отправляем на вход
if (isHttpError(error.value) && error.value.statusCode === 401) {
  await navigateTo({ path: '/signin', query: { redirect: '/my-trips' } })
}

const tab = ref<Tab>('active')

// Момент начала слота: местные дата и время в часовом поясе тура → UTC
function slotStart(trip: BookingListItemResponse) {
  const asUtc = new Date(`${trip.slot.date}T${trip.slot.time}Z`)
  return new Date(asUtc.getTime() - timezoneOffsetMs(trip.slot.timezone, asUtc))
}

function timezoneOffsetMs(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(at)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value)
  const local = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'))
  return local - at.getTime()
}

const now = ref(Date.now())

function isUpcoming(trip: BookingListItemResponse) {
  return slotStart(trip).getTime() > now.value
}

function isActive(trip: BookingListItemResponse) {
  return (trip.status === 'PENDING' || trip.status === 'CONFIRMED') && isUpcoming(trip)
}

// Подтверждённая, но уже начавшаяся поездка остаётся в активных, пока гид её не завершит
const activeTrips = computed(() => (data.value ?? [])
  .filter(trip => isActive(trip) || (trip.status === 'CONFIRMED' && !isUpcoming(trip)))
  .sort((a, b) => slotStart(a).getTime() - slotStart(b).getTime()))

const pastTrips = computed(() => (data.value ?? [])
  .filter(trip => !activeTrips.value.includes(trip))
  .sort((a, b) => slotStart(b).getTime() - slotStart(a).getTime()))

const visibleTrips = computed(() => tab.value === 'active' ? activeTrips.value : pastTrips.value)

function isCancellable(trip: BookingListItemResponse) {
  return isActive(trip)
}

// Действия с бронью: открыта может быть только одна форма

const cancelingId = ref('')
const cancelReason = ref('')
const reviewingId = ref('')
const review = reactive({ rating: 0, text: '' })
const reviewedIds = ref(new Set<string>())
const actionPending = ref(false)
const actionError = ref('')

function closeForms() {
  cancelingId.value = ''
  reviewingId.value = ''
  actionError.value = ''
}

function openCancel(trip: BookingListItemResponse) {
  closeForms()
  cancelReason.value = ''
  cancelingId.value = trip.id
}

function openReview(trip: BookingListItemResponse) {
  closeForms()
  review.rating = 0
  review.text = ''
  reviewingId.value = trip.id
}

async function submitCancel(trip: BookingListItemResponse) {
  if (!cancelReason.value.trim()) return

  actionPending.value = true
  actionError.value = ''
  try {
    await cancelBooking(trip.id, cancelReason.value.trim())
    closeForms()
    now.value = Date.now()
    await refresh()
  } catch (error) {
    // 409 — бронь уже нельзя отменить (слот начался или статус изменился)
    actionError.value = await describeError(error, 'Не удалось отменить поездку.')
    if (isHttpError(error) && error.statusCode === 409) await refresh()
  } finally {
    actionPending.value = false
  }
}

async function submitReview(trip: BookingListItemResponse) {
  if (!review.rating) return

  actionPending.value = true
  actionError.value = ''
  try {
    await createReview(trip.id, { rating: review.rating, text: review.text.trim() || null })
    reviewedIds.value = new Set(reviewedIds.value).add(trip.id)
    closeForms()
  } catch (error) {
    // 409 — отзыв по этой брони уже есть
    if (isHttpError(error) && error.statusCode === 409) {
      reviewedIds.value = new Set(reviewedIds.value).add(trip.id)
      closeForms()
      return
    }
    actionError.value = await describeError(error, 'Не удалось отправить отзыв.')
  } finally {
    actionPending.value = false
  }
}

async function describeError(error: unknown, fallback: string) {
  if (!isHttpError(error)) return 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
  if (error.statusCode === 401) {
    await navigateTo({ path: '/signin', query: { redirect: '/my-trips' } })
    return ''
  }
  return (error.data as ErrorDto | undefined)?.message ?? fallback
}

// Форматирование

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

// «27 сентября, 10:00 (Лиссабон, UTC+1)» — время местное для тура
function formatSlot(trip: BookingListItemResponse) {
  const date = dateFormatter.format(new Date(`${trip.slot.date}T00:00`))
  const offset = new Intl.DateTimeFormat('en-US', { timeZone: trip.slot.timezone, timeZoneName: 'shortOffset' })
    .formatToParts(slotStart(trip))
    .find(part => part.type === 'timeZoneName')?.value
    .replace('GMT', 'UTC') ?? trip.slot.timezone
  return `${date}, ${trip.slot.time.slice(0, 5)} (${trip.tour.city}, ${offset === 'UTC' ? 'UTC+0' : offset})`
}

function guideContacts(trip: BookingListItemResponse) {
  const guide = trip.counterparty
  if (!guide) return ''
  const contacts = [guide.phone, guide.email].filter(Boolean).join(' · ')
  return contacts ? `Гид ${guide.name}: ${contacts}` : `Гид ${guide.name}`
}
</script>
