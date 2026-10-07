<script setup lang="ts">
import type { ErrorDto, TourCategory, TourRequest } from '~/types/api'

definePageMeta({ middleware: 'auth' })

const TITLE_MIN_LENGTH = 5
const TITLE_MAX_LENGTH = 150
const DESCRIPTION_MIN_LENGTH = 50
const DURATION_MIN_MINUTES = 30
const DURATION_MAX_MINUTES = 1440
const MAX_PEOPLE_LIMIT = 50
const MAX_PHOTOS = 10

type Field = 'title' | 'description' | 'city' | 'category' | 'meetingPoint' | 'timezone' | 'duration' | 'price' | 'maxPeople' | 'photos'

// Фото: url — с бэкенда (POST /api/files); photoId есть, если фото уже привязано к туру
interface PhotoItem {
  key: string
  url?: string
  photoId?: string
  preview: string
  uploading: boolean
}

const route = useRoute()
const router = useRouter()
const { user, fetchUser } = useAuth()
const { getTour, createTour, updateTour, publishTour, addTourPhoto, deleteTourPhoto } = useTours()
const { uploadImage } = useFiles()
const apiUrl = useApiUrl()

// id в query — редактируем сохранённый черновик
const tourId = ref(typeof route.query.id === 'string' ? route.query.id : '')

useHead({ title: () => tourId.value ? 'Редактирование тура — EasyGuide' : 'Новый тур — EasyGuide' })

await useAsyncData('create-tour-user', () => user.value ? Promise.resolve(user.value) : fetchUser())

const { data: loadedTour, error: loadError } = await useAsyncData('create-tour-tour',
  () => tourId.value ? getTour(tourId.value) : Promise.resolve(null))

const isGuide = computed(() => !!user.value?.isGuide)
const isPublished = computed(() => loadedTour.value?.status === 'PUBLISHED')

const statusLabel = computed(() => {
  if (!tourId.value) return 'Новый тур'
  if (loadedTour.value?.status === 'ARCHIVED') return 'В архиве'
  return isPublished.value ? 'Опубликован' : 'Черновик'
})

const timezones = Intl.supportedValuesOf('timeZone')

const form = reactive({
  title: '',
  description: '',
  city: '',
  category: '' as TourCategory | '',
  meetingPoint: '',
  timezone: '',
  duration: '' as number | '',
  price: '' as number | '',
  maxPeople: '' as number | '',
})

const photos = ref<PhotoItem[]>([])

if (loadedTour.value) {
  const tour = loadedTour.value
  Object.assign(form, {
    title: tour.title,
    description: tour.description,
    city: tour.city,
    category: tour.category,
    meetingPoint: tour.meetingPoint,
    timezone: tour.timezone,
    duration: tour.durationMinutes / 60,
    price: tour.price ?? '',
    maxPeople: tour.maxPeople,
  })
  photos.value = [...tour.photos]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(photo => ({ key: photo.id, url: photo.url, photoId: photo.id, preview: apiUrl(photo.url)!, uploading: false }))
}

// Часовой пояс по умолчанию — из браузера; на сервере он был бы поясом сервера
onMounted(() => {
  if (!form.timezone) form.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
})

// Проверка: для черновика — то, что требует API при сохранении, для публикации — ещё цена и фото

function durationMinutes() {
  return typeof form.duration === 'number' ? Math.round(form.duration * 60) : NaN
}

const draftErrors = computed<Partial<Record<Field, string>>>(() => {
  const errors: Partial<Record<Field, string>> = {}
  const title = form.title.trim()
  const minutes = durationMinutes()

  if (!title) errors.title = 'Укажите название'
  else if (title.length < TITLE_MIN_LENGTH) errors.title = `Минимум ${TITLE_MIN_LENGTH} символов`
  else if (title.length > TITLE_MAX_LENGTH) errors.title = `Максимум ${TITLE_MAX_LENGTH} символов`

  if (!form.description.trim()) errors.description = 'Добавьте описание'
  else if (form.description.trim().length < DESCRIPTION_MIN_LENGTH) errors.description = 'Описание слишком короткое'

  if (!form.city.trim()) errors.city = 'Укажите город'
  if (!form.category) errors.category = 'Выберите категорию'
  if (!form.meetingPoint.trim()) errors.meetingPoint = 'Укажите место встречи'
  if (!form.timezone) errors.timezone = 'Выберите часовой пояс'

  if (Number.isNaN(minutes)) errors.duration = 'Укажите длительность'
  else if (minutes < DURATION_MIN_MINUTES || minutes > DURATION_MAX_MINUTES) errors.duration = 'От 0,5 до 24 часов'

  if (typeof form.price === 'number' && form.price < 0) errors.price = 'Цена не может быть отрицательной'

  if (typeof form.maxPeople !== 'number') errors.maxPeople = 'Укажите число участников'
  else if (!Number.isInteger(form.maxPeople) || form.maxPeople < 1 || form.maxPeople > MAX_PEOPLE_LIMIT) {
    errors.maxPeople = `От 1 до ${MAX_PEOPLE_LIMIT}`
  }

  return errors
})

