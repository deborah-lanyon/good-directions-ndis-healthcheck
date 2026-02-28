<template>
  <div :class="cn('grid gap-2', props.class)" role="radiogroup" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { type HTMLAttributes, provide, toRef } from 'vue'
import { cn } from '~/lib/utils'

interface RadioGroupProps extends /* @vue-ignore */ HTMLAttributes {
  modelValue?: string
  class?: string
}

const props = defineProps<RadioGroupProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

provide('radioGroup', {
  modelValue: toRef(props, 'modelValue'),
  onValueChange: (value: string) => {
    emit('update:modelValue', value)
  },
})
</script>
