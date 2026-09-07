<template>
  <div class="flex flex-col gap-1">
    <p class="text-gray-text text-sm">{{ label }}</p>
    <input :type="type" :placeholder="placeholder" :value="modelValue"
      class="text-[16px] px-3 py-1.5 border border-gray bg-smooth-bg"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)">
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  label: string
  placeholder?: string
  type?: string
  modelValue?: string
}>(), {
  type: 'text'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
