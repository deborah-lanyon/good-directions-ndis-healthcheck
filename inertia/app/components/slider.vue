<template>
  <div class="relative flex w-full touch-none items-center select-none">
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue[0]"
      @input="handleInput"
      :style="sliderStyle"
      :class="
        cn(
          'h-2 w-full cursor-pointer appearance-none rounded-full',
          '[&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md',
          '[&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md',
          props.class
        )
      "
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/lib/utils'

interface SliderProps extends /* @vue-ignore */ HTMLAttributes {
  modelValue?: number[]
  min?: number
  max?: number
  step?: number
  class?: string
}

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: () => [0],
  min: 0,
  max: 100,
  step: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const sliderStyle = computed(() => {
  const percentage = ((props.modelValue[0] - props.min) / (props.max - props.min)) * 100
  return {
    background: `linear-gradient(to right, hsl(217, 91%, 60%) 0%, hsl(217, 91%, 60%) ${percentage}%, hsl(var(--secondary)) ${percentage}%, hsl(var(--secondary)) 100%)`,
  }
})

const handleInput = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value)
  emit('update:modelValue', [value])
}
</script>