const publishErrors = computed<Partial<Record<Field, string>>>(() => {
  const errors = { ...draftErrors.value }
  if (typeof form.price !== 'number' && !errors.price) errors.price = 'Укажите цену для публикации'
  if (!photos.value.some(photo => photo.url)) errors.photos = 'Добавьте хотя бы одну фотографию'
  return errors
})

// Ошибки показываем после первой попытки сохранить — по правилам той кнопки, что нажали
const attempt = ref<'draft' | 'publish' | null>(null)
const serverErrors = reactive<Partial<Record<Field, string>>>({})
const formError = ref('')
const formStatus = ref('')
const pending = ref<'draft' | 'publish' | null>(null)

function visibleError(field: Field) {
  if (serverErrors[field]) return serverErrors[field]
  if (attempt.value === 'publish') return publishErrors.value[field]
  if (attempt.value === 'draft') return draftErrors.value[field]
  return undefined
}

for (const field of Object.keys(form) as Field[]) {
  watch(() => form[field as keyof typeof form], () => {
    delete serverErrors[field]
    formError.value = ''
    formStatus.value = ''
  })
}

const descriptionLength = computed(() => form.description.trim().length)
const photosUploading = computed(() => photos.value.some(photo => photo.uploading))

function toRequest(): TourRequest {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    city: form.city.trim(),
    category: form.category as TourCategory,
    meetingPoint: form.meetingPoint.trim(),
    timezone: form.timezone,
    durationMinutes: durationMinutes(),
    price: typeof form.price === 'number' ? form.price : null,
    maxPeople: form.maxPeople as number,
  }
}

// Создаём или обновляем тур и привязываем загруженные, но ещё не привязанные фото
async function saveTour() {
  const payload = toRequest()
  const saved = tourId.value ? await updateTour(tourId.value, payload) : await createTour(payload)

  if (!tourId.value) {
    tourId.value = saved.id
    // Повторные сохранения пойдут через PUT, а страницу можно перезагрузить
    await router.replace({ query: { ...route.query, id: saved.id } })
  }

  for (const photo of photos.value) {
    if (!photo.url || photo.photoId) continue
    const tour = await addTourPhoto(saved.id, photo.url)
    // Новое фото — последнее по sortOrder
    const added = [...tour.photos].sort((a, b) => b.sortOrder - a.sortOrder)[0]
    if (added) photo.photoId = added.id
  }

  return saved
}

async function onSaveDraft() {
  attempt.value = 'draft'
  if (Object.keys(draftErrors.value).length || pending.value || photosUploading.value) return

  pending.value = 'draft'
  formError.value = ''
  formStatus.value = ''
  try {
    await saveTour()
    formStatus.value = isPublished.value ? 'Изменения сохранены' : 'Черновик сохранён — его видите только вы'
  } catch (error) {
    handleError(error)
  } finally {
    pending.value = null
  }
}

async function onPublish() {
  attempt.value = 'publish'
  if (Object.keys(publishErrors.value).length || pending.value || photosUploading.value) return

  pending.value = 'publish'
  formError.value = ''
  formStatus.value = ''
  try {
    const saved = await saveTour()
    if (saved.status !== 'PUBLISHED') await publishTour(saved.id)
    // Следующий шаг — расписание: без слотов тур нельзя забронировать
    await navigateTo({ path: '/timetable', query: { id: saved.id } })
  } catch (error) {
    handleError(error)
  } finally {
    pending.value = null
  }
}

function handleError(error: unknown) {
  if (!isHttpError(error)) {
    formError.value = 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
    return
  }

  const data = error.data as ErrorDto | undefined
  // Имена полей API → поля формы
  const fieldMap: Record<string, Field> = { durationMinutes: 'duration', photos: 'photos' }

  switch (error.statusCode) {
    case 401:
      navigateTo({ path: '/signin', query: { redirect: route.fullPath } })
      break
    case 403:
      formError.value = 'Создавать туры могут только гиды. Включите роль гида в профиле.'
      break
    case 400:
      for (const field of data?.fields ?? []) {
        const mapped = fieldMap[field] ?? field
        if (mapped in form || mapped === 'photos') serverErrors[mapped as Field] = 'Проверьте значение поля'
      }
      formError.value = data?.message ?? 'Проверьте правильность заполнения формы'
      break
    default:
      formError.value = data?.message ?? 'Что-то пошло не так. Попробуйте позже.'
  }
}

