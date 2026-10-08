<script setup lang="ts">
import type { TourCategory, TourSearchParams } from '~/types/api'

const PAGE_SIZE = 10
const FILTER_DEBOUNCE_MS = 400

type SortOption = '' | NonNullable<TourSearchParams['sort']>

const sortOptions: { id: SortOption, label: string }[] = [
  { id: '', label: 'Сначала новые' },
  { id: 'price', label: 'Сначала дешевле' },
  { id: 'rating', label: 'По рейтингу' },
]

const route = useRoute()
const router = useRouter()
const { searchTours } = useTours()
const apiUrl = useApiUrl()

function queryString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function queryNumber(value: unknown) {
  const number = Number(queryString(value))
  return queryString(value) !== '' && Number.isFinite(number) && number >= 0 ? number : null
}

// Фильтры живут в query: так работают ссылки с главной и кнопка «назад»
function readFilters() {
  const category = queryString(route.query.category)
  const sort = queryString(route.query.sort)
  return {
    q: queryString(route.query.q),
    city: queryString(route.query.city),
    category: (category in CATEGORY_LABELS ? category : '') as TourCategory | '',
    date: queryString(route.query.date),
    priceMin: queryNumber(route.query.priceMin),
    priceMax: queryNumber(route.query.priceMax),
    sort: (sortOptions.some(option => option.id === sort) ? sort : '') as SortOption,
  }
}

const filters = reactive(readFilters())
watch(() => route.query, () => Object.assign(filters, readFilters()))

// Номер страницы в URL — с 1, в API — с 0
const page = computed(() => Math.max(1, Math.floor(queryNumber(route.query.page) ?? 1)))

let filterTimer: ReturnType<typeof setTimeout> | undefined
watch(filters, () => {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(applyFilters, FILTER_DEBOUNCE_MS)
})
onBeforeUnmount(() => clearTimeout(filterTimer))

// Пустые фильтры в URL не пишем; при смене фильтров возвращаемся на первую страницу
function applyFilters() {
  const query: Record<string, string> = {}
  if (filters.q.trim()) query.q = filters.q.trim()
  if (filters.city.trim()) query.city = filters.city.trim()
  if (filters.category) query.category = filters.category
  if (filters.date) query.date = filters.date
  if (typeof filters.priceMin === 'number') query.priceMin = String(filters.priceMin)
  if (typeof filters.priceMax === 'number') query.priceMax = String(filters.priceMax)
  if (filters.sort) query.sort = filters.sort

  const currentKeys = Object.keys(route.query).filter(key => key !== 'page')
  const unchanged = currentKeys.length === Object.keys(query).length
    && currentKeys.every(key => route.query[key] === query[key])
  if (unchanged) return
  router.replace({ query })
}

function goToPage(value: number) {
  router.push({ query: { ...route.query, page: value > 1 ? String(value) : undefined } })
}

const searchParams = computed<TourSearchParams>(() => {
  const applied = readFilters()
  return {
    q: applied.q || undefined,
    city: applied.city || undefined,
    category: applied.category || undefined,
    date: applied.date || undefined,
    priceMin: applied.priceMin ?? undefined,
    priceMax: applied.priceMax ?? undefined,
    sort: applied.sort || undefined,
    page: page.value - 1,
    size: PAGE_SIZE,
  }
})

const { data, error, status, refresh } = await useAsyncData('catalog-tours',
  () => searchTours(searchParams.value), { watch: [searchParams] })

const tours = computed(() => data.value?.content ?? [])
const totalElements = computed(() => data.value?.totalElements ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 0)

const fieldClass = 'w-full p-2 border border-gray-text/50 bg-gray/10 text-sm outline-none focus:border-red duration-200'
</script>

<template>
  <div class="flex w-full gap-5 py-16">
    <div class="w-[calc(25%-20px)] flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="catalog-title" class="text-sm text-gray-text">Наименование</label>
        <input id="catalog-title" v-model="filters.q" type="search" placeholder="Например, прогулка"
          class="text-black placeholder:text-gray-text" :class="fieldClass">
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-city" class="text-sm text-gray-text">Город</label>
        <input id="catalog-city" v-model="filters.city" type="text" placeholder="Все города"
          class="text-black placeholder:text-gray-text" :class="fieldClass">
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-category" class="text-sm text-gray-text">Категория</label>
        <select id="catalog-category" v-model="filters.category" class="cursor-pointer"
          :class="[fieldClass, filters.category ? 'text-black' : 'text-gray-text']">
          <option value="">Все категории</option>
          <option v-for="(label, id) in CATEGORY_LABELS" :key="id" :value="id" class="text-black">
            {{ label }}
          </option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-date" class="text-sm text-gray-text">Дата</label>
        <input id="catalog-date" v-model="filters.date" type="date" class="cursor-pointer"
          :class="[fieldClass, filters.date ? 'text-black' : 'text-gray-text']">
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-price-from" class="text-sm text-gray-text">Цена, €</label>
        <div class="flex gap-2">
          <input id="catalog-price-from" v-model.number="filters.priceMin" type="number" min="0" placeholder="от"
            class="min-w-0 placeholder:text-gray-text" :class="fieldClass" aria-label="Цена от">
          <input id="catalog-price-to" v-model.number="filters.priceMax" type="number" min="0" placeholder="до"
            class="min-w-0 placeholder:text-gray-text" :class="fieldClass" aria-label="Цена до">
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="catalog-sort" class="text-sm text-gray-text">Сортировка</label>
        <select id="catalog-sort" v-model="filters.sort" class="cursor-pointer text-gray-text" :class="fieldClass">
          <option v-for="option in sortOptions" :key="option.id" :value="option.id">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="w-3/4 flex flex-col gap-3">
      <div class="flex items-end gap-1">
        <h2 class="text-3xl font-extrabold">Туры</h2>
        <p class="text-[16px] text-gray-text">({{ totalElements }})</p>
      </div>
      <p v-if="error" role="alert" class="text-lg text-gray-text">
        Не удалось загрузить туры.
        <button type="button" class="underline text-red-text cursor-pointer" @click="refresh()">Повторить</button>
      </p>
      <p v-else-if="!tours.length && status !== 'pending'" class="text-lg text-gray-text">
        По заданным фильтрам туров не нашлось — попробуйте их изменить.
      </p>
      <div v-else class="grid grid-cols-2 gap-5 duration-200" :class="{ 'opacity-50': status === 'pending' }">
        <TourBar v-for="tour in tours" :key="tour.id" :to="{ path: '/tour', query: { id: tour.id } }" :image="apiUrl(tour.coverUrl)" :city="tour.city"
          :title="tour.title" :price="tour.price" :rating="tour.rating" />
      </div>
      <nav v-if="totalPages > 1" class="flex justify-center gap-2" aria-label="Страницы каталога">
        <button v-for="n in totalPages" :key="n" type="button" :aria-current="n === page ? 'page' : undefined"
          class="size-10 text-xl font-bold cursor-pointer duration-200"
          :class="n === page ? 'bg-red text-white' : 'text-red border-2 border-red hover:bg-red hover:text-white'"
          @click="goToPage(n)">
          {{ n }}
        </button>
      </nav>
    </div>
  </div>
</template>
