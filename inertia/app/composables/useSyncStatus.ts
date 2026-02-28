import { ref, onMounted, onUnmounted } from 'vue'

export type SyncStatus = 'syncing' | 'completed' | 'failed' | 'never_synced' | 'no_church'

export interface SyncStatusResponse {
  status: SyncStatus
  lastSyncAt: string | null
  retryCount: number
  errorMessage: string | null
}

export interface UseSyncStatusOptions {
  onSyncComplete?: () => void
}

export function useSyncStatus(options: UseSyncStatusOptions = {}) {
  const status = ref<SyncStatus | null>(null)
  const lastSyncAt = ref<string | null>(null)
  const retryCount = ref(0)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  let pollInterval: ReturnType<typeof setInterval> | null = null
  let previousStatus: SyncStatus | null = null
  let pollCount = 0
  const MAX_INITIAL_POLLS = 6 // Poll for 30 seconds after page load to catch fast syncs

  const fetchStatus = async () => {
    try {
      isLoading.value = true
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1]

      const response = await fetch('/api/properties/sync-status', {
        headers: {
          'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
        },
        credentials: 'same-origin',
      })

      if (response.ok) {
        const data: SyncStatusResponse = await response.json()

        // Check if sync just completed (was syncing, now completed)
        const justCompleted = previousStatus === 'syncing' && data.status === 'completed'

        previousStatus = data.status
        status.value = data.status
        lastSyncAt.value = data.lastSyncAt
        retryCount.value = data.retryCount
        errorMessage.value = data.errorMessage

        // Trigger callback when sync completes
        if (justCompleted && options.onSyncComplete) {
          options.onSyncComplete()
        }
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    } finally {
      isLoading.value = false
    }
  }

  const startPolling = (intervalMs = 5000) => {
    // Initial fetch
    fetchStatus()

    // Poll while syncing, or for initial period after page load to catch fast-completing syncs
    pollInterval = setInterval(() => {
      pollCount++
      if (status.value === 'syncing' || pollCount <= MAX_INITIAL_POLLS) {
        fetchStatus()
      }
    }, intervalMs)
  }

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  const formatLastSync = () => {
    if (!lastSyncAt.value) return 'Never'

    const date = new Date(lastSyncAt.value)
    const now = new Date()

    // Check if same calendar day
    const isToday = date.toDateString() === now.toDateString()

    // Check if yesterday
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return 'Today'
    } else if (isYesterday) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
  }

  onMounted(() => {
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    status,
    lastSyncAt,
    retryCount,
    errorMessage,
    isLoading,
    fetchStatus,
    formatLastSync,
    startPolling,
    stopPolling,
  }
}
