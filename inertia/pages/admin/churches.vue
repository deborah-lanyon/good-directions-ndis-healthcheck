<template>
  <AdminSidebarLayout page-title="All Territories">
      <div class="flex justify-between items-center mb-6">
        <div class="text-sm text-gray-600">{{ churches.length }} territory(ies)</div>
        <button
          @click="showCreateChurchDialog = true"
          class="px-4 py-2 bg-tertiary hover:bg-[#e59a00] text-white font-medium rounded-lg transition-colors"
        >
          + Create Territory
        </button>
      </div>

      <!-- View Toggle Buttons -->
      <div class="mb-6 flex items-center gap-2 md:gap-3">
        <button
          @click="viewMode = 'list'"
          :class="[
            'flex-1 py-2 px-3 md:px-4 rounded-lg text-sm md:text-base font-medium transition-colors',
            viewMode === 'list'
              ? 'bg-tertiary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          List View
        </button>
        <button
          @click="viewMode = 'map'"
          :class="[
            'flex-1 py-2 px-3 md:px-4 rounded-lg text-sm md:text-base font-medium transition-colors',
            viewMode === 'map'
              ? 'bg-tertiary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          Map View
        </button>
      </div>

      <!-- Search and Filter Bar (only show in list view) -->
      <div v-if="viewMode === 'list'" class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by territory name or postcode..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="sm:w-48">
          <Select v-model="sortBy">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="suburb">Sort by Suburb</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Map View -->
      <div v-if="viewMode === 'map'" class="mb-6">
        <MapView :churches="churches" mapHeight="600px" />
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'">
        <div class="mb-4">
          <div class="text-xs md:text-sm text-gray-600">
            Showing {{ filteredChurches.length }} of {{ churches.length }} territory(ies)
          </div>
        </div>

        <!-- Churches List -->
        <div v-if="filteredChurches.length === 0" class="text-center py-12">
          <p class="text-gray-600">No territories found matching your criteria.</p>
        </div>

        <div v-else class="space-y-3">
          <Card
            v-for="church in filteredChurches"
            :key="church.id"
            class="hover:shadow-md transition-shadow border border-gray-200"
          >
            <CardHeader class="p-4">
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-2">
                    <CardTitle class="text-lg font-semibold leading-tight">{{
                      church.churchName
                    }}</CardTitle>
                  </div>

                  <!-- Compact Summary Info -->
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <!-- Location -->
                    <span
                      v-if="church.address || church.suburb || church.postcode"
                      class="flex items-center gap-1.5"
                    >
                      <svg
                        class="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <span>
                        <span v-if="church.address">{{ church.address }}</span
                        ><span v-if="church.address && (church.suburb || church.postcode)">, </span
                        ><span v-if="church.suburb">{{ church.suburb }}</span
                        ><span v-if="church.suburb && church.postcode">, </span
                        ><span v-if="church.postcode">{{ church.postcode }}</span>
                      </span>
                    </span>

                    <span v-if="church.url">
                      <a
                        :href="church.url"
                        target="_blank"
                        class="text-blue-600 hover:underline text-sm"
                        >View Website</a
                      >
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardFooter class="border-t bg-white pt-2.5 pb-2.5">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
                <div class="flex items-center justify-center gap-3 text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    {{ formatDate(church.createdAt) }}
                  </span>
                  <!-- Sync Status -->
                  <span
                    v-if="church.syncStatus === 'syncing'"
                    class="flex items-center gap-1 text-blue-600"
                    title="Sync in progress"
                  >
                    <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing
                  </span>
                  <span
                    v-else-if="church.syncStatus === 'failed'"
                    class="flex items-center gap-1 text-red-600"
                    :title="church.syncErrorMessage || 'Sync failed'"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Sync failed
                  </span>
                  <span
                    v-else-if="church.lastSyncAt"
                    class="flex items-center gap-1 text-green-600"
                    :title="'Last synced: ' + formatDateTime(church.lastSyncAt)"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {{ formatRelativeTime(church.lastSyncAt) }}
                  </span>
                  <span
                    v-else
                    class="flex items-center gap-1 text-gray-400"
                    title="Never synced"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Never synced
                  </span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button
                    @click="selectTerritory(church.id)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                    title="Select this territory"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span class="hidden md:inline">Select</span>
                  </button>
                  <button
                    @click="deleteChurch(church.id, church.churchName)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors"
                    title="Delete territory"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span class="hidden md:inline">Delete</span>
                  </button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    <!-- Notification Modal -->
    <NotificationModal
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :show-cancel="notification.showCancel"
      :confirm-text="notification.confirmText"
      @close="notification.show = false"
      @confirm="notification.onConfirm"
      @cancel="notification.show = false"
    />

    <!-- Create Church Dialog -->
    <div
      v-if="showCreateChurchDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900">Create New Territory</h3>
          <button
            @click="showCreateChurchDialog = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="createChurch" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Territory Name *</label>
            <input
              v-model="newChurch.churchName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Sans Souci"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Postcode *</label>
            <input
              v-model="newChurch.postcode"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2000"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-tertiary hover:bg-[#e59a00] text-white font-medium rounded-lg transition-colors"
            >
              Create Territory
            </button>
            <button
              type="button"
              @click="showCreateChurchDialog = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminSidebarLayout>
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted, onUnmounted, ref, computed, watch } from 'vue'
import AdminSidebarLayout from '~/app/components/layouts/admin-sidebar-layout.vue'
import NotificationModal from '~/app/components/shared/notification-modal.vue'
import { Card, CardHeader, CardTitle, CardFooter } from '~/app/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/app/components/ui/select'
import MapView from '~/app/components/admin/MapView.vue'
import { router } from '@inertiajs/vue3'

