<template>
  <div class="flex justify-center w-full">
    <div class="w-200 flex flex-col gap-20 py-20">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-2">
          <p class="uppercase text-red-text text-[16px] tracking-widest">Личный кабинет</p>
          <p class="text-4xl font-extrabold">Профиль</p>
          <NuxtLink v-if="user?.isGuide && !guideEnabled" :to="{ path: '/guide', query: { id: user.id } }"
            class="text-[16px] text-red-text hover:underline w-fit">Мой публичный профиль гида →</NuxtLink>
        </div>

        <p v-if="!user" role="alert" class="text-sm text-red-text border border-red px-3 py-2">
          Не удалось загрузить профиль.
          <button type="button" class="underline cursor-pointer" @click="refresh()">Повторить</button>
        </p>

        <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
          <div class="gap-5 flex items-center">
            <button type="button" :disabled="avatarPending" aria-label="Загрузить аватар"
              class="size-40 shrink-0 bg-gray relative overflow-hidden cursor-pointer outline-offset-2 disabled:cursor-wait"
              :class="{ 'outline-2 outline-dashed outline-red': dragOver }" @click="fileInput?.click()"
              @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop">
              <img v-if="user.avatarUrl" :src="apiUrl(user.avatarUrl)" alt="" class="size-full object-cover">
              <span v-if="avatarPending"
                class="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">Загрузка…</span>
            </button>
            <input ref="fileInput" type="file" :accept="IMAGE_TYPES.join(',')" class="hidden" @change="onFileSelect">
            <div class="flex flex-col gap-1">
              <p class="text-sm text-gray-text">
                Аватар: перетащите изображение на квадрат слева или нажмите на него. JPEG, PNG или WebP до 5 МБ.
              </p>
              <p v-if="avatarError" role="alert" class="text-sm text-red-text">{{ avatarError }}</p>
            </div>
          </div>

          <BaseInput v-model="form.name" label="Имя" placeholder="Анна Соколова" name="name" autocomplete="name"
            :error="visibleError('name')" @blur="touch('name')" />
          <BaseInput v-model="form.phone" label="Телефон" placeholder="+7 900 111-22-33" type="tel" name="phone"
            autocomplete="tel" :error="visibleError('phone')" @blur="touch('phone')" />
          <div class="flex flex-col gap-px">
            <BaseInput :model-value="user.email" label="Email" type="email" readonly />
            <p class="text-gray-text text-[12px]">Email и пароль меняются в настройках безопасности.</p>
          </div>

          <p v-if="formError" role="alert" class="text-sm text-red-text border border-red px-3 py-2">{{ formError }}</p>
          <p v-if="saved" role="status" class="text-sm text-gray-text">Изменения сохранены</p>

          <button type="submit" :disabled="pending || !isDirty"
            class="text-[16px] font-extrabold text-white bg-red px-6 py-2 w-fit hover:text-red hover:bg-red/0 duration-200 cursor-pointer border border-red disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-red disabled:hover:text-white">
            {{ pending ? 'Сохраняем…' : 'Сохранить изменения' }}
          </button>
        </form>
      </div>

      <div v-if="user && (!user.isGuide || guideEnabled)" class="relative flex flex-col gap-8 py-20 w-full text-white">
        <div class="w-screen h-full absolute left-1/2 top-0 -translate-x-1/2 bg-red -z-1"></div>
        <template v-if="guideEnabled">
          <h3 class="text-5xl font-extrabold">Вы — гид</h3>
          <p role="status" class="text-lg">Роль гида включена. Создайте первый тур — после публикации он появится в каталоге.</p>
          <NuxtLink to="/create-tour"
            class="w-fit px-3 py-1 text-lg font-bold border border-white bg-white text-red hover:bg-transparent hover:text-white duration-200">Создать
            тур</NuxtLink>
          <NuxtLink :to="{ path: '/guide', query: { id: user.id } }" class="text-lg underline w-fit">Посмотреть публичный профиль</NuxtLink>
        </template>
        <template v-else>
          <h3 class="text-5xl font-extrabold">Станьте гидом</h3>
          <p class=" text-lg">Публикуйте свои туры в каталоге, сами задавайте цену и расписание, принимайте заявки от
            путешественников.
            Появится публичный профиль гида с вашими турами и отзывами.</p>
          <!-- Бэкенд включает роль, только если в профиле заполнены город, «о себе» и языки -->
          <form class="flex flex-col gap-4" novalidate @submit.prevent="onBecomeGuide">
            <div class="flex flex-col gap-1">
              <label for="guide-city" class="text-sm">Город, где проводите туры</label>
              <input id="guide-city" v-model="guideForm.city" type="text" placeholder="Казань" autocomplete="address-level2"
                :aria-invalid="!!visibleGuideErrors.city" :aria-describedby="visibleGuideErrors.city ? 'guide-city-error' : undefined"
                class="text-[16px] px-3 py-1.5 bg-transparent placeholder:text-white/60 outline-none duration-200 focus:bg-white/10"
                :class="visibleGuideErrors.city ? 'border-2 border-white' : 'border border-white/60'">
              <p v-if="visibleGuideErrors.city" id="guide-city-error" class="text-sm font-bold">{{ visibleGuideErrors.city }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <label for="guide-bio" class="text-sm">О себе — это увидят путешественники</label>
              <textarea id="guide-bio" v-model="guideForm.bio" rows="4" placeholder="Коренной казанец, 10 лет вожу экскурсии по старому городу…"
                :aria-invalid="!!visibleGuideErrors.bio" :aria-describedby="visibleGuideErrors.bio ? 'guide-bio-error' : undefined"
                class="text-[16px] px-3 py-1.5 bg-transparent placeholder:text-white/60 outline-none duration-200 focus:bg-white/10 resize-none"
                :class="visibleGuideErrors.bio ? 'border-2 border-white' : 'border border-white/60'"></textarea>
              <p v-if="visibleGuideErrors.bio" id="guide-bio-error" class="text-sm font-bold">{{ visibleGuideErrors.bio }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <p id="guide-languages" class="text-sm">Языки, на которых проводите туры</p>
              <div class="flex gap-2 flex-wrap" role="group" aria-labelledby="guide-languages">
                <button v-for="language in languageOptions" :key="language.code" type="button"
                  :aria-pressed="guideForm.languages.includes(language.code)"
                  class="px-3 py-1 border border-white text-[16px] duration-200 cursor-pointer"
                  :class="guideForm.languages.includes(language.code) ? 'bg-white text-red' : 'hover:bg-white/10'"
                  @click="toggleLanguage(language.code)">{{ language.label }}</button>
              </div>
              <p v-if="visibleGuideErrors.languages" class="text-sm font-bold">{{ visibleGuideErrors.languages }}</p>
            </div>
            <p v-if="guideError" role="alert" class="text-sm font-bold border border-white px-3 py-2">{{ guideError }}</p>
            <button type="submit" :disabled="guidePending"
              class="w-fit px-3 py-1 text-lg font-bold border border-white text-white enabled:hover:bg-white enabled:hover:text-red duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-wait">
              {{ guidePending ? 'Включаем…' : 'Включить роль гида' }}
            </button>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ErrorDto, UpdateProfileRequest } from '~/types/api'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Профиль — EasyGuide' })

type Field = 'name' | 'phone'

const { user, fetchUser, updateProfile, becomeGuide } = useAuth()
const { uploadImage } = useFiles()
const apiUrl = useApiUrl()

const { error: loadError, refresh } = await useAsyncData('profile-user', fetchUser)

// Токен просрочен — плагин уже сбросил сессию, отправляем на вход
if (isHttpError(loadError.value) && loadError.value.statusCode === 401) {
  await navigateTo({ path: '/signin', query: { redirect: '/profile' } })
}

const form = reactive<Record<Field, string>>({
  name: '',
  phone: ''
})

const touched = reactive<Record<Field, boolean>>({
  name: false,
  phone: false
})

const serverErrors = reactive<Partial<Record<Field, string>>>({})
const formError = ref('')
const pending = ref(false)
const submitted = ref(false)
const saved = ref(false)

// Заполняем форму данными с сервера. Следим только за этими полями,
// чтобы смена аватара не затирала несохранённые правки
watch(() => [user.value?.name, user.value?.phone] as const, ([name, phone]) => {
  form.name = name ?? ''
  form.phone = phone ?? ''
}, { immediate: true })

const clientErrors = computed<Partial<Record<Field, string>>>(() => {
  const errors: Partial<Record<Field, string>> = {}

  if (!form.name.trim()) errors.name = 'Введите имя'

  if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) errors.phone = 'Некорректный номер телефона'

  return errors
})

