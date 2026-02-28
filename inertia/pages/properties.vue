<template>
  <SidebarLayout pageTitle="Properties" pageSubtitle="Manage and track property visits">
    <!-- Tab Navigation -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            @click="activeTab = 'to-visit'"
            :class="[
              activeTab === 'to-visit'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            To Visit
            <span
              :class="[
                activeTab === 'to-visit' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600',
                'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
              ]"
            >
              {{ toVisitCount }}
            </span>
          </button>
          <button
            @click="activeTab = 'history'"
            :class="[
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            Visited
            <span
              :class="[
                activeTab === 'history' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600',
                'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
              ]"
            >
              {{ historyCount }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <!-- Sync Information -->
        <div v-if="lastSyncDate" class="space-y-1">
          <div class="flex items-center gap-2">
            <p class="text-xs md:text-sm text-gray-600">
              Last synced: {{ formatLastSync(lastSyncDate) }}
              <span v-if="syncStatus === 'success'" class="text-green-600 font-medium"
                >(success)</span
              >
              <span v-else-if="syncStatus === 'failed'" class="text-red-600 font-medium"
                >(failed)</span
              >
            </p>
          </div>
          <p v-if="liveSyncError && (liveSyncStatus === 'failed' || syncStatus === 'failed')" class="text-xs text-red-600 mt-1">
            {{ liveSyncError }}
          </p>
          <div v-if="liveSyncStatus === 'syncing'" class="flex items-center gap-2 text-blue-700">
            <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-xs md:text-sm font-medium">Syncing properties...</span>
          </div>
          <p v-else class="text-xs md:text-sm text-gray-500">Properties sync automatically when you log in</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
        <Button
          v-if="filteredProperties.length > 0"
          @click="exportFilteredProperties"
          class="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-sm md:text-base rounded-lg"
        >
          Export ({{ filteredProperties.length }})
        </Button>
        <Button
          v-if="selectedProperties.length > 0"
          @click="planRoute"
          class="flex-1 md:flex-none bg-primary hover:bg-blue-700 text-sm md:text-base rounded-lg"
        >
          Plan Route ({{ selectedProperties.length }})
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-3 md:gap-6 w-full">
        <Button
          @click="viewMode = 'list'"
          variant="ghost"
          :class="[
            'flex items-center gap-1 md:gap-2 text-sm md:text-base',
            viewMode === 'list' ? 'text-primary font-semibold' : 'text-gray-600',
          ]"
        >
          <Icon name="list" />
          <span>List view</span>
        </Button>
        <Button
          @click="viewMode = 'map'"
          variant="ghost"
          :class="[
            'flex items-center gap-1 md:gap-2 text-sm md:text-base',
            viewMode === 'map' ? 'text-primary font-semibold' : 'text-gray-600',
          ]"
        >
          <Icon name="map-pin" />
          <span>Map view</span>
        </Button>
        <Button
          v-if="filteredProperties.length > 0"
          @click="toggleSelectAll"
          variant="ghost"
          class="flex items-center gap-1 md:gap-2 text-gray-600 text-sm md:text-base"
        >
          <span>{{ allSelected ? 'Clear All' : 'Select All' }}</span>
        </Button>
        <!-- Mobile: force filters to next row -->
        <div class="w-full md:hidden" aria-hidden="true"></div>
        <!-- Street Group filter - shown in both tabs -->
        <select
          v-model="streetGroupFilter"
          class="flex-1 min-w-0 md:flex-none md:w-auto text-xs md:text-sm border-2 border-[#9CA3AF] py-2 md:py-[9px] px-2 md:px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        >
          <option value="all">Street Group: All</option>
          <option v-for="group in filteredStreetGroups" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
        </select>
        <!-- Visitor filter - shown in both tabs -->
        <select
          v-model="visitorFilter"
          class="flex-1 min-w-0 md:flex-none md:w-auto text-xs md:text-sm border-2 border-[#9CA3AF] py-2 md:py-[9px] px-2 md:px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        >
          <option value="all">Visitor: All</option>
          <option v-for="visitor in filteredVisitors" :key="visitor.id" :value="visitor.id">
            {{ visitor.name }}
          </option>
        </select>
        <!-- Listing Type filter - shown in both tabs -->
        <select
          v-model="listingTypeFilter"
          class="flex-1 min-w-0 md:flex-none md:w-auto text-xs md:text-sm border-2 border-[#9CA3AF] py-2 md:py-[9px] px-2 md:px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        >
          <option value="all">Type: All</option>
          <option value="sold">Type: Sold</option>
          <option value="rent">Type: Rented</option>
        </select>
        <!-- Time Frame filter - only shown in Visited tab -->
        <select
          v-if="activeTab === 'history'"
          v-model="timeFrameFilter"
          class="flex-1 min-w-0 md:flex-none md:w-auto text-xs md:text-sm border-2 border-[#9CA3AF] py-2 md:py-[9px] px-2 md:px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        >
          <option value="all">Date Range: All</option>
          <option value="day">Date Range: Last Day</option>
          <option value="week">Date Range: Last Week</option>
          <option value="month">Date Range: Last Month</option>
          <option value="2026">Calendar Year: 2026</option>
          <option value="2025">Calendar Year: 2025</option>
        </select>
      </div>
      <div
        class="grid grid-cols-[max-content_1fr] border-2 border-[#9CA3AF] py-2 md:py-[9px] px-3 gap-x-2 rounded-lg w-full bg-white"
      >
        <div class="flex items-center justify-center">
          <Icon name="search" />
        </div>
        <input
          class="px-2 md:px-3 text-sm md:text-base focus:border-none focus:outline-none w-full"
          type="text"
          placeholder="Search address"
          v-model="searchQuery"
        />
      </div>
      <hr class="w-full border-t border-gray-200" />
    </div>

    <div>
      <!-- List View -->
      <section v-if="viewMode === 'list'" class="mt-8 flow-root">
        <!-- Desktop: Table -->
        <div class="hidden md:block overflow-hidden border-2 border-black/5 sm:rounded-lg bg-white">
          <Table>
            <TableHeader class="bg-gray-50 uppercase">
              <TableRow>
                <TableHead scope="col" class="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    :checked="allSelected"
                    @change="toggleSelectAll"
                  />
                </TableHead>
                <TableHead
                  scope="col"
                  class="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 cursor-pointer hover:bg-gray-100"
                  @click="handleSort('address')"
                >
                  Address
                </TableHead>
                <TableHead
                  scope="col"
                  class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:bg-gray-100"
                  @click="handleSort('feedbackStatus')"
                >
                  Visit Status
                </TableHead>
                <TableHead
                  scope="col"
                  class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  Visit Outcome
                </TableHead>
                <TableHead
                  scope="col"
                  class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:bg-gray-100"
                  @click="handleSort('visitor')"
                >
                  Visitor
                </TableHead>
                <TableHead
                  scope="col"
                  class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:bg-gray-100"
                  @click="handleSort('date_of_visit')"
                >
                  Date of Visit
                </TableHead>
                <TableHead
                  scope="col"
                  class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  Type
                </TableHead>
                <TableHead
                  scope="col"
                  class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:bg-gray-100"
                  @click="handleSort('date_sold')"
                >
                  Date Added
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody class="divide-y divide-gray-200 bg-white">
              <TableRow
                v-for="property in paginatedProperties"
                :key="property.uid"
                :class="{ 'bg-blue-50': property.id && selectedProperties.includes(property.id) }"
              >
                <TableCell class="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    v-if="property.id"
                    type="checkbox"
                    class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    :checked="selectedProperties.includes(property.id)"
                    @change="toggleProperty(property.id)"
                  />
                </TableCell>
                <PropertyRow :property="property" />
              </TableRow>
            </TableBody>
          </Table>

          <Pagination
            :current-page="currentPage"
            :total-items="filteredProperties.length"
            :items-per-page="itemsPerPage"
            @page-change="handlePageChange"
          />
        </div>

        <!-- Mobile: Cards -->
        <div class="md:hidden space-y-3">
          <PropertyCard
            v-for="property in paginatedProperties"
            :key="property.uid"
            :property="property"
            :is-selected="!!(property.id && selectedProperties.includes(property.id))"
            @toggle-select="toggleProperty"
          />

          <div v-if="paginatedProperties.length === 0" class="text-center py-8 text-sm text-gray-500">
            No properties found
          </div>

          <Pagination
            :current-page="currentPage"
            :total-items="filteredProperties.length"
            :items-per-page="itemsPerPage"
            @page-change="handlePageChange"
          />
        </div>
      </section>

      <!-- Map View -->
      <section v-if="viewMode === 'map'" class="mt-8 flow-root">
        <div class="border-2 border-black/5 sm:rounded-lg bg-white min-h-[600px] p-6">
          <div ref="mapContainer" class="w-full h-[600px] rounded-lg"></div>
        </div>
      </section>
    </div>

    <!-- Route Planning Modal -->
    <RoutePlannerModal v-if="showRouteModal" :route="routeResult" @close="closeRouteModal" />
  </SidebarLayout>
