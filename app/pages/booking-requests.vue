<template>
  <div class="flex justify-center pt-12 pb-20">
    <div class="flex flex-col gap-10 max-w-200 w-full">
      <div class="flex flex-col gap-2">
        <p class="text-red-text tracking-widest text-[16px] uppercase font-light">Личный кабинет гида</p>
        <h2 class="text-4xl font-extrabold">Заявки на бронирование</h2>
      </div>

      <template v-if="!isGuide">
        <p class="text-lg text-gray-text">Заявки получают только гиды. Включите роль гида в профиле — это займёт минуту.</p>
        <NuxtLink to="/profile" class="text-lg text-red-text underline w-fit">Перейти в профиль</NuxtLink>
      </template>
      <template v-else>
        <div class="flex items-center flex-wrap w-full gap-2" role="tablist">
          <button v-for="filter in filters" :key="filter.value" type="button" role="tab"
            :aria-selected="filter.value === activeFilter"
            class="text-[16px] px-3 py-1 border-2 cursor-pointer duration-200"
            :class="filter.value === activeFilter ? 'border-red bg-red text-white' : 'border-gray text-red hover:border-red'"
            @click="activeFilter = filter.value">
            {{ filter.label }} ({{ countByFilter(filter.value) }})
          </button>
        </div>

        <p v-if="error" role="alert" class="text-lg text-gray-text">
          Не удалось загрузить заявки.
          <button type="button" class="underline text-red-text cursor-pointer" @click="refresh()">Повторить</button>
        </p>
        <p v-else-if="!pendingRequests.length && !processedRequests.length" class="text-lg text-gray-text">
          {{ activeFilter === 'all' ? 'Заявок пока нет — они появятся, когда туристы забронируют ваши туры.' : 'В этом разделе заявок нет.' }}
        </p>

        <div v-if="pendingRequests.length" class="flex flex-col gap-4">
          <h3 class="text-2xl font-extrabold">Ожидают решения</h3>
          <div v-for="request in pendingRequests" :key="request.id" class="p-5 border-2 border-red flex flex-col gap-5 bg-smooth-bg">
            <div class="flex w-full justify-between gap-4">
              <div class="flex flex-col gap-1">
                <NuxtLink :to="{ path: '/timetable', query: { id: request.tour.id } }"
                  class="text-xl font-extrabold hover:text-red-text duration-200">{{ request.tour.title }}</NuxtLink>
                <p class="text-[16px] text-gray-text">{{ summary(request) }}</p>
              </div>
              <div class="p-3 h-fit shrink-0" :class="statusBadges.PENDING.class">{{ statusBadges.PENDING.label }}</div>
            </div>
            <div class="flex flex-col gap-2 text-[16px]">
              <p>Турист: {{ request.counterparty.name }}</p>
              <p v-if="contacts(request)">{{ contacts(request) }}</p>
              <p v-if="request.comment" class="text-gray-text">Комментарий: «{{ request.comment }}»</p>
            </div>
            <p v-if="isPast(request)" class="text-sm text-gray-text">Тур уже начался — заявку больше нельзя подтвердить.</p>
            <div v-else class="flex gap-4 items-center">
              <button type="button" :disabled="pendingId === request.id"
                class="px-3 py-1 bg-red border-2 border-red enabled:hover:bg-red/0 duration-200 text-[16px] cursor-pointer font-bold text-white enabled:hover:text-red disabled:opacity-60 disabled:cursor-wait"
                @click="onConfirm(request)">
                {{ pendingId === request.id && pendingAction === 'confirm' ? 'Подтверждаем…' : 'Подтвердить' }}
              </button>
              <button type="button" :disabled="pendingId === request.id"
                class="px-3 py-1 border-2 border-gray duration-200 text-[16px] cursor-pointer font-bold text-black enabled:hover:text-red disabled:opacity-60 disabled:cursor-wait"
                @click="onReject(request)">
                {{ pendingId === request.id && pendingAction === 'reject' ? 'Отклоняем…' : 'Отклонить' }}
              </button>
            </div>
            <p v-if="actionErrors[request.id]" role="alert" class="text-sm text-red-text">{{ actionErrors[request.id] }}</p>
          </div>
        </div>

        <div v-if="processedRequests.length" class="flex flex-col gap-4">
          <h3 class="text-2xl font-extrabold">Обработанные</h3>
          <div v-for="request in processedRequests" :key="request.id" class="p-5 flex flex-col gap-5 bg-smooth-bg">
            <div class="flex w-full justify-between gap-4">
              <div class="flex flex-col gap-1">
                <NuxtLink :to="{ path: '/timetable', query: { id: request.tour.id } }"
                  class="text-xl font-extrabold hover:text-red-text duration-200">{{ request.tour.title }}</NuxtLink>
                <p class="text-[16px] text-gray-text">{{ summary(request) }}</p>
              </div>
              <div class="p-3 h-fit shrink-0" :class="statusBadges[request.status].class">{{ statusBadges[request.status].label }}</div>
            </div>
            <div class="flex flex-col gap-2 text-[16px]">
              <p>Турист: {{ request.counterparty.name }}</p>
              <p v-if="contacts(request)">{{ contacts(request) }}</p>
              <p v-if="request.comment" class="text-gray-text">Комментарий: «{{ request.comment }}»</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { BookingListItemResponse, BookingStatus, ErrorDto } from '~/types/api'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Заявки на бронирование — EasyGuide' })

