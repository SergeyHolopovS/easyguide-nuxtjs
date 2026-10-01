<template>
  <div class="flex justify-center w-full">
    <div class="flex flex-col gap-8 py-20 w-full">
      <div class="flex w-full justify-between items-end">
        <div class="flex flex-col gap-2">
          <p class="uppercase text-red-text text-[16px] tracking-widest">Личный кабинет гида</p>
          <p class="text-4xl font-extrabold">Мои туры</p>
        </div>
        <button class="px-3 py-1 bg-red hover:bg-red/0 border border-red text-white text-lg hover:text-red duration-200 font-extrabold cursor-pointer">Создать тур</button>
      </div>
      <div class="flex gap-2 items-stretch p-1 bg-smooth-bg w-fit">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="cursor-pointer px-2 py-1 text-[16px]"
          :class="filter.value === activeFilter
            ? 'bg-red text-white'
            : 'bg-bg text-black hover:bg-red hover:text-white duration-200'"
          @click="activeFilter = filter.value">
          {{ filter.label }} ({{ countByFilter(filter.value) }})
        </button>
      </div>
      <div class="flex flex-col gap-5">
        <div
          v-for="tour in filteredTours"
          :key="tour.id"
          class="w-full border-2 border-gray p-5 flex gap-5"
          :class="{ 'opacity-70 select-none': tour.status === 'archived' }">
          <div class="w-50 bg-gray h-full max-h-50"></div>
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <p class="px-3 py-1 text-sm w-fit" :class="statusBadges[tour.status].class">
                {{ statusBadges[tour.status].label }}
              </p>
              <h5 class="text-2xl font-extrabold">{{ tour.title }}</h5>
              <p class="text-lg text-gray-text">€{{ tour.price }} за человека · {{ tour.slots }} слотов</p>
            </div>
            <div class="flex gap-3">
              <button
                v-for="action in [...commonActions, ...statusActions[tour.status]]"
                :key="action.label"
                class="cursor-pointer px-3 py-1 duration-200 text-lg font-extrabold"
                :class="actionClasses[action.variant]">
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
type TourStatus = 'draft' | 'published' | 'archived'
type TourFilter = 'all' | TourStatus
type ActionVariant = 'outline' | 'primary' | 'link'

interface Tour {
  id: number
  title: string
  price: number
  slots: number
  status: TourStatus
}

interface TourAction {
  label: string
  variant: ActionVariant
}

const tours: Tour[] = [
  { id: 1, title: 'Вечер фаду в Моурарии', price: 40, slots: 0, status: 'draft' },
  { id: 2, title: 'Вечер фаду в Моурарии', price: 40, slots: 0, status: 'draft' },
  { id: 3, title: 'Прогулка по крышам старого города', price: 45, slots: 12, status: 'published' },
  { id: 4, title: 'Прогулка по крышам старого города', price: 45, slots: 12, status: 'published' },
  { id: 5, title: 'Зимние огни Байши', price: 30, slots: 0, status: 'archived' },
  { id: 6, title: 'Зимние огни Байши', price: 30, slots: 0, status: 'archived' },
]

const filters: { label: string; value: TourFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Черновики', value: 'draft' },
  { label: 'Опубликованные', value: 'published' },
  { label: 'Архив', value: 'archived' },
]

const statusBadges: Record<TourStatus, { label: string; class: string }> = {
  draft: { label: 'Черновик', class: 'border border-red text-red' },
  published: { label: 'Опубликован', class: 'bg-red/10 text-red-text' },
  archived: { label: 'В архиве', class: 'bg-gray/10 text-gray-text' },
}

const commonActions: TourAction[] = [
  { label: 'Редактировать', variant: 'outline' },
  { label: 'Расписание', variant: 'outline' },
]

const statusActions: Record<TourStatus, TourAction[]> = {
  draft: [{ label: 'Опубликовать', variant: 'primary' }],
  published: [
    { label: 'В архив', variant: 'link' },
    { label: 'Открыть в каталоге', variant: 'link' },
  ],
  archived: [{ label: 'Опубликовать снова', variant: 'primary' }],
}

const actionClasses: Record<ActionVariant, string> = {
  outline: 'border border-gray hover:border-red hover:text-red',
  primary: 'border border-red bg-red text-white hover:text-red hover:bg-red/0',
  link: 'text-red hover:bg-red/10',
}

const activeFilter = ref<TourFilter>('all')

const filteredTours = computed<Tour[]>(() =>
  activeFilter.value === 'all'
    ? tours
    : tours.filter(tour => tour.status === activeFilter.value)
)

function countByFilter(filter: TourFilter): number {
  return filter === 'all' ? tours.length : tours.filter(tour => tour.status === filter).length
}
</script>
