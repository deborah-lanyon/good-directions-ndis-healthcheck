<template>
  <h1
    :class="[
      'font-caprasimo mx-auto max-w-xl text-center text-4xl lg:max-w-[760px] lg:text-[81px] lg:leading-[74.74px]',
      styleClass,
    ]"
  >
    {{ title }}
  </h1>
</template>
<script setup lang="ts">
defineProps<{
  title: string
  styleClass?: string
}>()
</script>

<style scoped></style>
