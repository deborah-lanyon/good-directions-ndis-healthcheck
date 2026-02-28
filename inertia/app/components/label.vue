<template>
  <label
    :class="
      cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </label>
</template>

<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

interface LabelProps extends /* @vue-ignore */ HTMLAttributes {
  class?: string
}

const props = defineProps<LabelProps>()
</script>
