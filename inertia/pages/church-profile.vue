<template>
  <SidebarLayout pageTitle="Church Profile" pageSubtitle="Manage your church details and settings">
    <div class="w-full space-y-6">
      <PersonalDetails :user="user" />
      <AdminVisitorToggle :admin-visitor-enabled="props.adminVisitorEnabled ?? false" />
      <ChurchLocationDetails
        :church="props.church"
        :errors="props.errors"
        :sync-result="props.syncResult"
        @sync-started="handleSyncStarted"
        @sync-completed="handleSyncCompleted"
        @sync-error="handleSyncError"
      />
    </div>
    <!-- Toast Notifications -->
    <div
      v-if="toast.show"
      :class="[
        'fixed top-4 right-4 z-50 max-w-sm w-full bg-card border shadow-lg rounded-lg p-4 transition-all duration-300',
        toast.type === 'success'
          ? 'border-green-200 bg-green-50'
          : toast.type === 'error'
            ? 'border-red-200 bg-red-50'
            : 'border-blue-200 bg-blue-50',
      ]"
      data-testid="toast-notification"
    >
      <div class="flex items-start">
        <div class="shrink-0">
          <div v-if="toast.type === 'success'" class="w-5 h-5 text-green-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div v-else class="w-5 h-5 text-blue-600">
            <svg class="animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
        <div class="flex-1 ml-3">
          <p
            class="text-sm font-medium"
            :class="
              toast.type === 'success'
                ? 'text-green-800'
                : toast.type === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
            "
          >
            {{ toast.message }}
          </p>
        </div>
        <div class="flex-shrink-0 ml-4">
          <button
            @click="hideToast"
            class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import type { User, Church } from '~/app/types'
import PersonalDetails from '~/app/components/church-profile/personal-details.vue'
import AdminVisitorToggle from '~/app/components/church-profile/admin-visitor-toggle.vue'
import ChurchLocationDetails from '~/app/components/church-profile/church-location-details.vue'

const page = usePage()
const user = computed(() => page.props.user as User)

const props = defineProps<{
  church: Church | null
  errors?: Record<string, string | string[]>
  syncResult?: {
    totalFromApi?: number
    propertiesReported?: number
    propertiesFiltered?: number
    propertiesCreated?: number
    propertiesSkipped?: number
    error?: string
  } | null
  adminVisitorEnabled?: boolean
}>()

const toast = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'info',
  message: '',
})

const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  toast.value = {
    show: true,
    type,
    message,
  }

  // Auto-hide after 5 seconds for success/error, keep info visible longer
  if (type !== 'info') {
    setTimeout(() => {
      hideToast()
    }, 5000)
  }
}

const hideToast = () => {
  toast.value.show = false
}

const handleSyncStarted = () => {
  showToast('info', 'Syncing properties... This may take a moment.')
}

const handleSyncCompleted = () => {
  showToast('success', 'Sync completed successfully!')
}

const handleSyncError = (error: string) => {
  showToast('error', `Sync failed: ${error}`)
}
</script>