// Фото: загружаем файл сразу, к туру привязываем при сохранении

const fileInput = ref<HTMLInputElement>()
const dragOver = ref(false)
const photoError = ref('')

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  // Сбрасываем, чтобы повторный выбор того же файла снова вызвал change
  input.value = ''
  addFiles(files)
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  addFiles([...(event.dataTransfer?.files ?? [])])
}

function addFiles(files: File[]) {
  photoError.value = ''
  delete serverErrors.photos

  const free = MAX_PHOTOS - photos.value.length
  if (files.length > free) photoError.value = `Можно добавить не больше ${MAX_PHOTOS} фотографий`

  for (const file of files.slice(0, Math.max(free, 0))) {
    if (!IMAGE_TYPES.includes(file.type)) {
      photoError.value = 'Поддерживаются только JPEG, PNG и WebP'
      continue
    }
    if (file.size > IMAGE_MAX_SIZE) {
      photoError.value = `Файл «${file.name}» больше 5 МБ`
      continue
    }
    uploadPhoto(file)
  }
}

async function uploadPhoto(file: File) {
  const photo = reactive<PhotoItem>({ key: crypto.randomUUID(), preview: URL.createObjectURL(file), uploading: true })
  photos.value.push(photo)

  try {
    photo.url = await uploadImage(file)
  } catch (error) {
    removeLocal(photo)
    if (isHttpError(error) && error.statusCode === 401) {
      navigateTo({ path: '/signin', query: { redirect: route.fullPath } })
      return
    }
    const data = isHttpError(error) ? error.data as ErrorDto | undefined : undefined
    photoError.value = data?.message ?? 'Не удалось загрузить фото. Попробуйте ещё раз.'
  } finally {
    photo.uploading = false
  }
}

function removeLocal(photo: PhotoItem) {
  if (photo.preview.startsWith('blob:')) URL.revokeObjectURL(photo.preview)
  photos.value = photos.value.filter(item => item.key !== photo.key)
}

const removingKey = ref('')

// Привязанное фото удаляем и на бэкенде, остальные — только из формы
async function removePhoto(photo: PhotoItem) {
  photoError.value = ''
  if (!photo.photoId || !tourId.value) {
    removeLocal(photo)
    return
  }

  removingKey.value = photo.key
  try {
    await deleteTourPhoto(tourId.value, photo.photoId)
    removeLocal(photo)
  } catch (error) {
    const data = isHttpError(error) ? error.data as ErrorDto | undefined : undefined
    photoError.value = data?.message ?? 'Не удалось удалить фото. Попробуйте ещё раз.'
  } finally {
    removingKey.value = ''
  }
}

onBeforeUnmount(() => {
  for (const photo of photos.value) {
    if (photo.preview.startsWith('blob:')) URL.revokeObjectURL(photo.preview)
  }
})

const fieldClass = 'text-[16px] px-3 py-2 border bg-gray/10 placeholder:text-gray-text outline-none focus:border-red duration-200'

function fieldClasses(field: Field) {
  return [fieldClass, visibleError(field) ? 'border-red' : 'border-gray-text/75']
}
</script>

