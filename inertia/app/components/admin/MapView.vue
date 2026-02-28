<template>
  <div class="relative">
    <div
      ref="mapContainer"
      class="w-full rounded-lg border border-gray-200"
      :style="{ height: mapHeight }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Church {
  id: number
  churchName: string
  latitude: number | null
  longitude: number | null
  radius: number | null
  user: {
    adminApprovalStatus: 'pending' | 'approved' | 'rejected'
  } | null
}

const props = defineProps<{
  churches: Church[]
  mapHeight?: string
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null

// Color coding by approval status
const getMarkerColor = (status: string) => {
  switch (status) {
    case 'approved':
      return '#10b981' // green
    case 'rejected':
      return '#ef4444' // red
    default:
      return '#f59e0b' // yellow
  }
}

const initMap = () => {
  if (!mapContainer.value) return

  // Clear existing map if any
  if (map) {
    map.remove()
  }

  // Initialize map centered on Australia
  map = L.map(mapContainer.value).setView([-33.8688, 151.2093], 11) // Sydney default

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  // Add churches to map
  const validChurches = props.churches.filter((c) => c.latitude !== null && c.longitude !== null)

  if (validChurches.length === 0) {
    // No valid locations, show message
    return
  }

  const bounds: L.LatLngBoundsExpression = []

  validChurches.forEach((church) => {
    if (!map || church.latitude === null || church.longitude === null) return

    const lat = church.latitude
    const lng = church.longitude
    const color = getMarkerColor(church.user?.adminApprovalStatus || 'pending')

    // Add marker
    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(map)

    marker.bindPopup(`
      <div class="text-sm">
        <strong>${church.churchName}</strong><br>
        ${church.radius ? `Radius: ${church.radius} km` : 'No radius set'}
      </div>
    `)

    // Add radius circle if defined
    if (church.radius) {
      L.circle([lat, lng], {
        radius: church.radius * 1000, // Convert km to meters
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.1,
      }).addTo(map)
    }

    bounds.push([lat, lng])
  })

  // Fit map to show all churches
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}

onMounted(() => {
  // Fix Leaflet default marker icon paths
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })

  initMap()
})

// Reinitialize map if churches data changes
watch(
  () => props.churches,
  () => {
    initMap()
  },
  { deep: true }
)
</script>

<style>
/* Override Leaflet's default styles to match our theme */
.leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.leaflet-popup-content {
  margin: 10px;
}
</style>
