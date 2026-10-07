<template>
  <div class="flex justify-center w-full">
    <div class="flex flex-col gap-8 py-20 w-full">
      <div class="flex w-full justify-between items-end">
        <div class="flex flex-col gap-2">
          <p class="uppercase text-red-text text-[16px] tracking-widest">Личный кабинет гида</p>
          <p class="text-4xl font-extrabold">Мои туры</p>
        </div>
        <NuxtLink v-if="isGuide" to="/create-tour"
          class="px-3 py-1 bg-red hover:bg-red/0 border border-red text-white text-lg hover:text-red duration-200 font-extrabold cursor-pointer">Создать
          тур</NuxtLink>
      </div>

      <template v-if="!isGuide">
        <p class="text-lg text-gray-text">Туры могут создавать только гиды. Включите роль гида в профиле — это займёт минуту.</p>
        <NuxtLink to="/profile" class="text-lg text-red-text underline w-fit">Перейти в профиль</NuxtLink>
      </template>
      <template v-else>
        <div class="flex gap-2 items-stretch p-1 bg-smooth-bg w-fit" role="tablist">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            role="tab"
            :aria-selected="filter.value === activeFilter"
            class="cursor-pointer px-2 py-1 text-[16px]"
            :class="filter.value === activeFilter
              ? 'bg-red text-white'
              : 'bg-bg text-black hover:bg-red hover:text-white duration-200'"
            @click="activeFilter = filter.value">
            {{ filter.label }} ({{ countByFilter(filter.value) }})
          </button>
        </div>

        <p v-if="error" role="alert" class="text-lg text-gray-text">
          Не удалось загрузить туры.
          <button type="button" class="underline text-red-text cursor-pointer" @click="refresh()">Повторить</button>
        </p>
        <p v-else-if="!tours.length" class="text-lg text-gray-text">
          У вас пока нет туров.
          <NuxtLink to="/create-tour" class="underline text-red-text">Создайте первый</NuxtLink>
        </p>
        <p v-else-if="!filteredTours.length" class="text-lg text-gray-text">В этом разделе туров нет.</p>

        <div class="flex flex-col gap-5">
          <div
            v-for="tour in filteredTours"
            :key="tour.id"
            class="w-full border-2 border-gray p-5 flex gap-5"
            :class="{ 'opacity-70': tour.status === 'ARCHIVED' }">
            <img v-if="coverUrl(tour)" :src="coverUrl(tour)" alt="" class="w-50 h-37.5 shrink-0 object-cover">
            <div v-else class="w-50 h-37.5 shrink-0 bg-gray"></div>
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-2">
                <p class="px-3 py-1 text-sm w-fit" :class="statusBadges[tour.status].class">
                  {{ statusBadges[tour.status].label }}
                </p>
                <h5 class="text-2xl font-extrabold">{{ tour.title }}</h5>
                <p class="text-lg text-gray-text">
                  <template v-if="tour.price != null">€{{ tour.price }} за человека</template>
                  <template v-else>Цена не указана</template>
                  <template v-if="slotCounts?.[tour.id] != null">
                    · {{ slotCounts[tour.id] }} {{ pluralize(slotCounts[tour.id]!, SLOT_FORMS) }} впереди
                  </template>
                </p>
              </div>
              <div class="flex gap-3 flex-wrap">
                <NuxtLink :to="{ path: '/create-tour', query: { id: tour.id } }"
                  class="cursor-pointer px-3 py-1 duration-200 text-lg font-extrabold" :class="actionClasses.outline">Редактировать</NuxtLink>
                <NuxtLink :to="{ path: '/timetable', query: { id: tour.id } }"
                  class="cursor-pointer px-3 py-1 duration-200 text-lg font-extrabold" :class="actionClasses.outline">Расписание</NuxtLink>
                <button v-if="tour.status !== 'PUBLISHED'" type="button" :disabled="pendingId === tour.id"
                  class="cursor-pointer px-3 py-1 duration-200 text-lg font-extrabold disabled:opacity-60 disabled:cursor-wait"
                  :class="actionClasses.primary" @click="onPublish(tour)">
                  {{ pendingId === tour.id ? 'Публикуем…' : tour.status === 'ARCHIVED' ? 'Опубликовать снова' : 'Опубликовать' }}
                </button>
                <template v-else>
                  <button type="button" :disabled="pendingId === tour.id"
                    class="cursor-pointer px-3 py-1 duration-200 text-lg font-extrabold disabled:opacity-60 disabled:cursor-wait"
                    :class="actionClasses.link" @click="onArchive(tour)">
                    {{ pendingId === tour.id ? 'Переносим…' : 'В архив' }}
                  </button>
                  <NuxtLink :to="{ path: '/catalog', query: { q: tour.title, city: tour.city } }"
                    class="cursor-pointer px-3 py-1 duration-200 text-lg font-extrabold" :class="actionClasses.link">Открыть в каталоге</NuxtLink>
                </template>
              </div>
              <p v-if="actionErrors[tour.id]" role="alert" class="text-sm text-red-text">{{ actionErrors[tour.id] }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ErrorDto, TourResponse, TourStatus } from '~/types/api'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Мои туры — EasyGuide' })

