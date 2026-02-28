<template>
  <div v-if="demoStatus?.available" class="relative">
    <!-- Single demo church: simple button -->
    <button
      v-if="demoStatus.churches.length === 1"
      @click="openDemo(demoStatus.churches[0].id)"
      :disabled="isLoading"
      class="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
    >
      Demo Sites
    </button>

    <!-- Multiple demo churches: button with dropdown -->
    <template v-else>
      <button
        @click="showDropdown = !showDropdown"
        :disabled="isLoading"
        class="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
      >
        <span>Demo Sites</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      >
        <button
          v-for="church in demoStatus.churches"
          :key="church.id"
          @click="openDemo(church.id)"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {{ church.name }}
        </button>
      </div>
    </template>

    <!-- Click-outside overlay to close dropdown -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="showDropdown = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface DemoChurch {
  id: number
  name: string
}

interface DemoStatus {
  available: boolean
  active: boolean
  mode: 'off' | 'church_admin'
  churches: DemoChurch[]
}

const demoStatus = ref<DemoStatus | null>(null)
const isLoading = ref(false)
const showDropdown = ref(false)

const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]
}

const fetchDemoStatus = async () => {
  try {
    const csrfToken = getCsrfToken()
    const response = await fetch('/api/admin/demo/status', {
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })
    if (response.ok) {
      demoStatus.value = await response.json()
    }
  } catch (error) {
    // Silently fail
  }
}

const openDemo = async (churchId: number) => {
  isLoading.value = true
  showDropdown.value = false
  try {
    const csrfToken = getCsrfToken()
    const response = await fetch('/api/admin/demo/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ mode: 'church_admin', churchId }),
    })

    if (response.ok) {
      window.location.href = '/dashboard'
    }
  } catch (error) {
    console.error('Failed to open demo:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDemoStatus()
})
</script>
