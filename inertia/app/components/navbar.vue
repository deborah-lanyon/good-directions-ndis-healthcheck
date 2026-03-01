<template>
  <nav class="relative">
    <svg
      class="absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 1512 191"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.000854492 -12H1512C1512 -12 2129 107.511 1512 169.204C895 230.897 597 137.375 0.000854492 169.204C-596.998 201.033 0.000854492 -12 0.000854492 -12Z"
        fill="#6d3b90"
      />
    </svg>
    <div class="relative z-10 container mx-auto p-4">
      <a href="/home">
        <img :src="logoWhite" alt="Good Directions Logo" class="mb-4 h-20 py-3" />
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import logoWhite from '@/app/images/logo-white.png'
</script>

<style scoped></style>