// Защита от бесконечной загрузки: 25 страниц по 20 заявок
const MAX_PAGES = 25

type RequestFilter = 'all' | BookingStatus

const filters: { label: string, value: RequestFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидают', value: 'PENDING' },
  { label: 'Подтверждены', value: 'CONFIRMED' },
  { label: 'Отклонены', value: 'REJECTED' },
  { label: 'Отменены', value: 'CANCELLED' },
  { label: 'Завершены', value: 'COMPLETED' },
]

const statusBadges: Record<BookingStatus, { label: string, class: string }> = {
  PENDING: { label: 'Ожидает решения', class: 'text-red-text bg-red/10' },
  CONFIRMED: { label: 'Подтверждена', class: 'text-red-text bg-red/10' },
  REJECTED: { label: 'Отклонена', class: 'text-gray-text bg-bg' },
  CANCELLED: { label: 'Отменена', class: 'text-gray-text bg-bg' },
  COMPLETED: { label: 'Завершена', class: 'text-black bg-bg' },
}

const { user, loadUser } = useAuth()
const { getGuideBookings, confirmBooking, rejectBooking } = useBookings()

await loadUser()

const isGuide = computed(() => !!user.value?.isGuide)

// Делить на «ожидают» и «обработанные» и считать фильтры удобнее по полному списку
async function loadAllRequests() {
  const all: BookingListItemResponse[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await getGuideBookings({ page })
    all.push(...response.content)
    if (response.last) break
  }
  return all
}

const { data, error, refresh } = await useAsyncData('booking-requests',
  () => isGuide.value ? loadAllRequests() : Promise.resolve([]))

const requests = computed(() => data.value ?? [])
const activeFilter = ref<RequestFilter>('all')

const filtered = computed(() => activeFilter.value === 'all'
  ? requests.value
  : requests.value.filter(request => request.status === activeFilter.value))

// Ближайшие заявки — первыми; обработанные — от новых поездок к старым
const pendingRequests = computed(() => filtered.value
  .filter(request => request.status === 'PENDING')
  .sort((a, b) => bookingStart(a).getTime() - bookingStart(b).getTime()))

const processedRequests = computed(() => filtered.value
  .filter(request => request.status !== 'PENDING')
  .sort((a, b) => bookingStart(b).getTime() - bookingStart(a).getTime()))

function countByFilter(filter: RequestFilter) {
  return filter === 'all' ? requests.value.length : requests.value.filter(request => request.status === filter).length
}

function isPast(request: BookingListItemResponse) {
  return bookingStart(request).getTime() <= Date.now()
}

function summary(request: BookingListItemResponse) {
  return `${formatBookingSlot(request)} · ${request.seats} ${pluralize(request.seats, SEAT_FORMS)} · €${request.totalPrice}`
}

function contacts(request: BookingListItemResponse) {
  const { phone, email } = request.counterparty
  return [phone && `Телефон: ${phone}`, email && `Email: ${email}`].filter(Boolean).join(' · ')
}

// Решение по заявке

const pendingId = ref('')
const pendingAction = ref<'confirm' | 'reject' | null>(null)
const actionErrors = reactive<Record<string, string>>({})

async function onConfirm(request: BookingListItemResponse) {
  await decide(request, 'confirm')
}

async function onReject(request: BookingListItemResponse) {
  if (!confirm(`Отклонить заявку ${request.counterparty.name} на «${request.tour.title}»? Места вернутся в слот.`)) return
  await decide(request, 'reject')
}

async function decide(request: BookingListItemResponse, action: 'confirm' | 'reject') {
  pendingId.value = request.id
  pendingAction.value = action
  delete actionErrors[request.id]
  try {
    const updated = action === 'confirm' ? await confirmBooking(request.id) : await rejectBooking(request.id)
    data.value = requests.value.map(item => item.id === request.id ? { ...item, status: updated.status } : item)
    // Контакты туриста могут появиться только после подтверждения — догружаем список в фоне
    refresh()
    // Счётчик в шапке
    refreshNuxtData(PENDING_COUNT_KEY)
  } catch (error) {
    if (isHttpError(error) && error.statusCode === 401) {
      await navigateTo({ path: '/signin', query: { redirect: '/booking-requests' } })
      return
    }
    // 409 — заявку уже отменил турист или слот начался: показываем актуальное состояние
    if (isHttpError(error) && error.statusCode === 409) await refresh()
    const message = isHttpError(error) ? (error.data as ErrorDto | undefined)?.message : undefined
    actionErrors[request.id] = message ?? (action === 'confirm' ? 'Не удалось подтвердить заявку.' : 'Не удалось отклонить заявку.')
  } finally {
    pendingId.value = ''
    pendingAction.value = null
  }
}
</script>