const isValid = computed(() => Object.keys(clientErrors.value).length === 0)

// PATCH меняет только переданные поля, поэтому отправляем лишь изменённые
const changes = computed<UpdateProfileRequest>(() => {
  const patch: UpdateProfileRequest = {}
  if (!user.value) return patch

  const name = form.name.trim()
  // Пустая строка очищает телефон, а null оставил бы его без изменений
  const phone = form.phone.trim()

  if (name !== user.value.name) patch.name = name
  if (phone !== (user.value.phone ?? '')) patch.phone = phone

  return patch
})

const isDirty = computed(() => Object.keys(changes.value).length > 0)

function touch(field: Field) {
  touched[field] = true
}

function visibleError(field: Field) {
  if (serverErrors[field]) return serverErrors[field]
  return touched[field] || submitted.value ? clientErrors.value[field] : undefined
}

for (const field of Object.keys(form) as Field[]) {
  watch(() => form[field], () => {
    delete serverErrors[field]
    formError.value = ''
    saved.value = false
  })
}

async function onSubmit() {
  submitted.value = true
  if (!isValid.value || !isDirty.value || pending.value) return

  pending.value = true
  formError.value = ''

  try {
    await updateProfile(changes.value)
    submitted.value = false
    touched.name = false
    touched.phone = false
    // Ставим после того, как watch перезаполнит форму и сбросит флаг
    await nextTick()
    saved.value = true
  } catch (error) {
    handleError(error)
  } finally {
    pending.value = false
  }
}

