<template>
  <footer class="bg-primary pt-16 pb-12">
    <Container>
      <div
        class="flex flex-col items-center justify-center gap-y-11 lg:flex-row lg:justify-between lg:gap-y-0"
      >
        <div class="flex max-w-max flex-col items-center gap-y-9 md:items-start">
          <img :src="logo" alt="Good Directions Logo" class="h-16 max-w-max md:h-[102px]" />
          <a
            href="mailto:peter@gooddirections.com.au"
            class="text-quaternary font-karla text-center text-lg font-semibold md:text-left md:text-2xl"
          >
            peter@gooddirections.com.au
          </a>
        </div>
        <div
          class="text-quaternary font-karla flex flex-col items-center gap-11 text-2xl leading-[130%] font-normal lg:flex-row lg:items-start lg:self-end"
        >
          <a href="">Terms and Conditions</a>
          <a href="">Privacy Policy</a>
        </div>
      </div>
    </Container>
  </footer>
</template>

<script setup lang="ts">
import Container from './container.vue'

import logo from '@/app/images/logo-white.png'
</script>
