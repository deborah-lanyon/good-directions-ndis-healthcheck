<template>
  <div class="flex items-center">
    <button
      type="button"
      role="radio"
      :aria-checked="isChecked"
      :class="
        cn(
          'border-primary text-primary focus-visible:ring-ring aspect-square h-4 w-4 rounded-full border shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
          props.class
        )
      "
      @click="handleClick"
      v-bind="$attrs"
    >
      <div v-if="isChecked" class="flex items-center justify-center">
        <div class="bg-primary h-2.5 w-2.5 rounded-full" />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

interface RadioGroupItemProps extends /* @vue-ignore */ HTMLAttributes {
  value: string
  id?: string
  class?: string
}

const props = defineProps<RadioGroupItemProps>()

const radioGroup = inject<{
  modelValue?: import('vue').Ref<string | undefined>
  onValueChange: (value: string) => void
}>('radioGroup')

const isChecked = computed(() => radioGroup?.modelValue?.value === props.value)

const handleClick = () => {
  radioGroup?.onValueChange(props.value)
}
</script>