function handleError(error: unknown) {
  if (!isHttpError(error)) {
    formError.value = 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
    return
  }

  const data = error.data as ErrorDto | undefined

  switch (error.statusCode) {
    case 401:
      navigateTo({ path: '/signin', query: { redirect: '/profile' } })
      break
    case 400:
      for (const field of data?.fields ?? []) {
        if (field in form) serverErrors[field as Field] = 'Проверьте значение поля'
      }
      formError.value = data?.message ?? 'Проверьте правильность заполнения формы'
      break
    default:
      formError.value = 'Что-то пошло не так. Попробуйте позже.'
  }
}

// --- Аватар: загружаем файл и сразу сохраняем его URL в профиль ---

const fileInput = ref<HTMLInputElement>()
const dragOver = ref(false)
const avatarPending = ref(false)
const avatarError = ref('')

function onDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) uploadAvatar(file)
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Сбрасываем, чтобы повторный выбор того же файла снова вызвал change
  input.value = ''
  if (file) uploadAvatar(file)
}

async function uploadAvatar(file: File) {
  if (avatarPending.value) return
  avatarError.value = ''

  if (!IMAGE_TYPES.includes(file.type)) {
    avatarError.value = 'Поддерживаются только JPEG, PNG и WebP'
    return
  }
  if (file.size > IMAGE_MAX_SIZE) {
    avatarError.value = 'Файл больше 5 МБ'
    return
  }

  avatarPending.value = true
  try {
    const avatarUrl = await uploadImage(file)
    await updateProfile({ avatarUrl })
  } catch (error) {
    if (isHttpError(error) && error.statusCode === 401) {
      navigateTo({ path: '/signin', query: { redirect: '/profile' } })
      return
    }
    const data = isHttpError(error) ? error.data as ErrorDto | undefined : undefined
    avatarError.value = data?.message ?? 'Не удалось загрузить аватар. Попробуйте ещё раз.'
  } finally {
    avatarPending.value = false
  }
}

