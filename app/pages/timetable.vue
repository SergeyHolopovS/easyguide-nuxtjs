<template>
  <div class="w-full flex flex-col gap-10 py-20">
    <div class="flex flex-col gap-2">
      <p class="uppercase text-red-text text-[16px] tracking-widest">Расписание тура</p>
      <h1 class="text-4xl font-extrabold">Прогулка по крышам старого города</h1>
      <p class="text-sm text-gray-text">Всё время — по часовому поясу тура: Лиссабон (WEST, UTC+1)</p>
    </div>
    <div class="w-full flex border-y-2 border-gray">
      <div class="flex flex-col gap-3 border-r-2 w-1/2 py-10 pr-5 border-gray">
        <div class="w-full flex justify-between items-end">
          <h2 class="text-lg font-extrabold">1. Даты</h2>
          <p class="text-sm text-gray-text">Можно выбрать несколько</p>
        </div>
        <div class="flex justify-between w-full items-center">
          <button aria-label="Предыдущий месяц"
            class="size-10 flex items-center justify-center text-lg text-red-text hover:bg-red/10 duration-200 cursor-pointer">←</button>
          <p class="text-lg font-extrabold">Октябрь 2026</p>
          <button aria-label="Следующий месяц"
            class="size-10 flex items-center justify-center text-lg text-red-text hover:bg-red/10 duration-200 cursor-pointer">→</button>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <p v-for="day in days" :key="day" class="text-sm text-gray-text">{{ day }}</p>
          <template v-for="(week, weekIndex) in calendar" :key="weekIndex">
            <template v-for="(cell, index) in week" :key="`${weekIndex}-${index}`">
              <button v-if="cell"
                class="group w-full aspect-square border-2 border-gray duration-200 text-start p-2 flex gap-1 items-start cursor-pointer hover:bg-red hover:border-red hover:text-white">
                <span>{{ cell.day }}</span>
                <span v-if="cell.slots" class="text-red-text group-hover:text-white duration-200">·{{ cell.slots }}</span>
              </button>
              <div v-else></div>
            </template>
          </template>
        </div>
        <div class="flex gap-3 items-center text-sm">
          <button
            class="px-2 py-0.5 border border-red text-red-text hover:bg-red hover:text-white duration-200 cursor-pointer">Все
            выходные месяца</button>
          <button
            class="px-2 py-0.5 border border-red text-red-text hover:bg-red hover:text-white duration-200 cursor-pointer">Все
            будни месяца</button>
        </div>
      </div>
      <div class="flex flex-col gap-6 w-1/2 py-10 pl-5">
        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-extrabold">2. Время начала</h2>
          <div class="flex gap-3 flex-wrap">
            <button aria-label="Удалить время 10:00" class="bg-red/10 px-3 py-1 flex gap-2 items-center cursor-pointer">
              <span class="text-[16px] text-red-text">10:00</span>
              <span class="flex text-red-text">
                <Icon name="akar-icons:cross" size="0.8rem" />
              </span>
            </button>
          </div>
          <div class="flex flex-col gap-2">
            <label for="slot-time" class="text-sm text-gray-text">Добавить время</label>
            <div class="flex gap-3">
              <input id="slot-time" type="time"
                class="flex-1 h-11 px-3 text-[16px] bg-gray/10 border border-gray-text outline-none focus:border-red duration-200">
              <button disabled
                class="shrink-0 h-11 px-4 border border-gray-text text-gray-text disabled:opacity-50 text-lg font-extrabold">Добавить</button>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <label for="slot-capacity" class="text-lg font-extrabold">3. Мест в каждом слоте</label>
          <input id="slot-capacity" type="number" min="1" value="8"
            class="w-32 px-3 text-[16px] h-11 border border-gray-text bg-gray/10 outline-none focus:border-red duration-200">
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <p class="text-[16px]">Выберите хотя бы одну дату в календаре.</p>
        <button disabled
          class="px-3 py-1 font-extrabold text-lg w-fit text-white border border-red bg-red enabled:hover:text-red enabled:hover:bg-transparent duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Создать
          слоты</button>
      </div>
    </div>
    <div class="flex flex-col gap-5">
      <div class="flex items-end gap-1">
        <h2 class="font-extrabold text-3xl">Предстоящие слоты</h2>
        <p class="text-[16px] text-gray-text">({{ slots.length }})</p>
      </div>
      <div role="table" aria-label="Предстоящие слоты" class="flex flex-col gap-2">
        <div role="row" class="grid grid-cols-8 px-2 gap-4">
          <span role="columnheader" class="text-sm text-gray-text font-bold uppercase col-span-2">Дата</span>
          <span role="columnheader" class="text-sm text-gray-text font-bold uppercase col-span-1">Время</span>
          <span role="columnheader" class="text-sm text-gray-text font-bold uppercase col-span-1">Занято</span>
          <span role="columnheader" class="text-sm text-gray-text font-bold uppercase col-span-4">Статус</span>
        </div>
        <div class="flex flex-col border-t-2 border-gray">
          <div v-for="slot in slots" :key="slot.id" role="row"
            class="grid grid-cols-8 border-b border-gray py-4 px-2 gap-4">
            <p role="cell" class="text-[16px] col-span-2">{{ formatDate(slot.date) }}</p>
            <p role="cell" class="text-[16px] col-span-1">{{ slot.time }}</p>
            <div role="cell" class="text-[16px] col-span-1 flex w-full justify-between items-center">
              <p>{{ slot.booked }}/{{ slot.capacity }}</p>
              <div class="w-3/5 h-2 bg-gray/15">
                <div class="h-full" :class="getStatus(slot) === 'full' ? 'bg-red' : 'bg-black'"
                  :style="{ width: `${(slot.booked / slot.capacity) * 100}%` }"></div>
              </div>
            </div>
            <div role="cell" class="flex justify-between items-center col-span-4">
              <p class="px-3 py-0.5 text-sm" :class="statusBadges[getStatus(slot)].class">
                {{ statusBadges[getStatus(slot)].label }}
              </p>
              <button
                class="text-sm px-2 py-1 font-extrabold text-red-text border-red/0 hover:border-red border-2 duration-200 cursor-pointer">
                {{ statusBadges[getStatus(slot)].action }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-4 flex-col">
        <button
          class="px-2 py-1 text-lg font-bold text-red-text hover:bg-red/5 duration-200 cursor-pointer w-fit">Скрыть
          прошедшие ({{ pastSlots.length }})</button>
        <div role="table" aria-label="Прошедшие слоты" class="flex flex-col">
          <div v-for="slot in pastSlots" :key="slot.id" role="row"
            class="grid grid-cols-8 gap-4 text-gray-text text-[16px] px-2 py-3 border-b border-gray">
            <p role="cell" class="col-span-2">{{ formatDate(slot.date) }}</p>
            <p role="cell" class="col-span-1">{{ slot.time }}</p>
            <p role="cell" class="col-span-1">{{ slot.booked }}/{{ slot.capacity }}</p>
            <p role="cell" class="col-span-4 text-sm">Прошёл</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface CalendarCell {
  day: number
  slots: number
}

const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const calendar: (CalendarCell | null)[][] = [
  [null, null, null, { day: 1, slots: 0 }, { day: 2, slots: 0 }, { day: 3, slots: 2 }, { day: 4, slots: 1 }],
  [{ day: 5, slots: 0 }, { day: 6, slots: 0 }, { day: 7, slots: 0 }, { day: 8, slots: 0 }, { day: 9, slots: 0 }, { day: 10, slots: 1 }, { day: 11, slots: 0 }],
  [{ day: 12, slots: 0 }, { day: 13, slots: 0 }, { day: 14, slots: 0 }, { day: 15, slots: 0 }, { day: 16, slots: 0 }, { day: 17, slots: 0 }, { day: 18, slots: 0 }],
  [{ day: 19, slots: 0 }, { day: 20, slots: 0 }, { day: 21, slots: 0 }, { day: 22, slots: 0 }, { day: 23, slots: 0 }, { day: 24, slots: 0 }, { day: 25, slots: 0 }],
  [{ day: 26, slots: 0 }, { day: 27, slots: 0 }, { day: 28, slots: 0 }, { day: 29, slots: 0 }, { day: 30, slots: 0 }, { day: 31, slots: 0 }, null],
]

type SlotStatus = 'free' | 'booked' | 'full'

interface Slot {
  id: number
  date: string
  time: string
  booked: number
  capacity: number
}

const slots: Slot[] = [
  { id: 1, date: '2026-10-03', time: '10:00', booked: 3, capacity: 8 },
  { id: 2, date: '2026-10-03', time: '17:00', booked: 0, capacity: 8 },
  { id: 3, date: '2026-10-04', time: '10:00', booked: 8, capacity: 8 },
  { id: 4, date: '2026-10-10', time: '10:00', booked: 1, capacity: 8 },
]

const pastSlots: Slot[] = [
  { id: 5, date: '2026-09-27', time: '17:00', booked: 0, capacity: 8 },
  { id: 6, date: '2026-09-27', time: '10:00', booked: 8, capacity: 8 },
  { id: 7, date: '2026-09-26', time: '10:00', booked: 5, capacity: 8 },
]

const statusBadges: Record<SlotStatus, { label: string; class: string; action: string }> = {
  free: { label: 'Свободен', class: 'border border-red text-red-text', action: 'Удалить' },
  booked: { label: 'Есть брони', class: 'border border-red text-red-text', action: 'Отменить слот' },
  full: { label: 'Мест нет', class: 'bg-red/5 text-red-text', action: 'Отменить слот' },
}

function getStatus(slot: Slot): SlotStatus {
  if (slot.booked === 0) return 'free'
  if (slot.booked >= slot.capacity) return 'full'
  return 'booked'
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })

function formatDate(date: string): string {
  const formatted = dateFormatter.format(new Date(`${date}T00:00`))
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
</script>