</template>
<script setup lang="ts">
import type { Property } from '~/app/types/property'
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import L from 'leaflet'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import Icon from '~/app/components/icon.vue'
import Pagination from '~/app/components/dashboard/pagination.vue'
import PropertyRow from '~/app/components/dashboard/property-row.vue'
import PropertyCard from '~/app/components/dashboard/property-card.vue'
import RoutePlannerModal from '~/app/components/routes/route-planner-modal.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/app/components/ui/table'
import { Button } from '~/components/ui/button'
import { useSyncStatus } from '~/app/composables/useSyncStatus'
import { normalizeStreetName } from '~/app/utils/street-name'

const { status: liveSyncStatus, errorMessage: liveSyncError } = useSyncStatus({
  onSyncComplete: () => {
    // Reload properties data when sync completes
    router.reload({ only: ['properties', 'lastSyncDate', 'syncStatus'] })
  },
})

const props = defineProps<{
  properties: Property[]
  lastSyncDate: string | null
  syncStatus?: 'success' | 'failed' | null
  nextSyncTime?: string | null
}>()

const searchQuery = ref('')

// Tab state
type TabType = 'to-visit' | 'history'
const activeTab = ref<TabType>('to-visit')

type ListingTypeFilter = 'all' | 'sold' | 'rent'
type TimeFrameFilter = 'all' | 'day' | 'week' | 'month' | '2026' | '2025'

