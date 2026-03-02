<template>
  <AdminSidebarLayout page-title="Platform Analytics">

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

      <!-- Summary Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-gray-900">{{ analyticsData?.totalChurches ?? 0 }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Territories</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-blue-600">{{ analyticsData?.totalProperties ?? 0 }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Total Properties</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-green-600">{{ analyticsData?.totalVisited ?? 0 }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Properties Visited</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-purple-600">{{ visitRate }}%</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Visit Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Overall Outcomes Chart -->
        <Card>
          <CardContent class="pt-6 pb-6">
            <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Overall Visit Outcomes</h3>
            <div v-if="analyticsData" class="h-64">
              <OutcomesChart :data="analyticsData.overallOutcomes" />
            </div>
            <div v-else class="h-64 flex items-center justify-center text-gray-400">
              No data available
            </div>
          </CardContent>
        </Card>

        <!-- Outcome Summary -->
        <Card>
          <CardContent class="pt-6 pb-6">
            <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Outcome Breakdown</h3>
            <div v-if="analyticsData" class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-green-500"></span>
                  <span class="text-sm text-gray-700">Welcomed</span>
                </div>
                <span class="font-semibold">{{ analyticsData.overallOutcomes.welcomed }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span class="text-sm text-gray-700">Pack Left</span>
                </div>
                <span class="font-semibold">{{ analyticsData.overallOutcomes.packLeft }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span class="text-sm text-gray-700">Reschedule</span>
                </div>
                <span class="font-semibold">{{ analyticsData.overallOutcomes.reschedule }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-red-500"></span>
                  <span class="text-sm text-gray-700">Not Interested</span>
                </div>
                <span class="font-semibold">{{ analyticsData.overallOutcomes.notInterested }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span class="text-sm text-gray-700">Not Home</span>
                </div>
                <span class="font-semibold">{{ analyticsData.overallOutcomes.notHome }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-gray-400"></span>
                  <span class="text-sm text-gray-700">Not Visited</span>
                </div>
                <span class="font-semibold">{{ analyticsData.overallOutcomes.notVisited }}</span>
              </div>
            </div>
            <div v-else class="h-48 flex items-center justify-center text-gray-400">
              No data available
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Territory Analytics Table -->
      <Card>
        <CardContent class="pt-6 pb-6">
          <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Territory Statistics</h3>
          <div v-if="analyticsData && analyticsData.churchAnalytics.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Territory
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span class="inline-flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Sold
                    </span>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span class="inline-flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                      Rented
                    </span>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visited
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span class="inline-flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-green-500"></span>
                      Welcomed
                    </span>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit Rate
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="church in analyticsData.churchAnalytics" :key="church.churchId" class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div>
                      <span class="font-medium text-gray-900">{{ church.churchName }}</span>
                      <div class="text-xs text-gray-500">{{ church.ownerEmail }}</div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center font-semibold text-gray-900">
                    {{ church.totalProperties }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span v-if="church.soldProperties > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {{ church.soldProperties }}
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span v-if="church.rentedProperties > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {{ church.rentedProperties }}
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span v-if="church.visitedProperties > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ church.visitedProperties }}
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span v-if="church.pendingProperties > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ church.pendingProperties }}
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span v-if="church.outcomes.welcomed > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ church.outcomes.welcomed }}
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-green-500 h-2 rounded-full"
                          :style="{ width: `${getVisitRate(church)}%` }"
                        ></div>
                      </div>
                      <span class="text-xs text-gray-600">{{ getVisitRate(church) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-8 text-center text-gray-400">
            No church data available
          </div>
        </CardContent>
      </Card>
  </AdminSidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminSidebarLayout from '~/app/components/layouts/admin-sidebar-layout.vue'
import { Card, CardContent } from '~/app/components/ui/card'
import OutcomesChart from '~/app/components/analytics/OutcomesChart.vue'

interface OutcomeStats {
  welcomed: number
  packLeft: number
  reschedule: number
  notInterested: number
  notHome: number
  notVisited: number
}

interface ChurchAnalytics {
  churchId: number
  churchName: string
  ownerEmail: string
  totalProperties: number
  soldProperties: number
  rentedProperties: number
  visitedProperties: number
  pendingProperties: number
  outcomes: OutcomeStats
}

interface SuperAdminAnalyticsResponse {
  totalChurches: number
  totalProperties: number
  totalVisited: number
  overallOutcomes: OutcomeStats
  churchAnalytics: ChurchAnalytics[]
  availableYears: number[]
  filter: {
    month?: number
    year?: number
  }
}

interface AnalyticsProps {
  analytics: SuperAdminAnalyticsResponse | null
  error: string | null
}

const props = defineProps<AnalyticsProps>()

const analyticsData = ref<SuperAdminAnalyticsResponse | null>(props.analytics)
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

const visitRate = computed(() => {
  if (!analyticsData.value || analyticsData.value.totalProperties === 0) return 0
  return Math.round((analyticsData.value.totalVisited / analyticsData.value.totalProperties) * 100)
})

const getVisitRate = (church: ChurchAnalytics): number => {
  if (church.totalProperties === 0) return 0
  return Math.round((church.visitedProperties / church.totalProperties) * 100)
}

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

    const response = await fetch(`/api/admin/analytics/stats?${params.toString()}`, {
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
</script>
