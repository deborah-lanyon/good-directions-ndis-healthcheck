<template>
  <input
    :class="
      cn(
        'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )
    "
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

interface InputProps extends /* @vue-ignore */ HTMLAttributes {
  modelValue?: string | number
  class?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
