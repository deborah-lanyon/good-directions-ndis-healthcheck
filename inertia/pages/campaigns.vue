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
              <p class="font-karla text-sm text-gray-500 mt-1">
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
              <span
                v-if="campaign.postedAt"
                class="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"
              >
                Posted {{ formatDate(campaign.postedAt) }}
              </span>
              <span v-else class="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                Not posted
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <a
              :href="`/api/campaigns/${campaign.id}/labels`"
              target="_blank"
              class="px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-medium transition-colors"
            >
              Download Labels
            </a>
            <button
              v-if="!campaign.postedAt"
              @click="markAsPosted(campaign.id)"
              class="px-3 py-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-md font-medium transition-colors"
            >
              Mark as Posted
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
      <div class="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="p-6 border-b border-gray-200">
          <h3 class="font-caprasimo text-2xl text-primary">Create Mail Campaign</h3>
          <p class="font-karla text-sm text-gray-500 mt-1">Select properties to include in this mail campaign.</p>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <!-- Campaign Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 font-karla">Campaign Name *</label>
            <input
              v-model="newCampaign.name"
              type="text"
              required
              placeholder="e.g. March 2026 - Postcode 2000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-karla"
            />
          </div>

          <!-- Property Selection -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 font-karla">
                Select Properties * ({{ selectedPropertyIds.length }} selected)
              </label>
              <div class="flex gap-2">
                <button
                  @click="selectAllProperties"
                  class="text-xs text-primary hover:underline font-karla"
                >
                  Select All
                </button>
                <button
                  @click="deselectAllProperties"
                  class="text-xs text-gray-500 hover:underline font-karla"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <!-- Search -->
            <input
              v-model="propertySearch"
              type="text"
              placeholder="Search addresses..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 font-karla text-sm"
            />

            <div v-if="loadingProperties" class="text-center py-4">
              <p class="font-karla text-sm text-gray-500">Loading properties...</p>
            </div>

            <div v-else class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <label
                v-for="property in filteredProperties"
                :key="property.id"
                class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  :value="property.id"
                  v-model="selectedPropertyIds"
                  class="w-4 h-4 text-primary rounded border-gray-300"
                />
                <div class="flex-1 min-w-0">
                  <p class="font-karla text-sm truncate">{{ property.address }}</p>
                  <p v-if="property.trackingCode" class="font-karla text-xs text-gray-400">
                    Code: {{ property.trackingCode }}
                  </p>
                </div>
              </label>
              <div v-if="filteredProperties.length === 0" class="px-3 py-4 text-center">
                <p class="font-karla text-sm text-gray-500">No properties found.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 flex gap-3">
          <button
            @click="createCampaign"
            :disabled="!newCampaign.name || selectedPropertyIds.length === 0 || creating"
            class="flex-1 px-4 py-2 bg-tertiary text-white font-medium rounded-lg hover:bg-[#e59a00] disabled:opacity-50 transition-colors font-karla"
          >
            {{ creating ? 'Creating...' : `Create Campaign (${selectedPropertyIds.length} properties)` }}
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
import { ref, computed } from 'vue'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import NotificationModal from '~/app/components/shared/notification-modal.vue'

interface Campaign {
  id: number
  name: string
  propertyCount: number
  postedAt: string | null
  responseCount: number
  createdAt: string | null
}

interface PropertyOption {
  id: number
  address: string
  trackingCode: string | null
  postcode: string | null
  streetName: string | null
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
}>()

const campaignList = ref<Campaign[]>([...props.campaigns])

const showCreateDialog = ref(false)
const creating = ref(false)
const loadingProperties = ref(false)
const availableProperties = ref<PropertyOption[]>([])
const selectedPropertyIds = ref<number[]>([])
const propertySearch = ref('')
const newCampaign = ref({ name: '' })

const notification = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'info',
  title: '',
  message: '',
})

const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  notification.value = { show: true, type, title, message }
}

const filteredProperties = computed(() => {
  if (!propertySearch.value) return availableProperties.value
  const search = propertySearch.value.toLowerCase()
  return availableProperties.value.filter(
    (p) =>
      p.address.toLowerCase().includes(search) ||
      p.postcode?.toLowerCase().includes(search) ||
      p.streetName?.toLowerCase().includes(search)
  )
})

const selectAllProperties = () => {
  selectedPropertyIds.value = filteredProperties.value.map((p) => p.id)
}

const deselectAllProperties = () => {
  selectedPropertyIds.value = []
}

const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]
}

const openCreateDialog = async () => {
  showCreateDialog.value = true
  loadingProperties.value = true
  selectedPropertyIds.value = []
  newCampaign.value.name = ''
  propertySearch.value = ''

  try {
    const csrfToken = getCsrfToken()
    const response = await fetch('/api/campaigns/properties', {
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      const data = await response.json()
      availableProperties.value = data.properties
    }
  } catch (error) {
    showNotification('error', 'Error', 'Failed to load properties')
  } finally {
    loadingProperties.value = false
  }
}

const createCampaign = async () => {
  if (!newCampaign.value.name || selectedPropertyIds.value.length === 0) return

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
        propertyIds: selectedPropertyIds.value,
      }),
    })

    if (response.ok) {
      showCreateDialog.value = false
      showNotification('success', 'Campaign Created', 'Your mail campaign has been created. You can now download address labels.')
      window.location.reload()
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
      showNotification('success', 'Campaign Deleted', 'Campaign has been deleted.')
      window.location.reload()
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
