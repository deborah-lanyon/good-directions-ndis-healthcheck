<template>
  <Card>
    <CardHeader>
      <div class="flex justify-between items-center w-full">
        <div>
          <CardTitle class="text-2xl">Territory Detail</CardTitle>
        </div>
        <button
          :class="[
            'cursor-pointer px-12 py-2 rounded-full text-sm leading-5 font-medium',
            isEditing ? 'bg-tertiary text-white' : 'text-primary',
          ]"
          type="button"
          @click="toggleEditing"
        >
          {{ isEditing ? 'Save' : 'Update' }}
        </button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="mt-4">
        <div class="grid grid-cols-[3fr_7fr] gap-1 py-3 border-b border-[#fcfbf8]">
          <label for="church-address" class="text-sm leading-5 font-medium text-gray-500"
            >Territory Postcode</label
          >
          <div class="flex flex-col gap-4">
            <div v-if="!isEditing" class="text-gray-900 text-sm leading-5 font-normal">
              {{ getCombinedAddress() || '—' }}
            </div>
            <div v-else class="flex flex-col gap-3">
              <div class="flex flex-col">
                <input
                  type="text"
                  name="church-address"
                  id="church-address"
                  v-model="church.address"
                  :class="[
                    'text-gray-900 focus:ring-0 focus:outline-none text-sm leading-5 font-normal',
                    errors?.address ? 'border-red-500 border' : '',
                    isEditing ? 'border-gray-200 border p-2 rounded-lg' : '',
                  ]"
                  placeholder="Address"
                />
                <p v-if="errors?.address" class="text-red-500 text-xs mt-1">
                  {{ Array.isArray(errors.address) ? errors.address[0] : errors.address }}
                </p>
              </div>
              <div class="flex flex-col">
                <input
                  type="text"
                  name="church-suburb"
                  id="church-suburb"
                  v-model="church.suburb"
                  :class="[
                    'text-gray-900 focus:ring-0 focus:outline-none text-sm leading-5 font-normal',
                    errors?.suburb ? 'border-red-500 border' : '',
                    isEditing ? 'border-gray-200 border p-2 rounded-lg' : '',
                  ]"
                  placeholder="Suburb"
                />
                <p v-if="errors?.suburb" class="text-red-500 text-xs mt-1">
                  {{ Array.isArray(errors.suburb) ? errors.suburb[0] : errors.suburb }}
                </p>
              </div>
              <div class="flex flex-col">
                <input
                  type="text"
                  name="church-postcode"
                  id="church-postcode"
                  v-model="church.postcode"
                  :class="[
                    'text-gray-900 focus:ring-0 focus:outline-none text-sm leading-5 font-normal',
                    errors?.postcode ? 'border-red-500 border' : '',
                    isEditing ? 'border-gray-200 border p-2 rounded-lg' : '',
                  ]"
                  placeholder="Postcode"
                />
                <p v-if="errors?.postcode" class="text-red-500 text-xs mt-1">
                  {{ Array.isArray(errors.postcode) ? errors.postcode[0] : errors.postcode }}
                </p>
              </div>
            </div>
            <div>
              <p
                v-if="geoCodingStatus.message"
                :class="['text-xs mt-1', geoCodingStatus.error ? 'text-red-500' : 'text-green-600']"
              >
                {{ geoCodingStatus.message }}
              </p>
            </div>
            <button
              v-if="isEditing"
              type="button"
              class="cursor-pointer px-12 py-2 rounded-full text-sm leading-5 font-medium text-[#6d3b90]"
              :disabled="isGeocodeDisabled"
              @click="handleGeocodeAddress"
              data-testid="button-geocode"
            >
              {{ isGeocoding ? 'Looking up...' : 'Look up' }}
            </button>
            <!-- <div class="mt-3">
              <label class="text-sm leading-5 font-medium text-gray-500">Search Radius (km)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                v-model.number="radius"
                :class="[
                  'text-gray-900 focus:ring-0 focus:outline-none text-sm leading-5 font-normal mt-2',
                  isEditing ? 'border-gray-200 border p-2 rounded-lg' : '',
                ]"
                placeholder="Radius in kilometres"
              />
            </div> -->
          </div>
        </div>
      </div>
      <div class="grid grid-cols-[3fr_7fr] gap-1 py-3">
        <label class="text-sm leading-5 font-medium text-gray-500">Map</label>
        <div
          ref="mapContainer"
          class="w-full h-full min-h-[300px] rounded-lg border border-gray-200"
        ></div>
      </div>
    </CardContent>
  </Card>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed, reactive } from 'vue'
import type { Church } from '~/app/types'
import L from 'leaflet'
import { router } from '@inertiajs/vue3'
import { Card, CardContent, CardHeader, CardTitle } from '~/app/components/ui/card'

const props = defineProps<{
  church: Church | null
  errors?: Record<string, string | string[]>
  syncResult?: {
    totalFromApi?: number
    propertiesReported?: number
    propertiesFiltered?: number
    propertiesCreated?: number
    propertiesSkipped?: number
    error?: string
  } | null
}>()

