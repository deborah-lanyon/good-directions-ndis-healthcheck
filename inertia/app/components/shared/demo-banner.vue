<template>
  <div v-if="demoMode" class="bg-amber-700 text-white py-2 border-b border-white/20 flex-shrink-0">
    <div class="container mx-auto px-4 flex justify-center items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <span class="font-karla text-sm font-medium">DEMO MODE</span>

      <button
        @click="exitDemoMode"
        class="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
      >
        Exit Demo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'

const page = usePage()
const demoMode = computed(() => page.props.demoMode as string | null)

const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]
}

const exitDemoMode = async () => {
  try {
    const csrfToken = getCsrfToken()
    await fetch('/api/admin/demo/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ mode: 'off' }),
    })
    window.location.href = '/admin/churches'
  } catch (error) {
    console.error('Failed to exit demo mode:', error)
  }
}
</script>
