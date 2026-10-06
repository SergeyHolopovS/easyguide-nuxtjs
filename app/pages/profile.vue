<template>
  <div class="flex justify-center w-full">
    <div class="w-200 flex flex-col gap-20 py-20">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-2">
          <p class="uppercase text-red-text text-[16px] tracking-widest">Личный кабинет</p>
          <p class="text-4xl font-extrabold">Профиль</p>
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

      <div v-if="user && !user.isGuide" class="relative flex flex-col gap-8 py-20 w-full text-white">
        <div class="w-screen h-full absolute left-1/2 top-0 -translate-x-1/2 bg-red -z-1"></div>
        <h3 class="text-5xl font-extrabold">Станьте гидом</h3>
        <p class=" text-lg">Публикуйте свои туры в каталоге, сами задавайте цену и расписание, принимайте заявки от
          путешественников.
          Появится публичный профиль гида с вашими турами и отзывами.</p>
        <button
          class="w-fit px-3 py-1 text-lg font-bold border border-white text-white hover:bg-white hover:text-red duration-200 cursor-pointer">Включить
          роль гида</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ErrorDto, UpdateProfileRequest } from '~/types/api'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Профиль — EasyGuide' })

type Field = 'name' | 'phone'

const { user, fetchUser, updateProfile } = useAuth()
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
</script>
