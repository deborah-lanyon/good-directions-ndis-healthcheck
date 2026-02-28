<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center"
      >
        <h2 class="text-2xl font-bold text-primary">Route Summary</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
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
              <p class="text-gray-700">{{ route.churchName }}</p>
              <p class="text-sm text-gray-500">{{ route.churchAddress }}</p>
            </div>
          </div>
        </div>

        <!-- Route Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-primary">{{ route.waypoints.length }}</div>
            <div class="text-sm text-gray-600 mt-1">Stops</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-primary">
              {{ route.totalDistance.toFixed(1) }} km
            </div>
            <div class="text-sm text-gray-600 mt-1">Total Distance</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-primary">~{{ route.totalDuration }} mins</div>
            <div class="text-sm text-gray-600 mt-1">Estimated Time</div>
          </div>
        </div>

        <!-- Stop Order -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Stop Order (Optimized)</h3>
          <div class="space-y-3">
            <div
              v-for="(waypoint, index) in route.waypoints"
              :key="waypoint.propertyId"
              class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm"
              >
                {{ index + 1 }}
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
              <div v-if="index < route.waypoints.length - 1" class="flex-shrink-0 text-gray-400">
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
            :href="route.googleMapsUrl"
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
</template>

<script setup lang="ts">
interface RouteWaypoint {
  propertyId: number
  address: string
  latitude: number
  longitude: number
  distanceFromPrevious?: number
  durationFromPrevious?: number
}

interface RouteResult {
  churchId: number
  churchName: string
  churchAddress: string
  churchLatitude: number
  churchLongitude: number
  waypoints: RouteWaypoint[]
  totalDistance: number
  totalDuration: number
  optimizedOrder: number[]
  googleMapsUrl: string
}

const props = defineProps<{
  route: RouteResult
}>()

const emit = defineEmits<{
  close: []
}>()

const printRoute = () => {
  window.print()
}
</script>

<style scoped>
@media print {
  .fixed {
    position: relative;
  }
  button {
    display: none;
  }
}
</style>
