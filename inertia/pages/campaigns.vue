<template>
  <SidebarLayout page-title="Mail Campaigns">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <p class="font-karla text-sm text-gray-500">Total Campaigns</p>
        <p class="font-caprasimo text-2xl text-primary">{{ stats.totalCampaigns }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <p class="font-karla text-sm text-gray-500">Packs Sent</p>
        <p class="font-caprasimo text-2xl text-primary">{{ stats.totalPacksSent }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <p class="font-karla text-sm text-gray-500">Responses</p>
        <p class="font-caprasimo text-2xl text-primary">{{ stats.totalResponses }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <p class="font-karla text-sm text-gray-500">Conversion Rate</p>
        <p class="font-caprasimo text-2xl text-primary">{{ stats.conversionRate }}%</p>
      </div>
    </div>

    <!-- Control Bar -->
    <div class="flex justify-between items-center mb-6">
      <div class="font-karla text-sm text-gray-600">
        {{ campaignList.length }} campaign(s)
      </div>
      <button
        @click="openCreateDialog"
        class="px-4 py-2 bg-tertiary hover:bg-[#e59a00] text-white font-medium rounded-lg transition-colors"
        :disabled="!churchId"
      >
        + New Campaign
      </button>
    </div>

    <!-- No territory selected -->
    <div v-if="!churchId" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <p class="font-karla text-yellow-800">Please select a territory first to manage mail campaigns.</p>
    </div>

    <!-- Campaign List -->
    <div v-else class="space-y-4">
      <div v-if="campaignList.length === 0" class="bg-white rounded-lg p-8 border border-gray-200 text-center">
        <p class="font-karla text-gray-500">No campaigns yet. Create your first mail campaign to get started.</p>
      </div>

      <div
        v-for="campaign in campaignList"
        :key="campaign.id"
        class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div class="p-4 md:p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-caprasimo text-lg text-primary">{{ campaign.name }}</h3>
              <div class="flex flex-wrap gap-1 mt-1.5">
                <span
                  v-for="pc in campaign.postcodes"
                  :key="pc"
                  class="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700"
                >{{ pc }}</span>
              </div>
              <p class="font-karla text-sm text-gray-500 mt-1.5">
                {{ campaign.propertyCount }} properties
                <span v-if="campaign.responseCount > 0" class="text-green-600 font-semibold ml-2">
                  {{ campaign.responseCount }} response(s)
                </span>
              </p>
              <p class="font-karla text-xs text-gray-400 mt-1">
                Created {{ formatDate(campaign.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <!-- Sync Status Badge -->
              <span
                v-if="campaign.syncStatus === 'syncing' || campaign.syncStatus === 'pending'"
                class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"
              >
                <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </span>
              <span
                v-else-if="campaign.syncStatus === 'failed'"
                class="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"
                :title="campaign.syncErrorMessage || 'Sync failed'"
              >
                Sync Failed
              </span>
              <!-- Posted Status -->
              <span
                v-if="campaign.postedAt"
                class="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"
              >
                Posted {{ formatDate(campaign.postedAt) }}
              </span>
              <span v-else-if="campaign.syncStatus === 'completed'" class="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                Not posted
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <a
              v-if="campaign.syncStatus === 'completed' && campaign.propertyCount > 0"
              :href="`/campaigns/${campaign.id}/properties`"
              class="px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-medium transition-colors"
            >
              View Properties
            </a>
            <a
              v-if="campaign.syncStatus === 'completed'"
              :href="`/api/campaigns/${campaign.id}/labels`"
              target="_blank"
              class="px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-medium transition-colors"
            >
              Download Labels
            </a>
            <button
              v-if="campaign.syncStatus === 'completed' && !campaign.postedAt"
              @click="markAsPosted(campaign.id)"
              class="px-3 py-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-md font-medium transition-colors"
            >
              Mark as Posted
            </button>
            <button
              v-if="campaign.syncStatus === 'failed'"
              @click="retrySync(campaign.id)"
              class="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium transition-colors"
            >
              Retry Sync
            </button>
            <button
              @click="deleteCampaign(campaign.id)"
              class="px-3 py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-medium transition-colors ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Campaign Dialog -->
    <div v-if="showCreateDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="p-6 border-b border-gray-200">
          <h3 class="font-caprasimo text-2xl text-primary">Create Mail Campaign</h3>
          <p class="font-karla text-sm text-gray-500 mt-1">Enter postcodes to target with this mail campaign.</p>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <!-- Campaign Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 font-karla">Campaign Name *</label>
            <input
              v-model="newCampaign.name"
              type="text"
              required
              placeholder="e.g. March 2026 - Inner Sydney"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-karla"
            />
          </div>

          <!-- Postcode Entry -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 font-karla">
              Target Postcodes * ({{ postcodeEntries.length }} entered)
            </label>
            <!-- Postcode Tags -->
            <div class="flex flex-wrap gap-1.5 mb-2" v-if="postcodeEntries.length > 0">
              <span
                v-for="(entry, idx) in postcodeEntries"
                :key="idx"
                class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md font-karla"
                :class="entry.valid ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-700'"
              >
                {{ entry.postcode }}
                <span v-if="entry.state" class="text-xs opacity-70">({{ entry.state }})</span>
                <button @click="removePostcode(idx)" class="ml-0.5 hover:text-red-500">&times;</button>
              </span>
            </div>

            <!-- Input -->
            <div class="flex gap-2">
              <input
                v-model="postcodeInput"
                type="text"
                placeholder="Enter postcode and press Enter"
                @keydown.enter.prevent="addPostcode"
                @keydown.,="addPostcode"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-karla text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                @click="addPostcode"
                type="button"
                class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-karla transition-colors"
              >
                Add
              </button>
            </div>

            <!-- Validation message -->
            <p v-if="postcodeError" class="text-xs text-red-600 mt-1 font-karla">{{ postcodeError }}</p>

            <!-- Territory states hint -->
            <p v-if="territoryStates.length > 0" class="text-xs text-gray-400 mt-1 font-karla">
              Territory covers: {{ territoryStates.join(', ') }}
            </p>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 flex gap-3">
          <button
            @click="createCampaign"
            :disabled="!newCampaign.name || validPostcodes.length === 0 || creating"
            class="flex-1 px-4 py-2 bg-tertiary text-white font-medium rounded-lg hover:bg-[#e59a00] disabled:opacity-50 transition-colors font-karla"
          >
            {{ creating ? 'Creating...' : `Create Campaign (${validPostcodes.length} postcodes)` }}
          </button>
          <button
            @click="showCreateDialog = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors font-karla"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <NotificationModal
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="notification.show = false"
    />
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import NotificationModal from '~/app/components/shared/notification-modal.vue'

interface Campaign {
  id: number
  name: string
  postcodes: string[]
  propertyCount: number
  syncStatus: string | null
  syncErrorMessage: string | null
  postedAt: string | null
  responseCount: number
  createdAt: string | null
}

interface Stats {
  totalCampaigns: number
  postedCampaigns: number
  totalPacksSent: number
  totalResponses: number
  conversionRate: string
}

const props = defineProps<{
  campaigns: Campaign[]
  stats: Stats
  churchId: number | null
  territoryStates: string[]
}>()

const campaignList = ref<Campaign[]>([...props.campaigns])

const showCreateDialog = ref(false)
const creating = ref(false)
const postcodeInput = ref('')
const postcodeError = ref('')
const newCampaign = ref({ name: '' })

interface PostcodeEntry {
  postcode: string
  state: string | null
  valid: boolean
}

const postcodeEntries = ref<PostcodeEntry[]>([])

const notification = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'info',
  title: '',
  message: '',
})

const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  notification.value = { show: true, type, title, message }
}

// Postcode-to-state mapping (Australian postcode ranges)
const getStateForPostcode = (postcode: string): string | null => {
  const num = parseInt(postcode, 10)
  if (isNaN(num)) return null

  if (num >= 800 && num <= 999) return 'NT'
  if (num >= 1000 && num <= 2599) return 'NSW'
  if (num >= 2600 && num <= 2618) return 'ACT'
  if (num >= 2619 && num <= 2899) return 'NSW'
  if (num >= 2900 && num <= 2920) return 'ACT'
  if (num >= 2921 && num <= 2999) return 'NSW'
  if (num >= 3000 && num <= 3999) return 'VIC'
  if (num >= 4000 && num <= 4999) return 'QLD'
  if (num >= 5000 && num <= 5999) return 'SA'
  if (num >= 6000 && num <= 6999) return 'WA'
  if (num >= 7000 && num <= 7999) return 'TAS'
  return null
}

const validPostcodes = computed(() =>
  postcodeEntries.value.filter((e) => e.valid).map((e) => e.postcode)
)

const addPostcode = () => {
  const raw = postcodeInput.value.replace(/,/g, '').trim()
  if (!raw) return

  postcodeError.value = ''

  // Validate format
  if (!/^\d{3,4}$/.test(raw)) {
    postcodeError.value = 'Postcode must be 3-4 digits'
    return
  }

  // Check duplicate
  if (postcodeEntries.value.some((e) => e.postcode === raw)) {
    postcodeError.value = 'Postcode already added'
    postcodeInput.value = ''
    return
  }

  const state = getStateForPostcode(raw)
  const valid = props.territoryStates.length === 0 ||
    (state !== null && props.territoryStates.includes(state))

  if (!valid) {
    postcodeError.value = `Postcode ${raw} is in ${state || 'unknown state'}, outside territory (${props.territoryStates.join(', ')})`
  }

  postcodeEntries.value.push({ postcode: raw, state, valid })
  postcodeInput.value = ''
}

const removePostcode = (idx: number) => {
  postcodeEntries.value.splice(idx, 1)
  postcodeError.value = ''
}

const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]
}

const openCreateDialog = () => {
  showCreateDialog.value = true
  postcodeEntries.value = []
  postcodeInput.value = ''
  postcodeError.value = ''
  newCampaign.value.name = ''
}

const createCampaign = async () => {
  if (!newCampaign.value.name || validPostcodes.value.length === 0) return

  creating.value = true
  try {
    const csrfToken = getCsrfToken()
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        name: newCampaign.value.name,
        postcodes: validPostcodes.value,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      showCreateDialog.value = false
      showNotification('success', 'Campaign Created', 'Property sync is in progress. Labels will be available once sync completes.')

      // Add the new campaign to the list with syncing status
      campaignList.value.unshift({
        id: data.campaign.id,
        name: data.campaign.name,
        postcodes: data.campaign.postcodes,
        propertyCount: 0,
        syncStatus: 'pending',
        syncErrorMessage: null,
        postedAt: null,
        responseCount: 0,
        createdAt: new Date().toISOString(),
      })

      // Start polling for this campaign
      startSyncPolling()
    } else {
      const data = await response.json()
      showNotification('error', 'Creation Failed', data.error || 'Failed to create campaign')
    }
  } catch (error) {
    showNotification('error', 'Error', 'An error occurred while creating the campaign')
  } finally {
    creating.value = false
  }
}

