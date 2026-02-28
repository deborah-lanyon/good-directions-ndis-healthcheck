<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed top-4 right-4 z-[10001] animate-slide-in"
      :class="{ 'animate-slide-out': isClosing }"
    >
      <div
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md"
        :class="[
          type === 'success'
            ? 'bg-green-50 border border-green-200'
            : type === 'error'
              ? 'bg-red-50 border border-red-200'
              : type === 'info'
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-yellow-50 border border-yellow-200',
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <!-- Success Icon -->
          <svg
            v-if="type === 'success'"
            class="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <!-- Error Icon -->
          <svg
            v-else-if="type === 'error'"
            class="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <!-- Info Icon -->
          <svg
            v-else-if="type === 'info'"
            class="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <!-- Warning Icon -->
          <svg
            v-else
            class="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <!-- Message -->
        <div class="flex-1">
          <p
            class="text-sm font-medium"
            :class="[
              type === 'success'
                ? 'text-green-900'
                : type === 'error'
                  ? 'text-red-900'
                  : type === 'info'
                    ? 'text-blue-900'
                    : 'text-yellow-900',
            ]"
          >
            {{ message }}
          </p>
        </div>

        <!-- Close Button -->
        <button @click="close" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const isClosing = ref(false)
let timeout: NodeJS.Timeout | null = null

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      isClosing.value = false

      // Auto-close after duration
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        close()
      }, props.duration || 3000)
    }
  }
)

function close() {
  isClosing.value = true
  setTimeout(() => {
    emit('close')
  }, 300) // Match animation duration
}
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.animate-slide-out {
  animation: slide-out 0.3s ease-in;
}
</style>