const streetGroupFilter = ref<number | 'all'>('all')
const visitorFilter = ref<number | 'all'>('all')
const listingTypeFilter = ref<ListingTypeFilter>('all')
const timeFrameFilter = ref<TimeFrameFilter>('all')

// Computed counts for tabs
const toVisitCount = computed(() => {
  return props.properties.filter((p) => !p.visited).length
})

const historyCount = computed(() => {
  return props.properties.filter((p) => p.visited).length
})
const streetGroups = ref<
  Array<{
    id: number
    name: string
    description?: string
    streetAssignments: Array<{ id: number; streetName: string }>
    visitors?: Array<{ id: number; name: string }>
  }>
>([])
const visitors = ref<Array<{ id: number; name: string }>>([])

// All street groups (territories hidden from users)
const filteredStreetGroups = computed(() => {
  return streetGroups.value
})

// Show all visitors regardless of street group selection
const filteredVisitors = computed(() => {
  return visitors.value
})

// View mode state
const viewMode = ref<'list' | 'map'>('list')

// Sorting state
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 10

// Handle sorting
const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    // Toggle direction if clicking the same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Set new column and default to ascending
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  // Reset to first page when sorting
  currentPage.value = 1
}

// Filter and sort properties based on search query and sort settings
const filteredProperties = computed(() => {
  let filtered = props.properties

  // Filter by active tab (To Visit = unvisited, Visited = visited)
  if (activeTab.value === 'to-visit') {
    filtered = filtered.filter((property) => property.visited === false)
  } else {
    filtered = filtered.filter((property) => property.visited === true)
  }

  // Apply street group filter
  if (streetGroupFilter.value !== 'all') {
    const filterIdNum = Number(streetGroupFilter.value)
    const selectedGroup = streetGroups.value.find((g) => g.id === filterIdNum)
    if (
      selectedGroup &&
      selectedGroup.streetAssignments &&
      selectedGroup.streetAssignments.length > 0
    ) {
      const normalizedStreetNames = selectedGroup.streetAssignments.map((a) => normalizeStreetName(a.streetName))
      filtered = filtered.filter(
        (property) => property.streetName && normalizedStreetNames.includes(normalizeStreetName(property.streetName))
      )
    }
  }

  // Apply visitor filter
  if (visitorFilter.value !== 'all') {
    const visitorIdNum = Number(visitorFilter.value)
    const selectedVisitor = visitors.value.find((v) => v.id === visitorIdNum)
    if (selectedVisitor) {
      filtered = filtered.filter(
        (property) => property.visitor && property.visitor.toLowerCase().includes(selectedVisitor.name.toLowerCase())
      )
    }
  }

  // Apply listing type filter
  if (listingTypeFilter.value !== 'all') {
    filtered = filtered.filter(
      (property) => property.listing_type === listingTypeFilter.value
    )
  }

  // Apply time frame filter
  if (timeFrameFilter.value !== 'all') {
    const now = new Date()
    let startDate: Date
    let endDate: Date | null = null

    switch (timeFrameFilter.value) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '2026':
        startDate = new Date('2026-01-01')
        endDate = new Date('2026-12-31T23:59:59')
        break
      case '2025':
        startDate = new Date('2025-01-01')
        endDate = new Date('2025-12-31T23:59:59')
        break
      default:
        startDate = new Date(0)
    }

    filtered = filtered.filter((property) => {
      // Use date_sold for sold properties, date_delisted for rentals
      const propertyDate = property.date_sold || property.date_delisted
      if (!propertyDate) return false
      const date = new Date(propertyDate)
      if (endDate) {
        return date >= startDate && date <= endDate
      }
      return date >= startDate
    })
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((property) => property.address.toLowerCase().includes(query))
  }

  // Apply sorting
  if (sortColumn.value) {
    filtered = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortColumn.value) {
        case 'address':
          aValue = a.address.toLowerCase()
          bValue = b.address.toLowerCase()
          break
        case 'feedbackStatus':
          aValue = (a.feedbackStatus || 'pending').toLowerCase()
          bValue = (b.feedbackStatus || 'pending').toLowerCase()
          break
        case 'date_of_visit':
          aValue = a.date_of_visit ? new Date(a.date_of_visit).getTime() : 0
          bValue = b.date_of_visit ? new Date(b.date_of_visit).getTime() : 0
          break
        case 'date_sold':
          // Handle null values - put them at the end
          if (!a.date_sold && !b.date_sold) return 0
          if (!a.date_sold) return 1
          if (!b.date_sold) return -1
          aValue = new Date(a.date_sold).getTime()
          bValue = new Date(b.date_sold).getTime()
          break
        case 'visitor':
          aValue = a.visitor?.toLowerCase() ?? ''
          bValue = b.visitor?.toLowerCase() ?? ''
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortDirection.value === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection.value === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  return filtered
})

