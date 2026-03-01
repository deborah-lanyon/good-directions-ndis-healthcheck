<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div v-if="show" class="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <!-- Header with branded color -->
            <div
              :class="[
                'px-6 py-4',
                type === 'success'
                  ? 'bg-green-50'
                  : type === 'error'
                    ? 'bg-red-50'
                    : 'bg-tertiary bg-opacity-10',
              ]"
            >
              <div class="flex flex-col items-center gap-3">
                <!-- Icon -->
                <div
                  :class="[
                    'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                    type === 'success'
                      ? 'bg-green-100'
                      : type === 'error'
                        ? 'bg-red-100'
                        : 'bg-tertiary bg-opacity-20',
                  ]"
                >
                  <!-- Success Icon -->
                  <svg
                    v-if="type === 'success'"
                    class="w-7 h-7 text-green-600"
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
                    class="w-7 h-7 text-red-600"
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
                    v-else
                    class="w-7 h-7 text-tertiary"
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
                </div>

                <!-- Title -->
                <h3
                  :class="[
                    'text-2xl font-bold font-karla text-center',
                    type === 'success'
                      ? 'text-white'
                      : type === 'error'
                        ? 'text-white'
                        : 'text-white',
                  ]"
                >
                  {{ title }}
                </h3>
              </div>
            </div>

            <!-- Message -->
            <div class="px-6 py-4">
              <p class="text-gray-700 font-open-sans whitespace-pre-line">{{ message }}</p>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                v-if="showCancel"
                @click="cancel"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="confirm"
                :class="[
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                  type === 'success'
                    ? 'bg-green-600 hover:bg-green-700'
                    : type === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-tertiary hover:bg-[#e59a00]',
                ]"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  show: boolean
  type?: 'success' | 'error' | 'info'
  title?: string
  message: string
  confirmText?: string
  showCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: 'Notification',
  confirmText: 'OK',
  showCancel: false,
})

const emit = defineEmits<{
  close: []
  confirm: []
  cancel: []
}>()

const close = () => {
  emit('close')
}

const confirm = () => {
  emit('confirm')
  close()
}

const cancel = () => {
  emit('cancel')
  close()
}

// Close on Escape key
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          close()
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }
)
</script>