// Sync status polling
let syncPollTimer: ReturnType<typeof setInterval> | null = null

const hasSyncingCampaign = computed(() =>
  campaignList.value.some((c) => c.syncStatus === 'syncing' || c.syncStatus === 'pending')
)

const pollSyncStatus = async () => {
  const syncingCampaigns = campaignList.value.filter(
    (c) => c.syncStatus === 'syncing' || c.syncStatus === 'pending'
  )

  for (const campaign of syncingCampaigns) {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/sync-status`, {
        credentials: 'same-origin',
      })
      if (response.ok) {
        const data = await response.json()
        campaign.syncStatus = data.syncStatus
        campaign.propertyCount = data.propertyCount
        campaign.syncErrorMessage = data.errorMessage
      }
    } catch {
      // Silently fail individual polls
    }
  }

  // Stop polling if no more syncing campaigns
  if (!hasSyncingCampaign.value) {
    stopSyncPolling()
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
  if (hasSyncingCampaign.value) {
    startSyncPolling()
  }
})

onUnmounted(() => {
  stopSyncPolling()
})

const markAsPosted = async (campaignId: number) => {
  if (!confirm('Mark this campaign as posted? This records the mail date.')) return

  try {
    const csrfToken = getCsrfToken()
    const response = await fetch(`/api/campaigns/${campaignId}/posted`, {
      method: 'POST',
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      showNotification('success', 'Campaign Posted', 'Campaign has been marked as posted.')
      window.location.reload()
    } else {
      showNotification('error', 'Error', 'Failed to mark campaign as posted')
    }
  } catch (error) {
    showNotification('error', 'Error', 'An error occurred')
  }
}

const retrySync = async (campaignId: number) => {
  try {
    const csrfToken = getCsrfToken()
    const response = await fetch(`/api/campaigns/${campaignId}/retry-sync`, {
      method: 'POST',
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      const campaign = campaignList.value.find((c) => c.id === campaignId)
      if (campaign) {
        campaign.syncStatus = 'syncing'
        campaign.syncErrorMessage = null
      }
      startSyncPolling()
      showNotification('info', 'Sync Restarted', 'Property sync has been restarted.')
    } else {
      showNotification('error', 'Error', 'Failed to retry sync')
    }
  } catch (error) {
    showNotification('error', 'Error', 'An error occurred')
  }
}

const deleteCampaign = async (campaignId: number) => {
  if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return

  try {
    const csrfToken = getCsrfToken()
    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: 'DELETE',
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      campaignList.value = campaignList.value.filter((c) => c.id !== campaignId)
      showNotification('success', 'Campaign Deleted', 'Campaign has been deleted.')
    } else {
      showNotification('error', 'Error', 'Failed to delete campaign')
    }
  } catch (error) {
    showNotification('error', 'Error', 'An error occurred')
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