// Watch for search query changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})

watch(activeTab, () => {
  currentPage.value = 1
})

watch(streetGroupFilter, () => {
  currentPage.value = 1
})

watch(listingTypeFilter, () => {
  currentPage.value = 1
})

watch(timeFrameFilter, () => {
  currentPage.value = 1
})

// Computed properties for pagination
const paginatedProperties = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredProperties.value.slice(startIndex, endIndex)
})

// Handle page changes
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Property selection for route planning
const selectedProperties = ref<number[]>([])

const toggleProperty = (propertyId: number | undefined) => {
  if (!propertyId) return
  const index = selectedProperties.value.indexOf(propertyId)
  if (index > -1) {
    selectedProperties.value.splice(index, 1)
  } else {
    selectedProperties.value.push(propertyId)
  }
}

const allSelected = computed(() => {
  return (
    paginatedProperties.value.length > 0 &&
    paginatedProperties.value.every((p) => p.id && selectedProperties.value.includes(p.id))
  )
})

const toggleSelectAll = () => {
  if (allSelected.value) {
    // Unselect all properties on current page
    paginatedProperties.value.forEach((p) => {
      const index = selectedProperties.value.indexOf(p.id)
      if (index > -1) {
        selectedProperties.value.splice(index, 1)
      }
    })
  } else {
    // Select all properties on current page
    paginatedProperties.value.forEach((p) => {
      if (!selectedProperties.value.includes(p.id)) {
        selectedProperties.value.push(p.id)
      }
    })
  }
}

// Route planning
const showRouteModal = ref(false)
const routeResult = ref<any>(null)
const routeLoading = ref(false)
const routeError = ref('')

