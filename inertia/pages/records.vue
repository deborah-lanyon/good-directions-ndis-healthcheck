<template>
  <SidebarLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-tertiary font-caprasimo text-[30px] leading-[150%]">All Records</h2>
        <button
          @click="exportCsv"
          class="px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-gray-900">{{ totalCount }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Total Records</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-emerald-600">{{ stats.sold }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Sold</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-purple-600">{{ stats.rent }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Rented</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-green-600">{{ stats.visited }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Visited</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-col sm:flex-row flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by address, street, visitor, or postcode..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>
        <div class="sm:w-40">
          <Select v-model="typeFilter" @update:modelValue="applyFilters">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="sm:w-40">
          <Select v-model="statusFilter" @update:modelValue="applyFilters">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="Visited">Visited</SelectItem>
              <SelectItem value="Not Visited">Not Visited</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="sm:w-36">
          <select
            v-model="yearFilter"
            @change="onYearChange"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Years</option>
            <option v-for="y in availableYears" :key="y" :value="String(y)">{{ y }}</option>
          </select>
        </div>
        <div class="sm:w-40">
          <select
            v-model="monthFilter"
            @change="applyFilters"
            :disabled="yearFilter === 'all'"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Months</option>
            <option v-for="m in months" :key="m.value" :value="String(m.value)">{{ m.label }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Records Table - Desktop -->
      <Card v-else class="hidden md:block">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Street</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Postcode</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in filteredRecords" :key="record.id" class="hover:bg-gray-50">
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ record.id }}</td>
                <td class="px-3 py-2 text-sm text-gray-900 max-w-[200px] truncate" :title="record.address">{{ record.address }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ record.streetName || '-' }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ record.postcode || '-' }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm">
                  <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', record.listingType === 'sold' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800']">
                    {{ record.listingType === 'sold' ? 'Sold' : 'Rent' }}
                  </span>
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ formatDate(record.createdAt) }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm">
                  <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(record.feedbackStatus)]">
                    {{ record.feedbackStatus || 'pending' }}
                  </span>
                </td>
                <td class="px-3 py-2 text-sm text-gray-500 max-w-[150px] truncate" :title="record.visitOutcome">{{ record.visitOutcome || '-' }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ record.visitor || '-' }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ formatDate(record.dateOfVisit) }}</td>
                <td class="px-3 py-2 text-sm text-gray-500 max-w-[150px] truncate" :title="record.visitNotes">{{ record.visitNotes || '-' }}</td>
              </tr>
              <tr v-if="filteredRecords.length === 0">
                <td colspan="11" class="px-6 py-12 text-center text-gray-500">
                  No records found matching your filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div class="text-sm text-gray-500">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalRecords) }} of {{ totalRecords }} records
          </div>
          <div class="flex gap-2">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
            <span class="px-3 py-1 text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
          </div>
        </div>
      </Card>

      <!-- Records Cards - Mobile -->
      <div v-if="!isLoading" class="md:hidden space-y-3">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-gray-900 truncate">{{ record.address }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ record.streetName || '' }}{{ record.streetName && record.postcode ? ' · ' : '' }}{{ record.postcode || '' }}
              </p>
            </div>
            <span :class="['px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', record.listingType === 'sold' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800']">
              {{ record.listingType === 'sold' ? 'Sold' : 'Rent' }}
            </span>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(record.feedbackStatus)]">
              {{ record.feedbackStatus || 'pending' }}
            </span>
            <span v-if="record.visitOutcome" class="text-xs text-gray-500 truncate">{{ record.visitOutcome }}</span>
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
            <p v-if="record.visitor"><span class="font-medium text-gray-600">Visitor:</span> {{ record.visitor }}</p>
            <p><span class="font-medium text-gray-600">Added:</span> {{ formatDate(record.createdAt) }}</p>
            <p v-if="record.dateOfVisit"><span class="font-medium text-gray-600">Visited:</span> {{ formatDate(record.dateOfVisit) }}</p>
          </div>
          <p v-if="record.visitNotes" class="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded line-clamp-2">{{ record.visitNotes }}</p>
        </div>

        <div v-if="filteredRecords.length === 0" class="text-center py-8 text-sm text-gray-500">
          No records found matching your filters.
        </div>

        <!-- Mobile Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between py-3">
          <div class="text-xs text-gray-500">
            {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalRecords) }} of {{ totalRecords }}
          </div>
          <div class="flex gap-2">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Prev</button>
            <span class="px-2 py-1 text-xs text-gray-600">{{ currentPage }}/{{ totalPages }}</span>
            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import { Card, CardContent } from '~/app/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/app/components/ui/select'

