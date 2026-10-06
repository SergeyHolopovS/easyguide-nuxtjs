<template>
  <div class="max-w-104 w-full mx-auto flex flex-col gap-6 pt-12">
    <div class="flex flex-col gap-2">
      <p class="text-red-text tracking-widest text-[16px] uppercase font-light">вход</p>
      <h2 class="text-4xl font-extrabold">Войти в аккаунт</h2>
      <p class="text-gray-text text-lg">Находите туры и бронируйте у местных гидов по всему миру.</p>
    </div>
    <form class="flex flex-col gap-3" novalidate @submit.prevent="onSubmit">
      <BaseInput v-model="form.email" label="Email" placeholder="you@example.com" type="email" name="email"
        autocomplete="email" :error="visibleError('email')" @blur="touch('email')" />
      <BaseInput v-model="form.password" label="Пароль" placeholder="********" type="password" name="password"
        autocomplete="current-password" :error="visibleError('password')" @blur="touch('password')" />

      <p v-if="formError" role="alert" class="text-sm text-red-text border border-red px-3 py-2">{{ formError }}</p>

      <button type="submit" :disabled="pending"
        class="w-full py-1 border-2 border-red bg-red text-white font-extrabold cursor-pointer hover:bg-red/0 hover:text-red duration-200 disabled:opacity-60 disabled:cursor-wait disabled:hover:bg-red disabled:hover:text-white">
        {{ pending ? 'Входим…' : 'Войти' }}
      </button>
      <p class="text-sm text-gray-text">
        Нет аккаунта?
        <NuxtLink href="/signup" class="underline text-red-text hover:text-red duration-200">Зарегистрироваться</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script lang="ts" setup>
import type { ErrorDto } from '~/types/api'

useHead({ title: 'Вход — EasyGuide' })

type Field = 'email' | 'password'

const route = useRoute()
const { login } = useAuth()

const form = reactive<Record<Field, string>>({
  email: '',
  password: ''
})

const touched = reactive<Record<Field, boolean>>({
  email: false,
  password: false
})

// Ошибки, пришедшие с сервера; сбрасываются при изменении поля
const serverErrors = reactive<Partial<Record<Field, string>>>({})
const formError = ref('')
const pending = ref(false)
const submitted = ref(false)

// Длину пароля не проверяем: при входе важно только, что он введён
const clientErrors = computed<Partial<Record<Field, string>>>(() => {
  const errors: Partial<Record<Field, string>> = {}

  if (!form.email.trim()) errors.email = 'Введите email'
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Некорректный email'

  if (!form.password) errors.password = 'Введите пароль'

  return errors
})

const isValid = computed(() => Object.keys(clientErrors.value).length === 0)

function touch(field: Field) {
  touched[field] = true
}

// Клиентскую ошибку показываем после ухода с поля или попытки отправки
function visibleError(field: Field) {
  if (serverErrors[field]) return serverErrors[field]
  return touched[field] || submitted.value ? clientErrors.value[field] : undefined
}

for (const field of Object.keys(form) as Field[]) {
  watch(() => form[field], () => {
    delete serverErrors[field]
    formError.value = ''
  })
}

async function onSubmit() {
  submitted.value = true
  if (!isValid.value || pending.value) return

  pending.value = true
  formError.value = ''

  try {
    await login({
      email: form.email.trim(),
      password: form.password
    })
    await navigateTo(redirectTarget())
  } catch (error) {
    handleError(error)
  } finally {
    pending.value = false
  }
}

// Принимаем только внутренние пути, чтобы ?redirect= не уводил на чужой сайт
function redirectTarget() {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/profile'
}

function handleError(error: unknown) {
  if (!isHttpError(error)) {
    formError.value = 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
    return
  }

  const data = error.data as ErrorDto | undefined

  switch (error.statusCode) {
    // Не уточняем, что именно неверно, — так нельзя проверить, зарегистрирован ли email
    case 401:
      formError.value = 'Неверный email или пароль'
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
</script>
