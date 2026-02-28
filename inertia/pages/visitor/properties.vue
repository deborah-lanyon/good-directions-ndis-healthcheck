<script setup lang="ts">
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import { Card, CardContent } from '~/app/components/ui/card'
import Toast from '~/app/components/shared/toast.vue'
import VisitorSidebarLayout from '~/app/components/layouts/visitor-sidebar-layout.vue'

interface Visitor {
  id: number
  name: string
  email: string | null
  phone: string | null
  church?: {
    id: number
    churchName: string
  }
  streetGroups?: Array<{
    id: number
    name: string
  }>
}

interface Property {
  id: number
  address: string
  streetName: string | null
  postcode: string | null
  dateSold: string
  feedbackStatus: string
  dateOfVisit: string | null
  visitNotes: string | null
  visitOutcome: string | null
}

interface Pagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

const props = defineProps<{
  visitor: Visitor
  properties: Property[]
  pagination: Pagination
  filters: {
    search: string
    status: string
  }
}>()

const searchQuery = ref(props.filters.search)
const statusFilter = ref(props.filters.status)
const selectedProperty = ref<Property | null>(null)
const showUpdateModal = ref(false)
const updating = ref(false)

const toast = ref({ show: false, type: 'success' as 'success' | 'error', message: '' })

const updateForm = ref({
  feedbackStatus: '',
  dateOfVisit: '',
  visitNotes: '',
  visitOutcome: [] as string[],
})

const outcomeOptions = [
  { value: 'Welcomed', label: 'Welcomed' },
  { value: 'Pack left', label: 'Pack left' },
  { value: 'Reschedule', label: 'Reschedule' },
  { value: 'Not Interested', label: 'Not Interested' },
  { value: 'Not home', label: 'Not home' },
]

const routeLoading = ref(false)
const routeResult = ref<any>(null)
const showRouteModal = ref(false)

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
}

function applyFilters() {
  router.get(
    '/visitor/properties',
    {
      search: searchQuery.value,
      status: statusFilter.value,
    },
    {
      preserveState: true,
      preserveScroll: true,
    }
  )
}

function openUpdateModal(property: Property) {
  selectedProperty.value = property
  updateForm.value = {
    feedbackStatus: property.feedbackStatus || 'Not Visited',
    dateOfVisit: property.dateOfVisit || '',
    visitNotes: property.visitNotes || '',
    visitOutcome: property.visitOutcome ? property.visitOutcome.split(',').map(s => s.trim()) : [],
  }
  showUpdateModal.value = true
}

async function updateProperty() {
  if (!selectedProperty.value) return

  try {
    updating.value = true
    const payload = {
      ...updateForm.value,
      visitOutcome: updateForm.value.visitOutcome.join(','),
    }
    await axios.put(`/visitor/properties/${selectedProperty.value.id}`, payload)

    showUpdateModal.value = false
    selectedProperty.value = null
    showToast('success', 'Property updated successfully')

    // Reload page to show updated data
    router.reload()
  } catch (error: any) {
    console.error('Failed to update property:', error)
    showToast('error', error.response?.data?.message || 'Failed to update property')
  } finally {
    updating.value = false
  }
}

function getStatusColor(status: string) {
  const statusMap: Record<string, string> = {
    'pending': 'bg-orange-100 text-orange-800',
    'Not Visited': 'bg-orange-100 text-orange-800',
    'Visited': 'bg-green-100 text-green-800',
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800'
}

function getStatusDisplayName(status: string) {
  if (status === 'pending') return 'Not Visited'
  return status
}

function changePage(page: number) {
  router.get(
    '/visitor/properties',
    {
      search: searchQuery.value,
      status: statusFilter.value,
      page,
    },
    {
      preserveState: true,
      preserveScroll: false,
    }
  )
}

async function planRoute() {
  const pendingProperties = props.properties.filter(
    (p) => p.feedbackStatus === 'pending' || p.feedbackStatus === 'Not Visited'
  )

  if (pendingProperties.length === 0) {
    showToast('error', 'No unvisited properties to plan route for')
    return
  }

  routeLoading.value = true
  routeResult.value = null

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
        propertyIds: pendingProperties.map((p) => p.id),
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to plan route'
    showToast('error', errorMessage)
  } finally {
    routeLoading.value = false
  }
}

const printRoute = () => {
  window.print()
}
</script>