const planRoute = async () => {
  if (selectedProperties.value.length === 0) {
    return
  }

  routeLoading.value = true
  routeError.value = ''

  try {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    const response = await fetch('/api/routes/plan', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({
        propertyIds: selectedProperties.value,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to plan route' }))
      throw new Error(errorData.error || 'Failed to plan route')
    }

    const data = await response.json()
    routeResult.value = data.route
    showRouteModal.value = true
  } catch (error) {
    console.error('Error planning route:', error)
    routeError.value = error instanceof Error ? error.message : 'Failed to plan route'
    alert(routeError.value)
  } finally {
    routeLoading.value = false
  }
}

const closeRouteModal = () => {
  showRouteModal.value = false
  routeResult.value = null
}

// Welcome Pack Generation
const generateWelcomePack = async (propertyId: number, format: 'html' | 'pdf' = 'html') => {
  try {
    const endpoint =
      format === 'pdf'
        ? `/api/welcome-pack/generate-pdf/${propertyId}`
        : `/api/welcome-pack/generate/${propertyId}`

    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || 'Failed to generate welcome pack')
    }

    // For HTML, open in new window instead of downloading
    if (format === 'html') {
      const htmlText = await response.text()
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(htmlText)
        newWindow.document.close()
      } else {
        alert('Please allow pop-ups to view the welcome pack HTML')
      }
    } else {
      // For PDF, download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `welcome-pack-${propertyId}.pdf`
      document.body.appendChild(a)
      a.click()

      // Clean up after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      alert('Welcome pack PDF downloaded successfully!')
    }
  } catch (error) {
    console.error('Error generating welcome pack:', error)
    alert(
      `Failed to generate welcome pack: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Map setup
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markers: L.Marker[] = []

// Initialize map
const initializeMap = async () => {
  if (!mapContainer.value || map) return

  await nextTick()

  // Small delay to ensure container is fully rendered
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (!mapContainer.value) return

  // Create map
  map = L.map(mapContainer.value, {
    center: [-37.8136, 144.9631], // Default to Melbourne, Australia
    zoom: 10,
  })

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  // Invalidate size to ensure proper rendering
  setTimeout(() => {
    if (map) {
      map.invalidateSize()
    }
  }, 200)

  // Plot properties (will handle empty case)
  plotProperties()
}

// Get marker color based on feedback status (matching property-row.vue colors)
const getMarkerColor = (status: string | undefined): string => {
  const statusValue = status || 'pending'
  switch (statusValue) {
    case 'Delivered':
      return '#10b981' // green-500
    case 'Rejected':
      return '#ef4444' // red-500
    case 'No Answer':
      return '#eab308' // yellow-500
    case 'Follow Up: Church Questions':
    case 'Follow Up: Community Questions':
      return '#3b82f6' // blue-500
    case 'visited':
      return '#10b981' // green-500
    case 'pending':
    default:
      return '#6b7280' // gray-500
  }
}

// Plot properties on map
const plotProperties = () => {
  if (!map) return

  // Clear existing markers
  markers.forEach((marker) => marker.remove())
  markers = []

  // Filter properties with valid coordinates
  const propertiesWithCoords = filteredProperties.value.filter(
    (property) => property.latitude !== null && property.longitude !== null
  )

  if (propertiesWithCoords.length === 0) return

  // Create bounds to fit all markers
  const bounds: [number, number][] = []

  // Add markers for each property
  propertiesWithCoords.forEach((property) => {
    const lat = property.latitude!
    const lng = property.longitude!

    // Get color based on feedback status
    const markerColor = getMarkerColor(property.feedbackStatus)

    // Create custom icon
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${markerColor};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    const marker = L.marker([lat, lng], { icon })
      .addTo(map!)
      .bindPopup(
        `<div style="min-width: 200px;">
          <strong>${property.address}</strong><br/>
          <small>Status: ${property.feedbackStatus}</small><br/>
          ${property.date_sold ? `<small>Sold: ${new Date(property.date_sold).toLocaleDateString('en-GB')}</small> <br/>` : ''}
          ${property.visitor ? `<small>Visitor: ${property.visitor}</small>` : ''}
        </div>`
      )

    markers.push(marker)
    bounds.push([lat, lng])
  })

  // Fit map to show all markers
  if (bounds.length > 0) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] })
  }
}

// Watch for view mode changes
watch(viewMode, async (newMode) => {
  if (newMode === 'map') {
    await nextTick()
    await initializeMap()
  } else {
    // Clean up map when switching away
    if (map) {
      map.remove()
      map = null
      markers = []
    }
  }
})

// Watch for filtered properties changes to update markers
watch(filteredProperties, () => {
  if (viewMode.value === 'map') {
    if (map) {
      // Update markers (will clear if no properties)
      plotProperties()
    } else if (mapContainer.value) {
      // Initialize map if it doesn't exist but container is available
      initializeMap()
    }
  }
})

// Initialize map on mount if map view is active
onMounted(async () => {
  // Read initial filter values from URL query parameters
  const urlParams = new URLSearchParams(window.location.search)
  const typeParam = urlParams.get('type')
  const visitedParam = urlParams.get('visited')

  // Set listing type filter from URL
  if (typeParam === 'sold' || typeParam === 'rent') {
    listingTypeFilter.value = typeParam
  }

  // Set active tab from URL (visited = history tab, not-visited = to-visit tab)
  if (visitedParam === 'visited') {
    activeTab.value = 'history'
  } else if (visitedParam === 'not-visited') {
    activeTab.value = 'to-visit'
  }

  // Fetch street groups for filter
  try {
    // Fetch street groups for filter (cache-busting to prevent stale data)
    const streetGroupsResponse = await axios.get('/api/street-groups', {
      headers: { 'Cache-Control': 'no-cache' },
    })
    streetGroups.value = streetGroupsResponse.data

    // Fetch visitors for filter
    const visitorsResponse = await axios.get('/api/visitors')
    visitors.value = visitorsResponse.data
  } catch (error) {
    console.error('Failed to fetch street groups or visitors:', error)
  }

  if (viewMode.value === 'map') {
    await nextTick()
    await initializeMap()
  }
})

// Update property status
async function updatePropertyStatus(propertyId: number, feedbackStatus: string) {
  try {
    const response = await fetch(`/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedbackStatus }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update feedback status')
    }

    // Reload properties to reflect change
    router.reload({ only: ['properties'] })
  } catch (error) {
    console.error('Error updating feedback status:', error)
  }
}

