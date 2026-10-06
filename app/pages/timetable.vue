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
  <div v-else class="w-full flex flex-col gap-10 py-20">
    <div class="flex flex-col gap-2">
      <p class="uppercase text-red-text text-[16px] tracking-widest">Расписание тура</p>
      <h1 class="text-4xl font-extrabold">{{ tour.title }}</h1>
      <p class="text-[16px]">
        <span v-if="tour.price != null" class="font-extrabold">€{{ tour.price }}</span>
        <span v-else class="text-gray-text">Цена не указана</span>
        <span class="text-gray-text"> за человека · {{ formatDuration(tour.durationMinutes) }} · встреча: {{ tour.meetingPoint }}</span>
      </p>
      <p class="text-sm text-gray-text">Всё время — по часовому поясу тура: {{ tour.city }} ({{ tour.timezone }})</p>
    </div>
    <div class="w-full flex border-y-2 border-gray">
      <div class="flex flex-col gap-3 border-r-2 w-1/2 py-10 pr-5 border-gray">
        <div class="w-full flex justify-between items-end">
          <h2 class="text-lg font-extrabold">1. {{ isOwner ? 'Даты' : 'Дата' }}</h2>
          <p class="text-sm text-gray-text">{{ isOwner ? 'Можно выбрать несколько' : 'Число — свободные слоты' }}</p>
        </div>
        <div class="flex justify-between w-full items-center">
          <button type="button" aria-label="Предыдущий месяц" :disabled="visibleMonth <= firstMonth"
            class="size-10 flex items-center justify-center text-lg text-red-text enabled:hover:bg-red/10 duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-default"
            @click="shiftMonth(-1)">←</button>
          <p class="text-lg font-extrabold">{{ monthTitle }}</p>
          <button type="button" aria-label="Следующий месяц" :disabled="visibleMonth >= lastMonth"
            class="size-10 flex items-center justify-center text-lg text-red-text enabled:hover:bg-red/10 duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-default"
            @click="shiftMonth(1)">→</button>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <p v-for="day in days" :key="day" class="text-sm text-gray-text">{{ day }}</p>
          <template v-for="(week, weekIndex) in calendar" :key="weekIndex">
            <template v-for="(cell, index) in week" :key="`${weekIndex}-${index}`">
              <button v-if="cell" type="button" :disabled="!isDateSelectable(cell)" :aria-pressed="isDateSelected(cell.date)"
                class="group w-full aspect-square border-2 duration-200 text-start p-2 flex gap-1 items-start enabled:cursor-pointer enabled:hover:bg-red enabled:hover:border-red enabled:hover:text-white disabled:text-gray-text/50"
                :class="isDateSelected(cell.date) ? 'bg-red border-red text-white' : 'border-gray'"
                @click="onDateClick(cell.date)">
                <span>{{ cell.day }}</span>
                <span v-if="cell.slots" class="duration-200 group-enabled:group-hover:text-white"
                  :class="isDateSelected(cell.date) ? 'text-white' : 'text-red-text'">·{{ cell.slots }}</span>
              </button>
              <div v-else></div>
            </template>
          </template>
        </div>
        <div v-if="isOwner" class="flex gap-3 items-center text-sm">
          <button type="button"
            class="px-2 py-0.5 border border-red text-red-text hover:bg-red hover:text-white duration-200 cursor-pointer"
            @click="selectMonthDays('weekends')">Все выходные месяца</button>
          <button type="button"
            class="px-2 py-0.5 border border-red text-red-text hover:bg-red hover:text-white duration-200 cursor-pointer"
            @click="selectMonthDays('weekdays')">Все будни месяца</button>
          <button v-if="guideDates.length" type="button" class="px-2 py-0.5 text-gray-text hover:text-red-text duration-200 cursor-pointer"
            @click="guideDates = []">Сбросить ({{ guideDates.length }})</button>
        </div>
      </div>

      <!-- Владелец тура управляет расписанием -->
      <form v-if="isOwner" class="flex flex-col gap-6 w-1/2 py-10 pl-5" @submit.prevent="submitSlots">
        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-extrabold">2. Время начала</h2>
          <div v-if="guideTimes.length" class="flex gap-3 flex-wrap">
            <button v-for="time in guideTimes" :key="time" type="button" :aria-label="`Удалить время ${time}`"
              class="bg-red/10 px-3 py-1 flex gap-2 items-center cursor-pointer" @click="removeTime(time)">
              <span class="text-[16px] text-red-text">{{ time }}</span>
              <span class="flex text-red-text">
                <Icon name="akar-icons:cross" size="0.8rem" />
              </span>
            </button>
          </div>
          <div class="flex flex-col gap-2">
            <label for="slot-time" class="text-sm text-gray-text">Добавить время</label>
            <div class="flex gap-3">
              <input id="slot-time" v-model="newTime" type="time"
                class="flex-1 h-11 px-3 text-[16px] bg-gray/10 border border-gray-text outline-none focus:border-red duration-200"
                @keydown.enter.prevent="addTime">
              <button type="button" :disabled="!newTime"
                class="shrink-0 h-11 px-4 border text-lg font-extrabold duration-200 disabled:opacity-50 disabled:border-gray-text disabled:text-gray-text enabled:border-red enabled:text-red-text enabled:hover:bg-red enabled:hover:text-white enabled:cursor-pointer"
                @click="addTime">Добавить</button>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <label for="slot-capacity" class="text-lg font-extrabold">3. Мест в каждом слоте</label>
          <input id="slot-capacity" v-model.number="capacity" type="number" min="1"
            class="w-32 px-3 text-[16px] h-11 border border-gray-text bg-gray/10 outline-none focus:border-red duration-200">
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <p v-if="guideMessage" role="status" class="text-[16px]">{{ guideMessage }}</p>
        <p v-else class="text-[16px]">{{ guideHint }}</p>
        <p v-if="guideError" role="alert" class="text-[16px] text-red-text">{{ guideError }}</p>
        <button type="submit" :disabled="!canCreateSlots || guidePending"
          class="px-3 py-1 font-extrabold text-lg w-fit text-white border border-red bg-red enabled:hover:text-red enabled:hover:bg-transparent duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
          {{ guidePending ? 'Создаём…' : 'Создать слоты' }}
        </button>
      </form>

      <!-- Турист бронирует места -->
      <form v-else ref="bookingForm" class="flex flex-col gap-6 w-1/2 py-10 pl-5" novalidate @submit.prevent="submitBooking">
        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-extrabold">2. Время начала</h2>
          <p v-if="!selectedDate" class="text-[16px] text-gray-text">Выберите дату в календаре.</p>
          <div v-else class="flex gap-3 flex-wrap">
            <button v-for="slot in daySlots" :key="slot.id" type="button" :disabled="!slot.bookable"
              :aria-pressed="slot.id === selectedSlotId"
              class="px-3 py-1 border text-[16px] duration-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer"
              :class="slot.id === selectedSlotId ? 'bg-red border-red text-white' : 'border-red text-red-text enabled:hover:bg-red/10'"
              @click="selectSlot(slot)">
              {{ formatTime(slot.localTime) }}
              <span class="text-sm">· {{ slot.bookable ? `${slot.availableSeats} ${pluralize(slot.availableSeats, SEAT_FORMS)}` : 'недоступно' }}</span>
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <label for="booking-seats" class="text-lg font-extrabold">3. Количество мест</label>
          <input id="booking-seats" v-model.number="booking.seats" type="number" min="1" :max="selectedSlot?.availableSeats"
            :aria-invalid="!!visibleBookingErrors.seats" :aria-describedby="visibleBookingErrors.seats ? 'booking-seats-error' : undefined"
            class="w-32 px-3 text-[16px] h-11 border bg-gray/10 outline-none focus:border-red duration-200"
            :class="visibleBookingErrors.seats ? 'border-red' : 'border-gray-text'">
          <p v-if="visibleBookingErrors.seats" id="booking-seats-error" class="text-red-text text-sm">{{ visibleBookingErrors.seats }}</p>
        </div>
        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-extrabold">4. Контакты</h2>
          <BaseInput v-model="booking.phone" label="Телефон для связи с гидом" type="tel" autocomplete="tel"
            placeholder="+7 900 123-45-67" :error="visibleBookingErrors.phone" />
          <div class="flex flex-col gap-1">
            <label for="booking-comment" class="text-gray-text text-sm">Комментарий гиду (необязательно)</label>
            <textarea id="booking-comment" v-model="booking.comment" rows="3" :maxlength="COMMENT_MAX_LENGTH"
              placeholder="Например, придём с ребёнком"
              class="text-[16px] px-3 py-1.5 border border-gray bg-smooth-bg outline-none focus:border-black duration-200 resize-none"></textarea>
          </div>
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <div v-if="bookingResult" role="status" class="flex flex-col gap-1">
          <p class="text-lg font-extrabold">Заявка отправлена</p>
          <p class="text-[16px] text-gray-text">
            {{ bookingResult.seats }} {{ pluralize(bookingResult.seats, SEAT_FORMS) }} · €{{ bookingResult.totalPrice }}.
            Гид подтвердит бронь вручную — обычно в течение суток. Статус — в разделе
            <NuxtLink to="/my-trips" class="text-red-text underline">Мои поездки</NuxtLink>.
          </p>
        </div>
        <p v-else class="text-[16px]">{{ bookingSummary }}</p>
        <p v-if="bookingError" role="alert" class="text-[16px] text-red-text">{{ bookingError }}</p>
        <p v-if="!isAuthenticated" class="text-sm text-gray-text">Чтобы забронировать, войдите в аккаунт — выбранное время сохранится.</p>
        <button type="submit" :disabled="!selectedSlot || bookingPending"
          class="px-3 py-1 font-extrabold text-lg w-fit text-white border border-red bg-red enabled:hover:text-red enabled:hover:bg-transparent duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
          {{ bookingButtonLabel }}
        </button>
      </form>
    </div>

    <div class="flex flex-col gap-5">
      <div class="flex items-end gap-1">
        <h2 class="font-extrabold text-3xl">Предстоящие слоты</h2>
        <p class="text-[16px] text-gray-text">({{ upcomingSlots.length }})</p>
      </div>
      <p v-if="slotsError" role="alert" class="text-lg text-gray-text">
        Не удалось загрузить расписание.
        <button type="button" class="underline text-red-text cursor-pointer" @click="refreshSlots()">Повторить</button>
      </p>
      <p v-else-if="!upcomingSlots.length" class="text-lg text-gray-text">
        {{ isOwner ? 'Слотов пока нет — создайте их выше.' : 'Ближайших слотов нет — загляните позже.' }}
      </p>
      <div v-else role="table" aria-label="Предстоящие слоты" class="flex flex-col gap-2">
        <div role="row" class="grid grid-cols-8 px-2 gap-4">
          <span role="columnheader" class="text-sm text-gray-text font-bold uppercase col-span-2">Дата</span>
          <span role="columnheader" class="text-sm text-gray-text font-bold uppercase col-span-1">Время</span>
          <span role="columnheader" class="text-sm text-gray-text font-bold uppercase col-span-1">Занято</span>
          <span role="columnheader" class="text-sm text-gray-text font-bold uppercase col-span-4">Статус</span>
        </div>
        <p v-if="slotActionError" role="alert" class="text-[16px] text-red-text px-2">{{ slotActionError }}</p>
        <div class="flex flex-col border-t-2 border-gray">
          <div v-for="slot in upcomingSlots" :key="slot.id" role="row"
            class="grid grid-cols-8 border-b border-gray py-4 px-2 gap-4"
            :class="{ 'bg-red/5': slot.id === selectedSlotId }">
            <p role="cell" class="text-[16px] col-span-2">{{ formatDate(slot.localDate) }}</p>
            <p role="cell" class="text-[16px] col-span-1">{{ formatTime(slot.localTime) }}</p>
            <div role="cell" class="text-[16px] col-span-1 flex w-full justify-between items-center">
              <p>{{ bookedSeats(slot) }}/{{ slot.capacity }}</p>
              <div class="w-3/5 h-2 bg-gray/15">
                <div class="h-full" :class="getStatus(slot) === 'full' ? 'bg-red' : 'bg-black'"
                  :style="{ width: `${(bookedSeats(slot) / slot.capacity) * 100}%` }"></div>
              </div>
            </div>
            <div role="cell" class="flex justify-between items-center col-span-4">
              <p class="px-3 py-0.5 text-sm" :class="statusBadges[getStatus(slot)].class">
                {{ statusLabel(slot) }}
              </p>
              <button v-if="isOwner && getStatus(slot) !== 'unavailable'" type="button" :disabled="slotActionId === slot.id"
                class="text-sm px-2 py-1 font-extrabold text-red-text border-red/0 hover:border-red border-2 duration-200 cursor-pointer disabled:opacity-50"
                @click="onSlotAction(slot)">
                {{ bookedSeats(slot) ? 'Отменить слот' : 'Удалить' }}
              </button>
              <button v-else-if="!isOwner && slot.bookable" type="button"
                class="text-sm px-2 py-1 font-extrabold text-red-text border-red/0 hover:border-red border-2 duration-200 cursor-pointer"
                @click="pickSlot(slot)">
                {{ slot.id === selectedSlotId ? 'Выбран' : 'Выбрать' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isOwner" class="flex gap-4 flex-col">
        <button type="button"
          class="px-2 py-1 text-lg font-bold text-red-text hover:bg-red/5 duration-200 cursor-pointer w-fit"
          @click="togglePast">
          {{ showPast ? 'Скрыть' : 'Показать' }} прошедшие<template v-if="pastData"> ({{ pastSlots.length }})</template>
        </button>
        <template v-if="showPast">
          <p v-if="pastStatus === 'pending'" class="text-[16px] text-gray-text px-2">Загружаем…</p>
          <p v-else-if="pastError" role="alert" class="text-[16px] text-gray-text px-2">Не удалось загрузить прошедшие слоты.</p>
          <p v-else-if="!pastSlots.length" class="text-[16px] text-gray-text px-2">За последние три месяца слотов не было.</p>
          <div v-else role="table" aria-label="Прошедшие слоты" class="flex flex-col">
            <div v-for="slot in pastSlots" :key="slot.id" role="row"
              class="grid grid-cols-8 gap-4 text-gray-text text-[16px] px-2 py-3 border-b border-gray">
              <p role="cell" class="col-span-2">{{ formatDate(slot.localDate) }}</p>
              <p role="cell" class="col-span-1">{{ formatTime(slot.localTime) }}</p>
              <p role="cell" class="col-span-1">{{ bookedSeats(slot) }}/{{ slot.capacity }}</p>
              <p role="cell" class="col-span-4 text-sm">Прошёл</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ErrorDto, SlotViewResponse } from '~/types/api'

// API отдаёт слоты не больше чем за 92 дня
const SLOTS_WINDOW_DAYS = 92
const MAX_BULK_SLOTS = 200
const COMMENT_MAX_LENGTH = 1000

interface CalendarCell {
  date: string
  day: number
  slots: number
}

type SlotStatus = 'free' | 'booked' | 'full' | 'unavailable'

const route = useRoute()
const { getTour, getSlots, createSlotsBulk, cancelSlot, deleteSlot } = useTours()
const { createBooking } = useBookings()
const { user, isAuthenticated, fetchUser } = useAuth()

const tourId = computed(() => typeof route.query.id === 'string' ? route.query.id : '')

// Даты — строки YYYY-MM-DD по локальному календарю, без перевода в UTC
function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function parseIsoDate(date: string) {
  return new Date(`${date}T00:00`)
}

function addDays(date: string, amount: number) {
  const result = parseIsoDate(date)
  result.setDate(result.getDate() + amount)
  return toIsoDate(result)
}

const today = toIsoDate(new Date())
const windowEnd = addDays(today, SLOTS_WINDOW_DAYS - 1)

const { data: tour, error: tourError, refresh: refreshTour } = await useAsyncData('timetable-tour',
  () => tourId.value ? getTour(tourId.value) : Promise.resolve(null), { watch: [tourId] })

const tourNotFound = computed(() => isHttpError(tourError.value) && tourError.value.statusCode === 404)

useHead({ title: () => tour.value ? `${tour.value.title} — расписание` : 'Расписание тура' })

// Профиль нужен, чтобы узнать владельца тура и подставить телефон; ошибку не показываем
await useAsyncData('timetable-user',
  () => isAuthenticated.value && !user.value ? fetchUser() : Promise.resolve(user.value))

const isOwner = computed(() => !!user.value && user.value.id === tour.value?.guide.id)

const { data: slotsData, error: slotsError, refresh: refreshSlots } = await useAsyncData('timetable-slots',
  () => tourId.value ? getSlots(tourId.value, { from: today, to: windowEnd }) : Promise.resolve([]), { watch: [tourId] })

const upcomingSlots = computed(() => [...(slotsData.value ?? [])].sort((a, b) => a.startsAt.localeCompare(b.startsAt)))

const slotsByDate = computed(() => {
  const map = new Map<string, SlotViewResponse[]>()
  for (const slot of upcomingSlots.value) {
    const list = map.get(slot.localDate) ?? []
    list.push(slot)
    map.set(slot.localDate, list)
  }
  return map
})

function bookedSeats(slot: SlotViewResponse) {
  return slot.capacity - slot.availableSeats
}

// Отменённый или уже начавшийся слот приходит с bookable=false, хотя места в нём есть
function getStatus(slot: SlotViewResponse): SlotStatus {
  if (slot.availableSeats === 0) return 'full'
  if (!slot.bookable) return 'unavailable'
  return bookedSeats(slot) ? 'booked' : 'free'
}

const statusBadges: Record<SlotStatus, { label: string, class: string }> = {
  free: { label: 'Свободен', class: 'border border-red text-red-text' },
  booked: { label: 'Есть брони', class: 'border border-red text-red-text' },
  full: { label: 'Мест нет', class: 'bg-red/5 text-red-text' },
  unavailable: { label: 'Недоступен', class: 'bg-gray/15 text-gray-text' },
}

// Туристу важнее число свободных мест, чем наличие чужих броней
function statusLabel(slot: SlotViewResponse) {
  if (!isOwner.value && slot.bookable) return `Свободно ${slot.availableSeats} ${pluralize(slot.availableSeats, SEAT_FORMS)}`
  return statusBadges[getStatus(slot)].label
}

// Календарь

const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']
const firstMonth = today.slice(0, 7)
const lastMonth = windowEnd.slice(0, 7)
const visibleMonth = ref(firstMonth)

const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long' })

const monthTitle = computed(() => {
  const first = parseIsoDate(`${visibleMonth.value}-01`)
  const month = monthFormatter.format(first)
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${first.getFullYear()}`
})

function shiftMonth(delta: number) {
  const first = parseIsoDate(`${visibleMonth.value}-01`)
  first.setMonth(first.getMonth() + delta)
  visibleMonth.value = toIsoDate(first).slice(0, 7)
}

function monthDates() {
  const first = parseIsoDate(`${visibleMonth.value}-01`)
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return Array.from({ length: count }, (_, index) => addDays(toIsoDate(first), index))
}

// Гиду показываем все слоты дня, туристу — только доступные для брони
const calendar = computed(() => {
  const dates = monthDates()
  const offset = (parseIsoDate(dates[0]!).getDay() + 6) % 7
  const cells: (CalendarCell | null)[] = Array.from({ length: offset }, () => null)

  for (const date of dates) {
    const slots = slotsByDate.value.get(date) ?? []
    cells.push({
      date,
      day: parseIsoDate(date).getDate(),
      slots: isOwner.value ? slots.length : slots.filter(slot => slot.bookable).length
    })
  }
  while (cells.length % 7) cells.push(null)

  const weeks: (CalendarCell | null)[][] = []
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7))
  return weeks
})

function isInWindow(date: string) {
  return date >= today && date <= windowEnd
}

function isDateSelectable(cell: CalendarCell) {
  return isOwner.value ? isInWindow(cell.date) : cell.slots > 0
}

function isDateSelected(date: string) {
  return isOwner.value ? guideDates.value.includes(date) : selectedDate.value === date
}

function onDateClick(date: string) {
  if (isOwner.value) toggleGuideDate(date)
  else selectDate(date)
}

// Бронирование (турист)

const selectedDate = ref('')
const selectedSlotId = ref('')
const bookingForm = ref<HTMLFormElement | null>(null)

const daySlots = computed(() => slotsByDate.value.get(selectedDate.value) ?? [])
const selectedSlot = computed(() => upcomingSlots.value.find(slot => slot.id === selectedSlotId.value && slot.bookable))

function selectDate(date: string) {
  selectedDate.value = date
  // Если в этот день доступен единственный слот — выбираем его сразу
  const bookable = daySlots.value.filter(slot => slot.bookable)
  selectedSlotId.value = bookable.length === 1 ? bookable[0]!.id : ''
  bookingResult.value = null
}

function selectSlot(slot: SlotViewResponse) {
  selectedDate.value = slot.localDate
  selectedSlotId.value = slot.id
  bookingResult.value = null
}

// Выбор из таблицы: показываем день в календаре и прокручиваем к форме
function pickSlot(slot: SlotViewResponse) {
  selectSlot(slot)
  visibleMonth.value = slot.localDate.slice(0, 7)
  bookingForm.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const booking = reactive({
  seats: 1 as number | '',
  phone: '',
  comment: ''
})

watch(() => user.value?.phone, (phone) => {
  if (phone && !booking.phone) booking.phone = phone
}, { immediate: true })

const bookingSubmitted = ref(false)
const bookingPending = ref(false)
const bookingError = ref('')
const bookingResult = ref<Awaited<ReturnType<typeof createBooking>> | null>(null)

const bookingErrors = computed(() => {
  const errors: { seats?: string, phone?: string } = {}

  if (typeof booking.seats !== 'number' || !Number.isInteger(booking.seats) || booking.seats < 1) {
    errors.seats = 'Укажите число мест'
  } else if (selectedSlot.value && booking.seats > selectedSlot.value.availableSeats) {
    errors.seats = `Свободно только ${selectedSlot.value.availableSeats} ${pluralize(selectedSlot.value.availableSeats, SEAT_FORMS)}`
  }

  if (!booking.phone.trim()) errors.phone = 'Введите телефон'
  else if (!PHONE_RE.test(booking.phone.trim())) errors.phone = 'Некорректный номер телефона'

  return errors
})

// Превышение свободных мест показываем сразу, остальное — после попытки отправки
const visibleBookingErrors = computed(() => bookingSubmitted.value
  ? bookingErrors.value
  : { seats: selectedSlot.value && typeof booking.seats === 'number' && booking.seats > 1 ? bookingErrors.value.seats : undefined })

const totalPrice = computed(() => tour.value?.price != null && typeof booking.seats === 'number' && booking.seats > 0
  ? tour.value.price * booking.seats
  : null)

const bookingSummary = computed(() => {
  const slot = selectedSlot.value
  if (!slot) return 'Выберите дату и время в календаре.'

  const seats = typeof booking.seats === 'number' && booking.seats > 0
    ? ` · ${booking.seats} ${pluralize(booking.seats, SEAT_FORMS)}`
    : ''
  const price = totalPrice.value != null ? ` · итого €${totalPrice.value}` : ''
  return `${formatDate(slot.localDate)}, ${formatTime(slot.localTime)}${seats}${price}`
})

const bookingButtonLabel = computed(() => {
  if (!isAuthenticated.value) return 'Войти и забронировать'
  return bookingPending.value ? 'Бронируем…' : 'Забронировать'
})

function goToSignin() {
  return navigateTo({ path: '/signin', query: { redirect: route.fullPath } })
}

async function submitBooking() {
  bookingError.value = ''
  if (!selectedSlot.value) return

  if (!isAuthenticated.value) {
    await goToSignin()
    return
  }

  bookingSubmitted.value = true
  if (Object.keys(bookingErrors.value).length) return

  bookingPending.value = true
  try {
    bookingResult.value = await createBooking({
      slotId: selectedSlot.value.id,
      seats: booking.seats as number,
      contactPhone: booking.phone.trim(),
      comment: booking.comment.trim() || null
    })
    selectedSlotId.value = ''
    booking.seats = 1
    booking.comment = ''
    bookingSubmitted.value = false
    await refreshSlots()
  } catch (error) {
    await handleBookingError(error)
  } finally {
    bookingPending.value = false
  }
}

async function handleBookingError(error: unknown) {
  if (!isHttpError(error)) {
    bookingError.value = 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
    return
  }

  const data = error.data as ErrorDto | undefined

  switch (error.statusCode) {
    // Токен просрочен — плагин уже сбросил сессию
    case 401:
      await goToSignin()
      break
    // Места успели занять или слот отменили — обновляем расписание
    case 404:
    case 409:
      bookingError.value = data?.message ?? 'Этот слот больше недоступен. Выберите другое время.'
      await refreshSlots()
      break
    case 400:
      bookingError.value = data?.message ?? 'Проверьте данные брони'
      break
    default:
      bookingError.value = 'Что-то пошло не так. Попробуйте позже.'
  }
}

// Управление расписанием (гид)

const guideDates = ref<string[]>([])
const guideTimes = ref<string[]>([])
const newTime = ref('')
const capacity = ref<number | ''>(tour.value?.maxPeople ?? 1)
const guidePending = ref(false)
const guideMessage = ref('')
const guideError = ref('')

function toggleGuideDate(date: string) {
  guideMessage.value = ''
  guideDates.value = guideDates.value.includes(date)
    ? guideDates.value.filter(item => item !== date)
    : [...guideDates.value, date].sort()
}

function selectMonthDays(kind: 'weekends' | 'weekdays') {
  guideMessage.value = ''
  const picked = monthDates().filter((date) => {
    const weekend = [0, 6].includes(parseIsoDate(date).getDay())
    return isInWindow(date) && (kind === 'weekends' ? weekend : !weekend)
  })
  guideDates.value = [...new Set([...guideDates.value, ...picked])].sort()
}

function addTime() {
  if (newTime.value && !guideTimes.value.includes(newTime.value)) {
    guideTimes.value = [...guideTimes.value, newTime.value].sort()
  }
  newTime.value = ''
  guideMessage.value = ''
}

function removeTime(time: string) {
  guideTimes.value = guideTimes.value.filter(item => item !== time)
}

const slotsToCreate = computed(() => guideDates.value.length * guideTimes.value.length)
const capacityValid = computed(() => typeof capacity.value === 'number' && Number.isInteger(capacity.value) && capacity.value >= 1)

const guideHint = computed(() => {
  if (!guideDates.value.length) return 'Выберите хотя бы одну дату в календаре.'
  if (!guideTimes.value.length) return 'Добавьте хотя бы одно время начала.'
  if (!capacityValid.value) return 'Укажите число мест — минимум одно.'
  if (slotsToCreate.value > MAX_BULK_SLOTS) return `За раз можно создать не больше ${MAX_BULK_SLOTS} слотов, сейчас — ${slotsToCreate.value}.`
  return `Будет создано слотов: ${slotsToCreate.value}. Уже существующие пропустим.`
})

const canCreateSlots = computed(() => slotsToCreate.value > 0 && slotsToCreate.value <= MAX_BULK_SLOTS && capacityValid.value)

async function submitSlots() {
  if (!canCreateSlots.value || !tour.value) return

  guidePending.value = true
  guideError.value = ''
  try {
    const result = await createSlotsBulk(tour.value.id, {
      dates: guideDates.value,
      times: guideTimes.value.map(time => `${time}:00`),
      capacity: capacity.value as number
    })
    guideMessage.value = result.skipped
      ? `Создано слотов: ${result.created}. Пропущено, потому что уже есть: ${result.skipped}.`
      : `Создано слотов: ${result.created}.`
    guideDates.value = []
    await refreshSlots()
  } catch (error) {
    guideError.value = await describeGuideError(error, 'Не удалось создать слоты.')
  } finally {
    guidePending.value = false
  }
}

const slotActionId = ref('')
const slotActionError = ref('')

// Свободный слот удаляем, а слот с бронями только отменяем — брони отменятся вместе с ним
async function onSlotAction(slot: SlotViewResponse) {
  const booked = bookedSeats(slot)
  if (booked && !confirm(`Отменить слот ${formatDate(slot.localDate)}, ${formatTime(slot.localTime)}? Брони на ${booked} ${pluralize(booked, SEAT_FORMS)} будут отменены.`)) return

  slotActionId.value = slot.id
  slotActionError.value = ''
  try {
    if (booked) await cancelSlot(slot.id)
    else await deleteSlot(slot.id)
    await refreshSlots()
  } catch (error) {
    slotActionError.value = isHttpError(error) && error.statusCode === 409
      ? 'На слот уже появились брони — его можно только отменить.'
      : await describeGuideError(error, 'Не удалось изменить слот.')
    await refreshSlots()
  } finally {
    slotActionId.value = ''
  }
}

async function describeGuideError(error: unknown, fallback: string) {
  if (!isHttpError(error)) return 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
  if (error.statusCode === 401) {
    await goToSignin()
    return ''
  }
  const data = error.data as ErrorDto | undefined
  return data?.message ?? fallback
}

const showPast = ref(false)

const { data: pastData, error: pastError, status: pastStatus, execute: loadPast } = await useAsyncData('timetable-past-slots',
  () => getSlots(tourId.value, { from: addDays(today, -SLOTS_WINDOW_DAYS), to: addDays(today, -1) }),
  { immediate: false })

const pastSlots = computed(() => [...(pastData.value ?? [])].sort((a, b) => b.startsAt.localeCompare(a.startsAt)))

function togglePast() {
  showPast.value = !showPast.value
  if (showPast.value && !pastData.value) loadPast()
}

// Форматирование

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })

function formatDate(date: string): string {
  const formatted = dateFormatter.format(parseIsoDate(date))
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

// HH:mm:ss → HH:mm
function formatTime(time: string) {
  return time.slice(0, 5)
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest} мин`
  return rest ? `${hours} ч ${rest} мин` : `${hours} ${pluralize(hours, ['час', 'часа', 'часов'])}`
}
</script>
