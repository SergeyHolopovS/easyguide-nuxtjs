<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-gray-text text-sm">{{ label }}</label>
    <input :id="id" v-bind="$attrs" :type="type" :placeholder="placeholder" :value="modelValue"
      :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : undefined"
      class="text-[16px] px-3 py-1.5 border bg-smooth-bg outline-none focus:border-black duration-200 read-only:text-gray-text read-only:focus:border-gray"
      :class="error ? 'border-red' : 'border-gray'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')">
    <p v-if="error" :id="`${id}-error`" class="text-red-text text-sm">{{ error }}</p>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  label: string
  placeholder?: string
  type?: string
  modelValue?: string
  error?: string
}>(), {
  type: 'text'
})

defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
}>()

const id = useId()
</script>
