<script lang="ts" setup>
interface Option {
  id: any;
  label: string;
}

interface Props {
  placeholder: string;
  handler: (id: any) => void
  options: Option[]
}

const { placeholder, handler, options } = defineProps<Props>()
const open = ref<boolean>(false)
const selected = ref<Option | undefined>(undefined)

function handleClick(id: any) {
  selected.value = options.find(el => el.id === id)
  handler(id)
}
</script>

<template>
  <div class="relative w-full">
    <button @click="open = !open" class="w-full p-3 flex justify-between items-center border border-black/75">
      <p class="text-black text-[16px]">{{ selected != null ? selected.label : placeholder }}</p>
      <div class="size-4">
        <Icon name="akar-icons:chevron-down" size="1rem" class="duration-200"
          :class="open ? 'rotate-180' : 'rotate-0'" />
      </div>
    </button>
    <div
      class="w-full absolute top-[calc(100%+10px)] left-0 overflow-y-hidden box-border border border-black/75 p-2 z-1 bg-bg"
      v-if="open">
      <div class="w-full flex flex-col gap-1 overflow-y-auto max-h-80">
        <button @click="handleClick(option.id)" v-for="option in options" :key="option.id"
          class="w-full text-left p-1 hover:bg-smooth-bg duration-200 cursor-pointer text-[16px]">
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>