type TourFilter = 'all' | TourStatus
type ActionVariant = 'outline' | 'primary' | 'link'

// Слоты считаем на тот же срок, что отдаёт API за один запрос
const SLOTS_WINDOW_DAYS = 92
const SLOT_FORMS: [string, string, string] = ['слот', 'слота', 'слотов']

const filters: { label: string; value: TourFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Черновики', value: 'DRAFT' },
  { label: 'Опубликованные', value: 'PUBLISHED' },
  { label: 'Архив', value: 'ARCHIVED' },
]

const statusBadges: Record<TourStatus, { label: string; class: string }> = {
  DRAFT: { label: 'Черновик', class: 'border border-red text-red' },
  PUBLISHED: { label: 'Опубликован', class: 'bg-red/10 text-red-text' },
  ARCHIVED: { label: 'В архиве', class: 'bg-gray/10 text-gray-text' },
}

const actionClasses: Record<ActionVariant, string> = {
  outline: 'border border-gray hover:border-red hover:text-red',
  primary: 'border border-red bg-red text-white enabled:hover:text-red enabled:hover:bg-red/0',
  link: 'text-red hover:bg-red/10',
}

const { user, fetchUser } = useAuth()
const { getMyTours, getSlots, publishTour, archiveTour } = useTours()
const apiUrl = useApiUrl()

await useAsyncData('my-tours-user', () => user.value ? Promise.resolve(user.value) : fetchUser())

const isGuide = computed(() => !!user.value?.isGuide)

const { data, error, refresh } = await useAsyncData('my-tours',
  () => isGuide.value ? getMyTours() : Promise.resolve([]))

const tours = computed(() => data.value ?? [])

// В списке туров нет числа слотов — берём ближайшие слоты каждого тура отдельно.
// Ошибку по одному туру не показываем, просто не выводим число
const { data: slotCounts } = await useAsyncData('my-tours-slots', async () => {
  const from = new Date()
  const to = new Date(from)
  to.setDate(to.getDate() + SLOTS_WINDOW_DAYS - 1)
  const range = { from: toIsoDate(from), to: toIsoDate(to) }

  const entries = await Promise.all(tours.value.map(async (tour) => {
    try {
      const slots = await getSlots(tour.id, range)
      return [tour.id, slots.filter(slot => new Date(slot.startsAt).getTime() > Date.now()).length] as const
    } catch {
      return [tour.id, null] as const
    }
  }))
  return Object.fromEntries(entries) as Record<string, number | null>
}, { watch: [tours] })

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function coverUrl(tour: TourResponse) {
  const cover = [...tour.photos].sort((a, b) => a.sortOrder - b.sortOrder)[0]
  return apiUrl(cover?.url)
}

const activeFilter = ref<TourFilter>('all')

const filteredTours = computed(() =>
  activeFilter.value === 'all'
    ? tours.value
    : tours.value.filter(tour => tour.status === activeFilter.value)
)

function countByFilter(filter: TourFilter): number {
  return filter === 'all' ? tours.value.length : tours.value.filter(tour => tour.status === filter).length
}

// Действия со статусом тура

const pendingId = ref('')
const actionErrors = reactive<Record<string, string>>({})

function replaceTour(updated: TourResponse) {
  data.value = tours.value.map(tour => tour.id === updated.id ? updated : tour)
}

// Для публикации нужны описание от 50 символов, цена и фото — иначе бэкенд объяснит, чего не хватает
async function onPublish(tour: TourResponse) {
  await runAction(tour, () => publishTour(tour.id), 'Не удалось опубликовать тур.')
}

async function onArchive(tour: TourResponse) {
  if (!confirm(`Убрать «${tour.title}» из каталога? Вернуть его можно в любой момент.`)) return
  await runAction(tour, () => archiveTour(tour.id), 'Не удалось перенести тур в архив.')
}

async function runAction(tour: TourResponse, action: () => Promise<TourResponse>, fallback: string) {
  pendingId.value = tour.id
  delete actionErrors[tour.id]
  try {
    replaceTour(await action())
  } catch (error) {
    if (isHttpError(error) && error.statusCode === 401) {
      await navigateTo({ path: '/signin', query: { redirect: '/my-tours' } })
      return
    }
    const message = isHttpError(error) ? (error.data as ErrorDto | undefined)?.message : undefined
    actionErrors[tour.id] = message ?? fallback
  } finally {
    pendingId.value = ''
  }
}
</script>
