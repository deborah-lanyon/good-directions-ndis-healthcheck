<template>
  <AdminSidebarLayout :page-title="church.churchName" :page-subtitle="churchSubtitle">
      <div class="mb-6">
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to All Churches</span>
        </button>

        <div class="flex justify-end">
          <div class="flex gap-2">
            <button
              v-if="properties.length > 0"
              @click="exportProperties"
              class="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Export ({{ properties.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-2xl font-bold text-gray-900">{{ properties.length }}</div>
          <div class="text-sm text-gray-600">Total Properties</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-2xl font-bold text-green-600">{{ visitedCount }}</div>
          <div class="text-sm text-gray-600">Visited</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</div>
          <div class="text-sm text-gray-600">Not Visited</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-2xl font-bold text-gray-600">{{ properties.length - visitedCount }}</div>
          <div class="text-sm text-gray-600">Not Visited</div>
        </div>
      </div>

      <!-- Properties List -->
      <div v-if="properties.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-gray-600">No properties found for this church.</p>
        <p class="text-sm text-gray-500 mt-2">Run a property sync to load data.</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Address
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date Sold
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Visitor
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="property in properties" :key="property.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ property.address }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(property.dateSold) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ property.visitor || 'Unassigned' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    property.visited
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800',
                  ]"
                >
                  {{ property.feedbackStatus || 'Pending' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  </AdminSidebarLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DateTime } from 'luxon'
import AdminSidebarLayout from '~/app/components/layouts/admin-sidebar-layout.vue'

interface Property {
  id: number
  address: string
  dateSold: string
  feedbackStatus: string
  visited: boolean
  visitor: string | null
}

interface Church {
  id: number
  churchName: string
  suburb: string | null
  postcode: string | null
}

const props = defineProps<{
  church: Church
  properties: Property[]
  lastSyncDate: string | null
}>()

const churchSubtitle = computed(() => {
  const parts = []
  if (props.church.suburb) parts.push(props.church.suburb)
  if (props.church.postcode) parts.push(props.church.postcode)
  return parts.join(', ')
})

const visitedCount = computed(() => props.properties.filter((p) => p.visited).length)
const pendingCount = computed(
  () => props.properties.filter((p) => p.feedbackStatus === 'pending').length
)

const formatDate = (dateString: string) => {
  const date = DateTime.fromISO(dateString)
  return date.isValid ? date.toFormat('MMM d, yyyy') : 'N/A'
}

const formatLastSync = (dateString: string) => {
  const date = DateTime.fromISO(dateString)
  if (!date.isValid) return 'Never'

  const now = DateTime.now()
  const diff = now.diff(date, ['days', 'hours']).toObject()

  if (diff.days! >= 1) {
    return `${Math.floor(diff.days!)} day${Math.floor(diff.days!) !== 1 ? 's' : ''} ago`
  } else if (diff.hours! >= 1) {
    return `${Math.floor(diff.hours!)} hour${Math.floor(diff.hours!) !== 1 ? 's' : ''} ago`
  } else {
    return 'Less than an hour ago'
  }
}

const goBack = () => {
  window.location.href = '/admin/churches'
}

const exportProperties = () => {
  const csvData = [
    ['Address', 'Date Sold', 'Visitor', 'Status', 'Visited'],
    ...props.properties.map((p) => [
      p.address,
      formatDate(p.dateSold),
      p.visitor || 'Unassigned',
      p.feedbackStatus || 'Pending',
      p.visited ? 'Yes' : 'No',
    ]),
  ]

  const csvContent = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${props.church.churchName.replace(/\s+/g, '_')}_properties.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