// Clean up on unmount
onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
    markers = []
  }
})

// Format last sync date
function formatLastSync(dateString: string): string {
  const date = new Date(dateString)
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

// Export filtered properties
async function exportFilteredProperties() {
  try {
    const propertyIds = filteredProperties.value.map((p) => p.id)

    const response = await axios.post(
      '/api/export/property-list',
      {
        propertyIds,
      },
      {
        responseType: 'blob',
      }
    )

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `properties-${timestamp}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error: any) {
    console.error('Failed to export properties:', error)
    alert(error.response?.data?.message || 'Failed to export properties. Please try again.')
  }
}

// Manual sync state
const isSyncing = ref(false)

// Format next sync time
function formatNextSync(): string {
  if (props.nextSyncTime) {
    const nextSync = new Date(props.nextSyncTime)
    const now = new Date()
    const diffInHours = (nextSync.getTime() - now.getTime()) / (1000 * 60 * 60)

    // If next sync is today
    if (diffInHours > 0 && diffInHours < 24) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)

      // Check if it's tomorrow
      if (nextSync.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${nextSync.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })}`
      } else {
        return `Today at ${nextSync.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })}`
      }
    } else if (diffInHours >= 24 && diffInHours < 48) {
      return `Tomorrow at ${nextSync.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })}`
    } else {
      return nextSync.toLocaleString('en-AU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    }
  }

  // Default to tomorrow at 2:00 AM if no nextSyncTime provided
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(2, 0, 0, 0)
  return `Tomorrow at ${tomorrow.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })}`
}

// Trigger manual sync
async function triggerManualSync() {
  if (isSyncing.value) return

  isSyncing.value = true

  try {
    await axios.post(
      '/api/properties/sync',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    // Show success message
    alert('Sync completed successfully!')

    // Reload the page to show updated properties
    router.reload()
  } catch (error: any) {
    console.error('Failed to sync properties:', error)
    alert(error.response?.data?.message || 'Failed to sync properties. Please try again.')
  } finally {
    isSyncing.value = false
  }
}
</script>