onErrorCaptured((err) => {
  console.error('Error in admin churches page:', err)
  return false
})

interface Church {
  id: number
  churchName: string
  address: string | null
  suburb: string | null
  postcode: string | null
  url: string
  latitude: number | null
  longitude: number | null
  radius: number | null
  logoUrl: string | null
  bannerUrl: string | null
  propertyCount: number
  hasWelcomePack: boolean
  createdAt: string
  updatedAt: string | null
  syncStatus: 'syncing' | 'completed' | 'failed' | null
  lastSyncAt: string | null
  syncErrorMessage: string | null
}

const props = defineProps<{
  churches: Church[]
}>()

// Reactive churches list (updated by sync status polling)
const churches = ref<Church[]>([...props.churches])

// Poll sync status while any church is syncing
let syncPollTimer: ReturnType<typeof setInterval> | null = null

const hasSyncingChurch = computed(() =>
  churches.value.some((c) => c.syncStatus === 'syncing')
)

const pollSyncStatus = async () => {
  try {
    const response = await fetch('/api/admin/churches/sync-status', {
      credentials: 'same-origin',
    })
    if (!response.ok) return
    const statuses: Array<{ id: number; syncStatus: string | null; lastSyncAt: string | null; syncErrorMessage: string | null }> = await response.json()
    for (const status of statuses) {
      const church = churches.value.find((c) => c.id === status.id)
      if (church) {
        church.syncStatus = status.syncStatus as Church['syncStatus']
        church.lastSyncAt = status.lastSyncAt
        church.syncErrorMessage = status.syncErrorMessage
      }
    }
  } catch {
    // Silently fail
  }
}

const startSyncPolling = () => {
  if (syncPollTimer) return
  syncPollTimer = setInterval(pollSyncStatus, 5000)
}

const stopSyncPolling = () => {
  if (syncPollTimer) {
    clearInterval(syncPollTimer)
    syncPollTimer = null
  }
}

onMounted(() => {
  if (hasSyncingChurch.value) {
    startSyncPolling()
  }
})

