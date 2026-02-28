<template>
  <div
    v-if="show"
    class="fixed inset-0 overflow-y-auto flex items-center justify-center p-4"
    style="z-index: 9999; background-color: rgba(0, 0, 0, 0.5)"
    @click.self="onCancel"
  >
    <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all">
      <!-- Icon -->
      <div
        class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full"
        :class="variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'"
      >
        <svg
          class="w-6 h-6"
          :class="variant === 'danger' ? 'text-red-600' : 'text-yellow-600'"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            v-if="variant === 'danger'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">
        {{ title }}
      </h3>

      <!-- Message -->
      <p class="text-sm text-gray-600 text-center mb-6">
        {{ message }}
      </p>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          type="button"
          @click="onCancel"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          @click="onConfirm"
          :disabled="loading"
          class="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
          :class="
            variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-yellow-600 hover:bg-yellow-700'
          "
        >
          {{ loading ? 'Processing...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
}
</script>
