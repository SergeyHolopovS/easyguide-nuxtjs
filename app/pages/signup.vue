<template>
  <div class="max-w-104 w-full mx-auto flex flex-col gap-6 pt-12">
    <div class="flex flex-col gap-2">
      <p class="text-red-text tracking-widest text-[16px] uppercase font-light">регистрация</p>
      <h2 class="text-4xl font-extrabold">Создать аккаунт</h2>
      <p class="text-gray-text text-lg">Находите туры и бронируйте у местных гидов по всему миру.</p>
    </div>
    <form class="flex flex-col gap-3" novalidate @submit.prevent="onSubmit">
      <BaseInput v-model="form.name" label="Имя" placeholder="Ваше имя" name="name" autocomplete="name"
        :error="visibleError('name')" @blur="touch('name')" />
      <BaseInput v-model="form.email" label="Email" placeholder="you@example.com" type="email" name="email"
        autocomplete="email" :error="visibleError('email')" @blur="touch('email')" />
      <BaseInput v-model="form.phone" label="Телефон (необязательно)" placeholder="+7 900 123-45-67" type="tel"
        name="phone" autocomplete="tel" :error="visibleError('phone')" @blur="touch('phone')" />
      <BaseInput v-model="form.password" label="Пароль" placeholder="********" type="password" name="password"
        autocomplete="new-password" :error="visibleError('password')" @blur="touch('password')" />
      <BaseInput v-model="form.passwordConfirm" label="Подтверждение пароля" placeholder="********" type="password"
        name="password-confirm" autocomplete="new-password" :error="visibleError('passwordConfirm')"
        @blur="touch('passwordConfirm')" />

      <p v-if="formError" role="alert" class="text-sm text-red-text border border-red px-3 py-2">{{ formError }}</p>

      <button type="submit" :disabled="pending"
        class="w-full py-1 border-2 border-red bg-red text-white font-extrabold cursor-pointer hover:bg-red/0 hover:text-red duration-200 disabled:opacity-60 disabled:cursor-wait disabled:hover:bg-red disabled:hover:text-white">
        {{ pending ? 'Создаём аккаунт…' : 'Зарегистрироваться' }}
      </button>
      <p class="text-sm text-gray-text">
        Уже есть аккаунт?
        <NuxtLink href="/signin" class="underline text-red-text hover:text-red duration-200">Войти</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script lang="ts" setup>
import type { ErrorDto } from '~/types/api'

useHead({ title: 'Регистрация — EasyGuide' })

type Field = 'name' | 'email' | 'phone' | 'password' | 'passwordConfirm'

const { register } = useAuth()

const form = reactive<Record<Field, string>>({
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: ''
})

const touched = reactive<Record<Field, boolean>>({
  name: false,
  email: false,
  phone: false,
  password: false,
  passwordConfirm: false
})

// Ошибки, пришедшие с сервера; сбрасываются при изменении поля
const serverErrors = reactive<Partial<Record<Field, string>>>({})
const formError = ref('')
const pending = ref(false)
const submitted = ref(false)

const clientErrors = computed<Partial<Record<Field, string>>>(() => {
  const errors: Partial<Record<Field, string>> = {}

  if (!form.name.trim()) errors.name = 'Введите имя'

  if (!form.email.trim()) errors.email = 'Введите email'
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Некорректный email'

  if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) errors.phone = 'Некорректный номер телефона'

  if (!form.password) errors.password = 'Введите пароль'
  else if (form.password.length < PASSWORD_MIN_LENGTH) errors.password = `Минимум ${PASSWORD_MIN_LENGTH} символов`

  if (!form.passwordConfirm) errors.passwordConfirm = 'Повторите пароль'
  else if (form.passwordConfirm !== form.password) errors.passwordConfirm = 'Пароли не совпадают'

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
    await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || null
    })
    await navigateTo('/profile')
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
    case 409:
      serverErrors.email = 'Этот email уже зарегистрирован'
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