onUnmounted(() => {
  stopSyncPolling()
})

// Watch for changes - start/stop polling as needed
watch(hasSyncingChurch, (isSyncing) => {
  if (isSyncing) {
    startSyncPolling()
  } else {
    stopSyncPolling()
  }
})

// View toggle
const viewMode = ref<'list' | 'map'>('list')

// Create territory dialog
const showCreateChurchDialog = ref(false)
const newChurch = ref({
  churchName: '',
  postcode: '',
})

// Notification modal
const notification = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'info',
  title: 'Notification',
  message: '',
  showCancel: false,
  confirmText: 'OK',
  onConfirm: () => {},
})

const showNotification = (
  type: 'success' | 'error' | 'info',
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  notification.value = {
    show: true,
    type,
    title,
    message,
    showCancel: false,
    confirmText: 'OK',
    onConfirm: onConfirm || (() => {}),
  }
}

const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'OK'
) => {
  notification.value = {
    show: true,
    type: 'info',
    title,
    message,
    showCancel: true,
    confirmText,
    onConfirm,
  }
}

const selectTerritory = async (churchId: number) => {
  try {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch(`/api/admin/churches/${churchId}/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      router.visit('/dashboard')
    } else {
      showNotification('error', 'Error', 'Failed to select territory')
    }
  } catch (error) {
    console.error('Error selecting territory:', error)
    showNotification('error', 'Error', 'An error occurred while selecting the territory')
  }
}

const deleteChurch = async (churchId: number, churchName: string) => {
  showConfirmation(
    'Delete Territory',
    `You are about to delete "${churchName}".\n\nThis will permanently delete:\n• The territory profile\n• All associated properties\n• All visitors\n\nThis action cannot be undone. Are you sure you want to proceed?`,
    async () => {
      await performDeleteChurch(churchId)
    },
    'DELETE'
  )
}

const performDeleteChurch = async (churchId: number) => {
  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch(`/api/admin/churches/${churchId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      showNotification('success', 'Success', 'Territory deleted successfully', () => {
        window.location.reload()
      })
    } else {
      const data = await response
        .json()
        .catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
      console.error('Delete territory failed:', response.status, data)
      showNotification(
        'error',
        'Deletion Failed',
        `Failed to delete territory: ${data.error || 'Unknown error'}`
      )
    }
  } catch (error) {
    console.error('Error deleting territory:', error)
    showNotification(
      'error',
      'Error',
      `An error occurred while deleting the territory: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Create territory function
const createChurch = async () => {
  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch('/api/admin/churches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
      },
      credentials: 'same-origin',
      body: JSON.stringify(newChurch.value),
    })

    if (response.ok) {
      showNotification('success', 'Success', 'Territory created successfully!', () => {
        showCreateChurchDialog.value = false
        // Reset form
        newChurch.value = {
          churchName: '',
          postcode: '',
        }
        window.location.reload()
      })
    } else {
      const data = await response.json()
      showNotification(
        'error',
        'Creation Failed',
        `Failed to create territory: ${data.error || 'Unknown error'}`
      )
    }
  } catch (error) {
    console.error('Error creating territory:', error)
    showNotification('error', 'Error', 'An error occurred while creating the territory')
  }
}

// Search and filter state
const searchQuery = ref('')
const sortBy = ref('name')

// Filtered and sorted churches
const filteredChurches = computed(() => {
  let result = [...churches.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (church) =>
        church.churchName.toLowerCase().includes(query) ||
        church.postcode?.toLowerCase().includes(query) ||
        church.suburb?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.churchName.localeCompare(b.churchName)
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'suburb':
        return (a.suburb || '').localeCompare(b.suburb || '')
      default:
        return 0
    }
  })

  return result
})

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    console.error('Error formatting date:', e)
    return dateString
  }
}

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    return dateString
  }
}

const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  } catch (e) {
    return dateString
  }
}
</script>