const emit = defineEmits<{
  'sync-started': []
  'sync-completed': [result: { propertiesCreated: number; propertiesFiltered: number }]
  'sync-error': [error: string]
}>()

// Create a local reactive church object with default values to handle null case
const church = reactive({
  churchName: props.church?.churchName || '',
  url: props.church?.url || '',
  address: props.church?.address || '',
  addressLine1: props.church?.addressLine1 || '',
  addressLine2: props.church?.addressLine2 || '',
  country: props.church?.country || '',
  suburb: props.church?.suburb || '',
  postcode: props.church?.postcode || '',
  latitude: props.church?.latitude || null,
  longitude: props.church?.longitude || null,
  radius: props.church?.radius || null,
  mapBounds: props.church?.mapBounds || null,
  mapZoom: props.church?.mapZoom || null,
})

// Watch for props.church changes and update local church object
watch(
  () => props.church,
  (newChurch) => {
    if (newChurch) {
      church.churchName = newChurch.churchName || ''
      church.url = newChurch.url || ''
      church.address = newChurch.address || ''
      church.addressLine1 = newChurch.addressLine1 || ''
      church.addressLine2 = newChurch.addressLine2 || ''
      church.country = newChurch.country || ''
      church.suburb = newChurch.suburb || ''
      church.postcode = newChurch.postcode || ''
      church.latitude = newChurch.latitude || null
      church.longitude = newChurch.longitude || null
      church.radius = newChurch.radius || null
      church.mapBounds = newChurch.mapBounds || null
      church.mapZoom = newChurch.mapZoom || null
    }
  },
  { immediate: true }
)

const isEditing = ref(!!props.errors && Object.keys(props.errors).length > 0)
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null
let radiusCircle: L.Circle | null = null

const isGeocoding = ref(false)
const geocodeResult = ref<{
  lat: string
  lon: string
  display_name: string
} | null>(null)
const savedCoordinates = ref<{
  latitude: number | null
  longitude: number | null
}>({
  latitude: null,
  longitude: null,
})

const geoCodingStatus = reactive<{
  error: boolean
  success: boolean
  message: string
}>({
  error: false,
  success: false,
  message: '',
})

const isGeocodeDisabled = computed(() => {
  return !getCombinedAddress().trim() || isGeocoding.value
})