<template>
  <div class="flex justify-center w-full">
    <div v-if="!isGuide" class="w-200 flex flex-col gap-4 py-20">
      <h1 class="text-5xl font-extrabold">Создать тур</h1>
      <p class="text-lg text-gray-text">Создавать туры могут только гиды. Включите роль гида в профиле — это займёт минуту.</p>
      <NuxtLink to="/profile" class="text-lg text-red-text underline w-fit">Перейти в профиль</NuxtLink>
    </div>
    <div v-else-if="tourId && !loadedTour && loadError" class="w-200 flex flex-col gap-4 py-20">
      <h1 class="text-5xl font-extrabold">Тур не найден</h1>
      <p class="text-lg text-gray-text">Возможно, он удалён или принадлежит другому гиду.</p>
      <NuxtLink to="/create-tour" class="text-lg text-red-text underline w-fit">Создать новый тур</NuxtLink>
    </div>
    <form v-else class="w-200 flex flex-col gap-10 pt-20" novalidate @submit.prevent="onPublish">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-2">
          <p class="uppercase text-red-text text-[16px] tracking-widest">{{ statusLabel }}</p>
          <h1 class="text-5xl font-extrabold">{{ tourId ? 'Редактировать тур' : 'Создать тур' }}</h1>
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <div class="flex flex-col gap-5">
          <h2 class="text-xl font-extrabold">Основное</h2>
          <div class="flex flex-col gap-2">
            <label for="tour-title" class="text-sm text-gray-text">Название *</label>
            <input id="tour-title" v-model="form.title" type="text" :maxlength="TITLE_MAX_LENGTH" :class="fieldClasses('title')"
              :aria-invalid="!!visibleError('title')" placeholder="Например, прогулка по крышам старого города" />
            <p v-if="visibleError('title')" class="text-red-text text-sm">{{ visibleError('title') }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <label for="tour-description" class="text-sm text-gray-text">Описание *</label>
            <textarea id="tour-description" v-model="form.description" rows="5" class="resize-y" :class="fieldClasses('description')"
              :aria-invalid="!!visibleError('description')"
              placeholder="Расскажите, что увидят участники и чем тур отличается от других"></textarea>
            <p class="text-gray-text text-sm">
              {{ descriptionLength }} / минимум {{ DESCRIPTION_MIN_LENGTH }} символов
              <span v-if="visibleError('description')" class="text-red-text">{{ visibleError('description') }}</span>
            </p>
          </div>
          <div class="flex gap-4">
            <div class="flex flex-col gap-2 w-1/2">
              <label for="tour-city" class="text-sm text-gray-text">Город *</label>
              <input id="tour-city" v-model="form.city" type="text" :class="fieldClasses('city')"
                :aria-invalid="!!visibleError('city')" placeholder="Лиссабон" />
              <p v-if="visibleError('city')" class="text-red-text text-sm">{{ visibleError('city') }}</p>
            </div>
            <div class="flex flex-col gap-2 w-1/2">
              <label for="tour-category" class="text-sm text-gray-text">Категория *</label>
              <select id="tour-category" v-model="form.category" class="cursor-pointer" :aria-invalid="!!visibleError('category')"
                :class="[fieldClasses('category'), form.category ? 'text-black' : 'text-gray-text']">
                <option value="">Выберите категорию</option>
                <option v-for="(label, id) in CATEGORY_LABELS" :key="id" :value="id" class="text-black">
                  {{ label }}
                </option>
              </select>
              <p v-if="visibleError('category')" class="text-red-text text-sm">{{ visibleError('category') }}</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex flex-col gap-2 w-1/2">
              <label for="tour-meeting-point" class="text-sm text-gray-text">Место встречи *</label>
              <input id="tour-meeting-point" v-model="form.meetingPoint" type="text" :class="fieldClasses('meetingPoint')"
                :aria-invalid="!!visibleError('meetingPoint')" placeholder="Адрес или ориентир" />
              <p v-if="visibleError('meetingPoint')" class="text-red-text text-sm">{{ visibleError('meetingPoint') }}</p>
            </div>
            <div class="flex flex-col gap-2 w-1/2">
              <label for="tour-timezone" class="text-sm text-gray-text">Часовой пояс *</label>
              <select id="tour-timezone" v-model="form.timezone" class="cursor-pointer" :aria-invalid="!!visibleError('timezone')"
                :class="[fieldClasses('timezone'), form.timezone ? 'text-black' : 'text-gray-text']">
                <option value="">Выберите часовой пояс</option>
                <!-- Список поясов в Node и в браузере может отличаться — рисуем только на клиенте -->
                <ClientOnly>
                  <option v-for="zone in timezones" :key="zone" :value="zone" class="text-black">{{ zone }}</option>
                </ClientOnly>
              </select>
              <p v-if="visibleError('timezone')" class="text-red-text text-sm">{{ visibleError('timezone') }}</p>
              <p v-else class="text-gray-text text-sm">По нему считается время слотов в расписании</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="flex flex-col gap-2 w-1/3">
              <label for="tour-duration" class="text-sm text-gray-text">Длительность, часов *</label>
              <input id="tour-duration" v-model.number="form.duration" type="number" min="0.5" max="24" step="0.5"
                :class="fieldClasses('duration')" :aria-invalid="!!visibleError('duration')" placeholder="4" />
              <p v-if="visibleError('duration')" class="text-red-text text-sm">{{ visibleError('duration') }}</p>
            </div>
            <div class="flex flex-col gap-2 w-1/3">
              <label for="tour-price" class="text-sm text-gray-text">Цена за человека, € *</label>
              <input id="tour-price" v-model.number="form.price" type="number" min="0" :class="fieldClasses('price')"
                :aria-invalid="!!visibleError('price')" placeholder="30" />
              <p v-if="visibleError('price')" class="text-red-text text-sm">{{ visibleError('price') }}</p>
            </div>
            <div class="flex flex-col gap-2 w-1/3">
              <label for="tour-capacity" class="text-sm text-gray-text">Макс. участников *</label>
              <input id="tour-capacity" v-model.number="form.maxPeople" type="number" min="1" :max="MAX_PEOPLE_LIMIT"
                :class="fieldClasses('maxPeople')" :aria-invalid="!!visibleError('maxPeople')" placeholder="8" />
              <p v-if="visibleError('maxPeople')" class="text-red-text text-sm">{{ visibleError('maxPeople') }}</p>
            </div>
          </div>
        </div>
        <div class="w-full h-0.5 bg-gray"></div>
        <div class="flex flex-col gap-3">
          <div class="flex items-end justify-between w-full">
            <h2 class="text-2xl font-bold">Фотографии *</h2>
            <p class="text-sm text-gray-text">
              {{ photos.length ? `${photos.length} из ${MAX_PHOTOS}` : 'Пока нет фотографий' }}
            </p>
          </div>
          <p class="text-[16px] text-gray-text">JPG, PNG или WebP, до 5 МБ каждая. Первая фотография станет обложкой.
          </p>
          <div class="grid grid-cols-5 gap-3">
            <div v-for="(photo, index) in photos" :key="photo.key" class="relative aspect-4/3 bg-smooth-bg overflow-hidden group">
              <img :src="photo.preview" alt="" class="size-full object-cover">
              <span v-if="index === 0" class="absolute left-0 top-0 px-2 py-0.5 text-sm bg-red text-white">Обложка</span>
              <span v-if="photo.uploading"
                class="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">Загрузка…</span>
              <button v-else type="button" :disabled="removingKey === photo.key" aria-label="Удалить фото"
                class="absolute right-1 top-1 size-7 flex items-center justify-center bg-bg text-red-text opacity-0 group-hover:opacity-100 focus:opacity-100 duration-200 cursor-pointer disabled:opacity-50"
                @click="removePhoto(photo)">
                <Icon name="akar-icons:cross" size="0.8rem" />
              </button>
            </div>
            <button v-if="photos.length < MAX_PHOTOS" type="button"
              class="relative aspect-4/3 flex flex-col justify-end text-start gap-2 p-3 cursor-pointer group"
              :class="{ 'bg-red/5': dragOver }" @click="fileInput?.click()"
              @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop">
              <svg class="absolute inset-0 size-full pointer-events-none group-hover:text-black duration-200"
                :class="visibleError('photos') ? 'text-red' : 'text-gray'">
                <rect width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-dasharray="8 6" />
              </svg>
              <svg class="size-[1.1rem] text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="3" stroke-linecap="round">
                <path d="M12 4v16M4 12h16" />
              </svg>
              <p class="text-[16px]">Добавить фото</p>
            </button>
          </div>
          <input ref="fileInput" type="file" multiple :accept="IMAGE_TYPES.join(',')" class="hidden" @change="onFileSelect">
          <p v-if="photoError" role="alert" class="text-red-text text-sm">{{ photoError }}</p>
          <p v-else-if="visibleError('photos')" class="text-red-text text-sm">{{ visibleError('photos') }}</p>
        </div>
      </div>
      <div
        class="sticky bottom-0 z-10 py-4 before:absolute before:inset-y-0 before:left-1/2 before:w-screen before:-translate-x-1/2 before:-z-1 before:border-t-2 before:border-gray before:bg-bg">
        <div class="flex gap-4 h-12 items-center">
          <button type="button" :disabled="!!pending || photosUploading"
            class="h-full px-3 py-1 text-lg font-extrabold border border-gray-text enabled:hover:border-black enabled:hover:bg-smooth-bg duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            @click="onSaveDraft">
            {{ pending === 'draft' ? 'Сохраняем…' : isPublished ? 'Сохранить изменения' : 'Сохранить черновик' }}
          </button>
          <button type="submit" :disabled="!!pending || photosUploading"
            class="h-full px-3 py-1 text-lg font-extrabold border border-red text-white cursor-pointer bg-red enabled:hover:bg-transparent enabled:hover:text-red duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
            {{ pending === 'publish' ? 'Публикуем…' : isPublished ? 'Сохранить и к расписанию' : 'Опубликовать' }}
          </button>
          <p v-if="formError" role="alert" class="text-sm text-red-text">{{ formError }}</p>
          <p v-else-if="formStatus" role="status" class="text-sm text-gray-text">{{ formStatus }}</p>
          <p v-else-if="photosUploading" class="text-sm text-gray-text">Дождитесь загрузки фото</p>
        </div>
      </div>
    </form>
  </div>
</template>