// --- Роль гида: сначала дозаполняем профиль, затем включаем роль ---

type GuideField = 'city' | 'bio' | 'languages'

const guideForm = reactive({
  city: '',
  bio: '',
  languages: [] as string[]
})

// Подставляем то, что уже есть в профиле, один раз — чтобы не затирать ввод
watch(() => user.value?.id, () => {
  if (!user.value) return
  guideForm.city = user.value.city ?? ''
  guideForm.bio = user.value.bio ?? ''
  guideForm.languages = [...user.value.languages]
}, { immediate: true })

// Коды, которых нет в списке (заданы раньше), тоже показываем, чтобы их можно было снять
const languageOptions = computed(() => [
  ...GUIDE_LANGUAGES,
  ...guideForm.languages
    .filter(code => !GUIDE_LANGUAGES.some(language => language.code === code))
    .map(code => ({ code, label: code }))
])

function toggleLanguage(code: string) {
  guideForm.languages = guideForm.languages.includes(code)
    ? guideForm.languages.filter(item => item !== code)
    : [...guideForm.languages, code]
}

const guideSubmitted = ref(false)
const guidePending = ref(false)
const guideError = ref('')
const guideEnabled = ref(false)
const guideServerErrors = reactive<Partial<Record<GuideField, string>>>({})

const guideErrors = computed<Partial<Record<GuideField, string>>>(() => {
  const errors: Partial<Record<GuideField, string>> = {}
  if (!guideForm.city.trim()) errors.city = 'Укажите город'
  if (!guideForm.bio.trim()) errors.bio = 'Расскажите о себе'
  if (!guideForm.languages.length) errors.languages = 'Выберите хотя бы один язык'
  return errors
})

const visibleGuideErrors = computed(() => ({
  ...(guideSubmitted.value ? guideErrors.value : {}),
  ...guideServerErrors
}))

for (const field of Object.keys(guideForm) as GuideField[]) {
  watch(() => guideForm[field], () => {
    delete guideServerErrors[field]
    guideError.value = ''
  })
}

async function onBecomeGuide() {
  guideSubmitted.value = true
  if (Object.keys(guideErrors.value).length || guidePending.value || !user.value) return

  guidePending.value = true
  guideError.value = ''

  // PATCH меняет только переданные поля, поэтому отправляем лишь изменённые
  const patch: UpdateProfileRequest = {}
  const city = guideForm.city.trim()
  const bio = guideForm.bio.trim()
  if (city !== (user.value.city ?? '')) patch.city = city
  if (bio !== (user.value.bio ?? '')) patch.bio = bio
  if (guideForm.languages.join() !== user.value.languages.join()) patch.languages = guideForm.languages

  try {
    if (Object.keys(patch).length) await updateProfile(patch)
    await becomeGuide()
    guideEnabled.value = true
  } catch (error) {
    handleGuideError(error)
  } finally {
    guidePending.value = false
  }
}

function handleGuideError(error: unknown) {
  if (!isHttpError(error)) {
    guideError.value = 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
    return
  }

  const data = error.data as ErrorDto | undefined

  switch (error.statusCode) {
    case 401:
      navigateTo({ path: '/signin', query: { redirect: '/profile' } })
      break
    case 400:
      for (const field of data?.fields ?? []) {
        if (field in guideForm) guideServerErrors[field as GuideField] = 'Проверьте значение поля'
      }
      guideError.value = data?.message ?? 'Проверьте правильность заполнения'
      break
    default:
      guideError.value = 'Что-то пошло не так. Попробуйте позже.'
  }
}
</script>