const updateMapWithCoordinates = (lat: number, lng: number) => {
  if (!mapContainer.value) return

  if (!map) {
    map = L.map(mapContainer.value, {
      center: [lat, lng],
      zoom: 15,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)
  } else {
    map.setView([lat, lng], 15)
  }

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: #6d3b90;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  const addressDisplay = getCombinedAddress()

  if (marker) {
    marker.setLatLng([lat, lng])
    marker.setPopupContent(
      `<div style="min-width: 200px;">
        <strong>${props.church?.churchName || 'Organisation Location'}</strong><br/>
        ${addressDisplay ? `<small>${addressDisplay}</small>` : ''}
      </div>`
    )
  } else {
    marker = L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(
        `<div style="min-width: 200px;">
          <strong>${props.church?.churchName || 'Organisation Location'}</strong><br/>
          ${addressDisplay ? `<small>${addressDisplay}</small>` : ''}
        </div>`
      )
  }

  setTimeout(() => {
    if (map) {
      map.invalidateSize()
      // Update radius circle after map is ready
      updateRadiusCircle(lat, lng)
    }
  }, 200)

  // store current map bounds + zoom
  if (map) {
    try {
      const b = map.getBounds()
      church.mapBounds = {
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      }
      church.mapZoom = map.getZoom()
    } catch (e) {
      // ignore
    }
  }
}

const updateRadiusCircle = (lat: number, lng: number) => {
  if (!map) return

  // Fixed radius for Sans Souci area (2km)
  const fixedRadius = 2

  // Remove existing circle if present
  if (radiusCircle) {
    radiusCircle.remove()
    radiusCircle = null
  }

  // Create circle with fixed radius
  radiusCircle = L.circle([lat, lng], {
    radius: fixedRadius * 1000, // Convert km to meters
    color: '#6d3b90',
    fillColor: '#6d3b90',
    fillOpacity: 0.1,
    weight: 2,
    dashArray: '5, 10',
  }).addTo(map)

  // Fit map to show the entire circle
  const bounds = radiusCircle.getBounds()
  map.fitBounds(bounds, { padding: [50, 50] })
}

const handleGeocodeAddress = async () => {
  if (!getCombinedAddress().trim()) {
    return
  }

  isGeocoding.value = true
  geocodeResult.value = null
  geoCodingStatus.error = false
  geoCodingStatus.success = false
  geoCodingStatus.message = ''

  try {
    const address = getCombinedAddress().trim() + ', Australia'
    const response = await fetch(`/geocode?address=${encodeURIComponent(address)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to geocode address' }))
      throw new Error(errorData.error || 'Failed to geocode address')
    }

    const result = await response.json()

    geocodeResult.value = {
      lat: result.lat,
      lon: result.lon,
      display_name: result.display_name,
    }

    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    savedCoordinates.value = {
      latitude: lat,
      longitude: lng,
    }

    await nextTick()
    updateMapWithCoordinates(lat, lng)

    // Set success message
    geoCodingStatus.success = true
    geoCodingStatus.error = false
    geoCodingStatus.message = 'Address found successfully!'
  } catch (error) {
    console.error('Error geocoding address:', error)
    geoCodingStatus.error = true
    geoCodingStatus.success = false
    geoCodingStatus.message = error instanceof Error ? error.message : 'Failed to geocode address'
  } finally {
    isGeocoding.value = false
  }
}

const getCombinedAddress = () => {
  const parts = [church.address, church.suburb, church.postcode].filter(Boolean)
  return parts.join(', ')
}

const save = async () => {
  const latitude = savedCoordinates.value.latitude ?? church.latitude
  const longitude = savedCoordinates.value.longitude ?? church.longitude

  // Check if location fields are changing
  const locationFieldsChanged =
    (church.address?.trim() || '') !== (props.church?.address || '') ||
    (church.addressLine1?.trim() || '') !== (props.church?.addressLine1 || '') ||
    (church.addressLine2?.trim() || '') !== (props.church?.addressLine2 || '') ||
    (church.suburb?.trim() || '') !== (props.church?.suburb || '') ||
    latitude !== props.church?.latitude ||
    longitude !== props.church?.longitude ||
    (church.radius ?? null) !== (props.church?.radius ?? null) ||
    JSON.stringify(church.mapBounds || null) !== JSON.stringify(props.church?.mapBounds || null) ||
    (church.mapZoom ?? null) !== (props.church?.mapZoom ?? null)

  // Emit sync started event if location fields changed
  if (locationFieldsChanged) {
    emit('sync-started')
  }

  router.put(
    '/territory-detail',
    {
      churchName: church.churchName,
      url: church.url,
      address: church.address?.trim() || '',
      addressLine1: church.addressLine1?.trim() || '',
      addressLine2: church.addressLine2?.trim() || '',
      country: church.country?.trim() || '',
      latitude: latitude,
      longitude: longitude,
      suburb: church.suburb?.trim() || '',
      postcode: church.postcode?.trim() || '',
      radius: church.radius,
      mapBounds: church.mapBounds,
      mapZoom: church.mapZoom,
    },
    {
      preserveScroll: true,
      onSuccess: () => {
        isEditing.value = false
        savedCoordinates.value = {
          latitude: null,
          longitude: null,
        }
      },
      onError: () => {
        console.error('Failed to save church details')
      },
      onFinish: () => {
        console.log('Details saved')
      },
    }
  )
}

// Watch for sync result and emit events
watch(
  () => props.syncResult,
  (syncResult) => {
    if (!syncResult) return

    if (syncResult.error) {
      emit('sync-error', syncResult.error)
    } else if (
      syncResult.propertiesCreated !== undefined &&
      syncResult.propertiesFiltered !== undefined
    ) {
      emit('sync-completed', {
        propertiesCreated: syncResult.propertiesCreated,
        propertiesFiltered: syncResult.propertiesFiltered,
      })
    }
  },
  { immediate: true }
)

const toggleEditing = () => {
  if (isEditing.value) {
    save()
  } else {
    isEditing.value = true
  }
}

const initializeMap = async () => {
  if (!mapContainer.value || map) return

  const lat = props.church?.latitude
  const lng = props.church?.longitude

  if (!lat || !lng) {
    return
  }

  await nextTick()

  await new Promise((resolve) => setTimeout(resolve, 100))

  if (!mapContainer.value) return

  updateMapWithCoordinates(lat, lng)
}

// Watch for radius changes
watch(
  () => church.radius,
  () => {
    if (map && church.latitude && church.longitude) {
      updateRadiusCircle(church.latitude, church.longitude)
    }
  }
)

// Watch for coordinate changes
watch(
  () => [props.church?.latitude, props.church?.longitude],
  () => {
    if (map && props.church?.latitude && props.church?.longitude) {
      const lat = props.church?.latitude
      const lng = props.church?.longitude

      // Update map center
      map.setView([lat, lng], 15)

      // Update radius circle
      updateRadiusCircle(lat, lng)

      // Update or create marker
      if (marker) {
        marker.setLatLng([lat, lng])
      } else {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: #6d3b90;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const addressDisplay = getCombinedAddress()

        marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width: 200px;">
              <strong>${props.church?.churchName || 'Organisation Location'}</strong><br/>
              ${addressDisplay ? `<small>${addressDisplay}</small>` : ''}
            </div>`
          )
      }
    }
  }
)

// Initialize map on mount
onMounted(async () => {
  await nextTick()
  await initializeMap()
})

// Clean up on unmount
onBeforeUnmount(() => {
  if (radiusCircle) {
    radiusCircle.remove()
    radiusCircle = null
  }
  if (marker) {
    marker.remove()
    marker = null
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>
