<template>
  <SidebarLayout :page-title="campaign.name" page-subtitle="Campaign Properties">
    <!-- Back link + Campaign Info -->
    <div class="mb-6">
      <a href="/campaigns" class="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors font-karla mb-4">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Campaigns
      </a>

      <div class="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="pc in campaign.postcodes"
                :key="pc"
                class="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700"
              >{{ pc }}</span>
            </div>
            <p class="font-karla text-sm text-gray-600">
              {{ properties.length }} properties synced
              <span v-if="campaign.postedAt" class="ml-2 text-green-600 font-medium">
                Posted {{ formatDate(campaign.postedAt) }}
              </span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <a
              :href="`/api/campaigns/${campaign.id}/labels`"
              target="_blank"
              class="px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-medium transition-colors"
            >
              Download Labels
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by address..."
        class="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm font-karla focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>

    <!-- Properties Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="filteredProperties.length === 0" class="p-8 text-center">
        <p class="font-karla text-gray-500">
          {{ searchQuery ? 'No properties match your search.' : 'No properties synced for this campaign yet.' }}
        </p>
      </div>

      <!-- Desktop Table -->
      <div v-else class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th
                v-for="col in columns"
                :key="col.key"
                @click="col.sortable && toggleSort(col.key)"
                class="text-left px-4 py-3 font-karla font-medium text-gray-600"
                :class="{ 'cursor-pointer hover:text-primary': col.sortable }"
              >
                {{ col.label }}
                <span v-if="sortKey === col.key" class="ml-1">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="property in paginatedProperties"
              :key="property.id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-4 py-3 font-karla text-gray-900">{{ property.address }}</td>
              <td class="px-4 py-3 font-karla text-gray-600">{{ property.postcode || '—' }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="property.listingType === 'sold' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
                >{{ property.listingType === 'sold' ? 'Sold' : 'Rental' }}</span>
              </td>
              <td class="px-4 py-3 font-karla text-gray-600 font-mono text-xs">{{ property.trackingCode || '—' }}</td>
              <td class="px-4 py-3 font-karla text-gray-500 text-xs">{{ formatPropertyDate(property) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div v-if="filteredProperties.length > 0" class="md:hidden divide-y divide-gray-100">
        <div v-for="property in paginatedProperties" :key="property.id" class="p-4">
          <p class="font-karla font-medium text-gray-900 text-sm">{{ property.address }}</p>
          <div class="flex items-center gap-2 mt-1.5">
            <span class="text-xs text-gray-500 font-karla">{{ property.postcode || '—' }}</span>
            <span
              class="px-2 py-0.5 text-xs font-medium rounded"
              :class="property.listingType === 'sold' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
            >{{ property.listingType === 'sold' ? 'Sold' : 'Rental' }}</span>
          </div>
          <div class="flex items-center justify-between mt-1.5">
            <span class="text-xs text-gray-400 font-karla">{{ formatPropertyDate(property) }}</span>
            <span v-if="property.trackingCode" class="text-xs font-mono text-gray-500">{{ property.trackingCode }}</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <p class="text-xs text-gray-500 font-karla">
          Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredProperties.length) }} of {{ filteredProperties.length }}
        </p>
        <div class="flex items-center gap-1">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >Prev</button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >Next</button>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'

interface Property {
  id: number
  address: string
  postcode: string | null
  listingType: 'sold' | 'rent'
  trackingCode: string | null
  dateSold: string | null
  dateListed: string | null
  createdAt: string | null
}

interface Campaign {
  id: number
  name: string
  postcodes: string[]
  propertyCount: number
  syncStatus: string | null
  postedAt: string | null
}

const props = defineProps<{
  campaign: Campaign
  properties: Property[]
}>()

const searchQuery = ref('')
const sortKey = ref('address')
const sortDir = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pageSize = 25

const columns = [
  { key: 'address', label: 'Address', sortable: true },
  { key: 'postcode', label: 'Postcode', sortable: true },
  { key: 'listingType', label: 'Type', sortable: true },
  { key: 'trackingCode', label: 'Tracking Code', sortable: false },
  { key: 'date', label: 'Date', sortable: true },
]

const filteredProperties = computed(() => {
  let result = [...props.properties]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p) => p.address.toLowerCase().includes(q))
  }

  result.sort((a, b) => {
    let aVal: string, bVal: string
    if (sortKey.value === 'date') {
      aVal = a.dateSold || a.dateListed || a.createdAt || ''
      bVal = b.dateSold || b.dateListed || b.createdAt || ''
    } else {
      aVal = String((a as any)[sortKey.value] || '')
      bVal = String((b as any)[sortKey.value] || '')
    }
    const cmp = aVal.localeCompare(bVal)
    return sortDir.value === 'asc' ? cmp : -cmp
  })

  return result
})

const totalPages = computed(() => Math.ceil(filteredProperties.value.length / pageSize))

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProperties.value.slice(start, start + pageSize)
})

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  currentPage.value = 1
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPropertyDate(property: Property): string {
  if (property.dateSold) return `Sold ${formatDate(property.dateSold)}`
  if (property.dateListed) return `Listed ${formatDate(property.dateListed)}`
  return formatDate(property.createdAt)
}
</script>
