<template>
  <SidebarLayout pageTitle="Analytics" pageSubtitle="View property statistics and visitor performance">
    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-4 mb-8">
      <div class="flex items-center gap-2">
        <label class="font-karla text-sm text-gray-600">Filter by:</label>
        <select
          v-model="selectedYear"
          @change="fetchAnalytics"
          class="text-sm border-2 border-gray-300 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Years</option>
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
        <select
          v-model="selectedMonth"
          @change="fetchAnalytics"
          :disabled="selectedYear === 'all'"
          class="text-sm border-2 border-gray-300 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="all">All Months</option>
          <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
        </select>
      </div>
      <div v-if="isLoading" class="flex items-center gap-2 text-blue-600">
        <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm">Loading...</span>
      </div>
    </div>

    <!-- Stats Cards Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Properties Card -->
      <a
        href="/properties"
        class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer block"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Total Properties</h3>
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ analyticsData?.propertyStats.totalProperties ?? 0 }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">{{ filterDescription }}</p>
        <p class="font-karla text-xs text-blue-600 mt-2">View all properties &rarr;</p>
      </a>

      <!-- Sold Properties Card -->
      <a
        href="/properties?type=sold"
        class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer block"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Sold Properties</h3>
          <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ analyticsData?.propertyStats.soldProperties ?? 0 }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Properties sold</p>
        <p class="font-karla text-xs text-emerald-600 mt-2">View sold properties &rarr;</p>
      </a>

      <!-- Rented Properties Card -->
      <a
        href="/properties?type=rent"
        class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer block"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Rented Properties</h3>
          <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ analyticsData?.propertyStats.rentedProperties ?? 0 }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Properties rented</p>
        <p class="font-karla text-xs text-purple-600 mt-2">View rented properties &rarr;</p>
      </a>

      <!-- Visited Properties Card -->
      <a
        href="/properties?visited=visited"
        class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer block"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Visited Properties</h3>
          <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ analyticsData?.propertyStats.visitedProperties ?? 0 }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Completed visits</p>
        <p class="font-karla text-xs text-green-600 mt-2">View visited properties &rarr;</p>
      </a>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Outcomes Chart -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Visit Outcomes</h3>
        <div v-if="analyticsData" class="h-64">
          <OutcomesChart :data="analyticsData.outcomeStats" />
        </div>
        <div v-else class="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>

      <!-- Property Type Chart -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Property Types</h3>
        <div v-if="analyticsData && analyticsData.propertyStats.totalProperties > 0" class="h-64">
          <PropertyTypeChart
            :sold="analyticsData.propertyStats.soldProperties"
            :rented="analyticsData.propertyStats.rentedProperties"
          />
        </div>
        <div v-else class="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    </div>

    <!-- Visitor Performance Table -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Visitor Performance</h3>
      <div v-if="analyticsData && analyticsData.visitorOutcomes.length > 0">
        <VisitorOutcomesTable :visitors="analyticsData.visitorOutcomes" />
      </div>
      <div v-else class="py-8 text-center text-gray-400">
        No visitor data available
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import OutcomesChart from '~/app/components/analytics/OutcomesChart.vue'
import PropertyTypeChart from '~/app/components/analytics/PropertyTypeChart.vue'
import VisitorOutcomesTable from '~/app/components/analytics/VisitorOutcomesTable.vue'

interface OutcomeStats {
  welcomed: number
  packLeft: number
  reschedule: number
  notInterested: number
  notHome: number
  notVisited: number
}

interface VisitorOutcome {
  visitorName: string
  totalAssigned: number
  outcomes: OutcomeStats
}

interface PropertyStats {
  totalProperties: number
  soldProperties: number
  rentedProperties: number
  visitedProperties: number
}

interface AnalyticsData {
  propertyStats: PropertyStats
  outcomeStats: OutcomeStats
  visitorOutcomes: VisitorOutcome[]
  availableYears: number[]
  filter: {
    month?: number
    year?: number
  }
}

interface AnalyticsProps {
  analytics: AnalyticsData | null
  currentMonth: number
  currentYear: number
  error: string | null
}

const props = defineProps<AnalyticsProps>()

const analyticsData = ref<AnalyticsData | null>(props.analytics)
const error = ref<string | null>(props.error)
const isLoading = ref(false)

const selectedMonth = ref<string | number>('all')
const selectedYear = ref<string | number>('all')

const availableYears = computed(() => {
  return analyticsData.value?.availableYears ?? []
})

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

const filterDescription = computed(() => {
  if (selectedYear.value === 'all') {
    return 'All time'
  }
  if (selectedMonth.value === 'all') {
    return `Year ${selectedYear.value}`
  }
  const month = months.find((m) => m.value === selectedMonth.value)
  return `${month?.label ?? ''} ${selectedYear.value}`
})

const fetchAnalytics = async () => {
  isLoading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    if (selectedYear.value !== 'all') {
      params.append('year', String(selectedYear.value))
    }
    if (selectedMonth.value !== 'all' && selectedYear.value !== 'all') {
      params.append('month', String(selectedMonth.value))
    }

    // Reset month if year is "all"
    if (selectedYear.value === 'all') {
      selectedMonth.value = 'all'
    }

    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch(`/api/analytics/stats?${params.toString()}`, {
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to fetch analytics')
    }

    analyticsData.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch analytics'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Initial data is loaded by the server
})
</script>