interface PropertyRecord {
  id: number
  address: string
  streetName: string | null
  streetNumber: number | null
  postcode: string | null
  listingType: 'sold' | 'rent'
  dateSold: string | null
  dateListed: string | null
  dateDelisted: string | null
  feedbackStatus: string
  visitOutcome: string | null
  visitor: string | null
  dateOfVisit: string | null
  visitNotes: string | null
  distanceFromChurch: number | null
  createdAt: string | null
  updatedAt: string | null
}

interface Props {
  properties: PropertyRecord[]
  totalCount: number
  availableYears: number[]
  error?: string | null
}

const props = defineProps<Props>()

const records = ref<PropertyRecord[]>(props.properties)
const isLoading = ref(false)
const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const yearFilter = ref('all')
const monthFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(100)
const totalRecords = ref(props.totalCount)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))
const availableYears = props.availableYears

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const onYearChange = () => {
  if (yearFilter.value === 'all') {
    monthFilter.value = 'all'
  }
  applyFilters()
}

const stats = computed(() => {
  const allRecords = records.value
  return {
    sold: allRecords.filter((r) => r.listingType === 'sold').length,
    rent: allRecords.filter((r) => r.listingType === 'rent').length,
    visited: allRecords.filter((r) => r.feedbackStatus === 'Visited').length,
  }
})

const totalCount = computed(() => totalRecords.value)

const filteredRecords = computed(() => {
  let filtered = records.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.address.toLowerCase().includes(query) ||
        (r.streetName && r.streetName.toLowerCase().includes(query)) ||
        (r.visitor && r.visitor.toLowerCase().includes(query)) ||
        (r.postcode && r.postcode.toLowerCase().includes(query))
    )
  }

  return filtered
})

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Visited':
      return 'bg-green-100 text-green-800'
    case 'Not Visited':
      return 'bg-gray-100 text-gray-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

let searchTimeout: number | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    applyFilters()
  }, 300)
}

const applyFilters = async () => {
  isLoading.value = true
  currentPage.value = 1

  try {
    const params = new URLSearchParams()
    if (typeFilter.value !== 'all') params.append('listingType', typeFilter.value)
    if (statusFilter.value !== 'all') params.append('feedbackStatus', statusFilter.value)
    if (yearFilter.value !== 'all') params.append('year', yearFilter.value)
    if (monthFilter.value !== 'all' && yearFilter.value !== 'all') params.append('month', monthFilter.value)
    if (searchQuery.value) params.append('search', searchQuery.value)
    params.append('page', String(currentPage.value))
    params.append('limit', String(pageSize.value))

    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch(`/api/records?${params.toString()}`, {
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      const data = await response.json()
      records.value = data.properties
      totalRecords.value = data.total
    }
  } catch (error) {
    console.error('Error fetching records:', error)
  } finally {
    isLoading.value = false
  }
}

const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await applyFilters()
}

const exportCsv = () => {
  const params = new URLSearchParams()
  if (typeFilter.value !== 'all') params.append('listingType', typeFilter.value)
  if (statusFilter.value !== 'all') params.append('feedbackStatus', statusFilter.value)
  if (yearFilter.value !== 'all') params.append('year', yearFilter.value)
  if (monthFilter.value !== 'all' && yearFilter.value !== 'all') params.append('month', monthFilter.value)

  window.location.href = `/api/records/export?${params.toString()}`
}
</script>