<template>
  <VisitorSidebarLayout pageTitle="My Properties" :pageSubtitle="visitor.church?.churchName || ''">
      <!-- Filters -->
      <Card class="mb-6">
        <CardContent class="p-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <input
                v-model="searchQuery"
                @keyup.enter="applyFilters"
                type="text"
                placeholder="Search by address, street, or postcode..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              v-model="statusFilter"
              @change="applyFilters"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="not-visited">Not Visited</option>
              <option value="visited">Visited</option>
            </select>
            <button
              @click="applyFilters"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Search
            </button>
          </div>
        </CardContent>
      </Card>

      <!-- Results Summary -->
      <div class="mb-4 text-sm text-gray-600">
        Showing {{ properties.length }} of {{ pagination.total }} properties
      </div>

      <!-- Properties List -->
      <div class="space-y-4">
        <Card v-for="property in properties" :key="property.id">
          <CardContent class="p-6">
            <div class="mb-3">
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {{ property.address }}
              </h3>
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  :class="getStatusColor(property.feedbackStatus)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusDisplayName(property.feedbackStatus || 'Not Visited') }}
                </span>
                <button
                  @click="openUpdateModal(property)"
                  class="px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 font-medium"
                >
                  Update Status
                </button>
              </div>
            </div>
            <div class="space-y-1 text-sm text-gray-600">
              <p v-if="property.dateOfVisit">
                <span class="font-medium">Visited:</span>
                {{ new Date(property.dateOfVisit).toLocaleDateString() }}
              </p>
              <p v-if="property.visitOutcome">
                <span class="font-medium">Outcome:</span>
                {{ property.visitOutcome }}
              </p>
            </div>
            <p v-if="property.visitNotes" class="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
              <span class="font-medium">Notes:</span> {{ property.visitNotes }}
            </p>
          </CardContent>
        </Card>

        <!-- Empty State -->
        <Card v-if="properties.length === 0">
          <CardContent class="p-12 text-center">
            <svg
              class="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p class="text-gray-600">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      </div>

      <!-- Route Planning Button -->
      <div v-if="properties.length > 0" class="mt-8 flex justify-center">
        <button
          @click="planRoute"
          :disabled="routeLoading"
          class="inline-flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 px-8 py-4 text-base font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <svg
            v-if="!routeLoading"
            class="w-6 h-6 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <svg
            v-else
            class="animate-spin h-6 w-6 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ routeLoading ? 'Planning Route...' : 'Plan Route for Unvisited Properties' }}
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.lastPage > 1" class="mt-8 flex justify-center items-center space-x-2">
        <button
          @click="changePage(pagination.currentPage - 1)"
          :disabled="pagination.currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        <span class="text-sm text-gray-600">
          Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
        </span>
        <button
          @click="changePage(pagination.currentPage + 1)"
          :disabled="pagination.currentPage === pagination.lastPage"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>

    <!-- Update Property Modal -->
    <div
      v-if="showUpdateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center sm:p-4 z-50"
      @click.self="showUpdateModal = false"
    >
      <div
        class="bg-white rounded-t-2xl sm:rounded-lg max-w-md w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
      >
        <h3 class="text-lg font-bold text-gray-900 mb-4">Update Property Status</h3>

        <form @submit.prevent="updateProperty" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Visit Status</label>
            <select
              v-model="updateForm.feedbackStatus"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Not Visited">Not Visited</option>
              <option value="Visited">Visited</option>
            </select>
          </div>

          <div v-if="updateForm.feedbackStatus === 'Visited'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Visit Outcome (select all that apply)</label>
            <div class="space-y-2">
              <label
                v-for="option in outcomeOptions"
                :key="option.value"
                class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50 border-blue-300': updateForm.visitOutcome.includes(option.value) }"
              >
                <input
                  type="checkbox"
                  :value="option.value"
                  v-model="updateForm.visitOutcome"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Visit</label>
            <input
              v-model="updateForm.dateOfVisit"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Visit Notes</label>
            <textarea
              v-model="updateForm.visitNotes"
              rows="4"
              placeholder="Add any notes about your visit..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex gap-3 justify-end pt-4">
            <button
              type="button"
              @click="showUpdateModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {{ updating ? 'Updating...' : 'Update Property' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Route Planning Modal -->
    <div
      v-if="showRouteModal && routeResult"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showRouteModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div
          class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center"
        >
          <h2 class="text-2xl font-bold text-primary">Route Summary</h2>
          <button
            @click="showRouteModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Starting Point -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-start gap-3">
              <div
                class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold"
              >
                S
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Starting Point</h3>
                <p class="text-gray-700">{{ routeResult.churchName }}</p>
                <p class="text-sm text-gray-500">{{ routeResult.churchAddress }}</p>
              </div>
            </div>
          </div>

          <!-- Route Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <div class="text-3xl font-bold text-primary">{{ routeResult.waypoints.length }}</div>
              <div class="text-sm text-gray-600 mt-1">Stops</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <div class="text-3xl font-bold text-primary">
                {{ routeResult.totalDistance.toFixed(1) }} km
              </div>
              <div class="text-sm text-gray-600 mt-1">Total Distance</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <div class="text-3xl font-bold text-primary">
                ~{{ routeResult.totalDuration }} mins
              </div>
              <div class="text-sm text-gray-600 mt-1">Estimated Time</div>
            </div>
          </div>

          <!-- Stop Order -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Stop Order (Optimized)</h3>
            <div class="space-y-3">
              <div
                v-for="(waypoint, idx) in routeResult.waypoints"
                :key="waypoint.propertyId"
                class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm"
                >
                  {{ Number(idx) + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ waypoint.address }}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ waypoint.distanceFromPrevious?.toFixed(1) }} km • ~{{
                      waypoint.durationFromPrevious
                    }}
                    mins from previous stop
                  </p>
                </div>
                <div
                  v-if="Number(idx) < routeResult.waypoints.length - 1"
                  class="flex-shrink-0 text-gray-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <a
              :href="routeResult.googleMapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Open in Google Maps
            </a>
            <button
              @click="printRoute"
              class="flex-1 px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Route Sheet
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Toast
      :show="toast.show"
      :type="toast.type"
      :message="toast.message"
      @close="toast.show = false"
    />
  </VisitorSidebarLayout>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@media print {
  .fixed {
    position: relative;
  }
  button {
    display: none;
  }
}
</style>
