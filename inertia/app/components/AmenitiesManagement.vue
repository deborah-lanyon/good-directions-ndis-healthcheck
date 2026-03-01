<template>
  <div class="space-y-6 mt-4">
    <div class="bg-white rounded-lg p-6 min-w-0">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-2xl font-semibold text-gray-900">Amenity Management</h3>
          <p class="text-sm text-gray-600 mt-1">
            Manage local amenities that will be included in welcome packs
          </p>
        </div>
        <Dialog v-model:open="showAddModal">
          <DialogTrigger as-child>
            <button
              class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              <span class="mr-2">+</span>
              Add Amenity
            </button>
          </DialogTrigger>
        </Dialog>
      </div>

      <!-- Amenities List -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <Table>
          <TableHeader class="bg-gray-50">
            <TableRow>
              <TableHead
                class="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Type
              </TableHead>
              <TableHead
                class="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Name
              </TableHead>
              <TableHead
                class="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Address
              </TableHead>
              <TableHead
                class="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Contact
              </TableHead>
              <TableHead
                class="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Location
              </TableHead>
              <TableHead
                class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="amenity in amenities" :key="amenity.id">
              <TableCell class="whitespace-nowrap px-6 py-4 text-sm">
                <span class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm">
                  <span class="mr-1">{{ amenity.amenityType.icon }}</span>
                  {{ amenity.amenityType.subcategory }}
                </span>
              </TableCell>
              <TableCell class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ amenity.name }}
              </TableCell>
              <TableCell class="px-6 py-4 text-sm text-gray-600">
                {{ amenity.address }}
              </TableCell>
              <TableCell class="px-6 py-4 text-sm text-gray-600">
                <div v-if="amenity.phone">📞 {{ amenity.phone }}</div>
                <div v-if="amenity.website">
                  <a :href="amenity.website" target="_blank" class="text-primary hover:underline">
                    🔗 Website
                  </a>
                </div>
              </TableCell>
              <TableCell class="px-6 py-4 text-sm text-gray-600">
                {{ amenity.latitude?.toFixed(6) }}, {{ amenity.longitude?.toFixed(6) }}
              </TableCell>
              <TableCell class="whitespace-nowrap px-6 py-4 text-right text-sm">
                <button
                  @click="editAmenity(amenity)"
                  class="text-primary hover:text-primary/80 mr-4"
                >
                  Edit
                </button>
                <button @click="deleteAmenity(amenity.id)" class="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div v-if="amenities.length === 0" class="px-6 py-12 text-center">
          <p class="text-sm text-gray-500">
            No amenities added yet. Click "Add Amenity" to get started.
          </p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Dialog v-model:open="showAddModal">
      <DialogContent class="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="text-2xl">{{
            editingAmenity ? 'Edit Amenity' : 'Add New Amenity'
          }}</DialogTitle>
        </DialogHeader>

        <form @submit.prevent="saveAmenity" class="space-y-4">
          <!-- Amenity Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              v-model="form.amenityTypeId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent amenity-type-select"
            >
              <option value="">Select a type</option>
              <optgroup
                v-for="(group, groupName) in sortedGroupedAmenityTypes"
                :key="groupName"
                :label="`${group.icon} ${groupName}`"
              >
                <option v-for="type in group.items" :key="type.id" :value="type.id">
                  {{ type.subcategory }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Melbourne Central Primary School"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description (optional)"
            ></textarea>
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              v-model="form.address"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Full street address"
              @blur="geocodeAddress"
            />
            <p class="mt-1 text-xs text-gray-500">Address will be geocoded automatically</p>
          </div>

          <!-- Coordinates (auto-filled) -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                v-model.number="form.latitude"
                type="number"
                step="0.000001"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="-37.8136"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                v-model.number="form.longitude"
                type="number"
                step="0.000001"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="144.9631"
              />
            </div>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+61 X XXXX XXXX"
            />
          </div>

          <!-- Website -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              v-model="form.website"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <!-- Suburb & Postcode -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
              <input
                v-model="form.suburb"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Melbourne"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input
                v-model="form.postcode"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3000"
              />
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <DialogClose as-child>
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-tertiary rounded-lg hover:bg-[#e59a00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <svg
                  class="animate-spin h-4 w-4"
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
                Saving...
              </span>
              <span v-else>{{ editingAmenity ? 'Update Amenity' : 'Save Amenity' }}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/app/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/app/components/ui/table'

interface AmenityType {
  id: number
  name: string
  icon: string
  priority: number
  subcategory: string | null
}

interface Amenity {
  id: number
  amenityTypeId: number
  name: string
  description: string | null
  address: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  website: string | null
  suburb: string | null
  postcode: string | null
  amenityType: AmenityType
}

const amenities = ref<Amenity[]>([])
const amenityTypes = ref<AmenityType[]>([])
const groupedAmenityTypes = ref<
  Record<string, { icon: string; items: AmenityType[]; priority: number }>
>({})
const showAddModal = ref(false)
const editingAmenity = ref<Amenity | null>(null)
const saving = ref(false)
const error = ref('')

const sortedGroupedAmenityTypes = computed(() => {
  return Object.entries(groupedAmenityTypes.value)
    .sort(([, a], [, b]) => a.priority - b.priority)
    .reduce(
      (acc, [key, value]) => {
        // Sort items within each group by subcategory name
        acc[key] = {
          ...value,
          items: [...value.items].sort((a, b) => {
            const aName = a.subcategory || a.name
            const bName = b.subcategory || b.name
            return aName.localeCompare(bName)
          }),
        }
        return acc
      },
      {} as Record<string, { icon: string; items: AmenityType[]; priority: number }>
    )
})

// Reset form when modal closes
watch(showAddModal, (newValue) => {
  if (!newValue) {
    // Modal is closing, reset the form
    closeModal()
  }
})

const form = ref({
  amenityTypeId: '',
  name: '',
  description: '',
  address: '',
  latitude: null as number | null,
  longitude: null as number | null,
  phone: '',
  website: '',
  suburb: '',
  postcode: '',
})

onMounted(async () => {
  await fetchAmenities()
  await fetchAmenityTypes()
})

const fetchAmenities = async () => {
  try {
    const response = await fetch('/api/amenities', {
      credentials: 'same-origin',
    })
    if (!response.ok) throw new Error('Failed to fetch amenities')
    const data = await response.json()
    amenities.value = data.amenities || []
  } catch (err) {
    console.error('Error fetching amenities:', err)
  }
}

const fetchAmenityTypes = async () => {
  try {
    const response = await fetch('/api/amenity-types', {
      credentials: 'same-origin',
    })
    if (!response.ok) throw new Error('Failed to fetch amenity types')
    const data = await response.json()
    amenityTypes.value = data.amenityTypes || []

    // Group amenity types by parent category
    const grouped: Record<string, { icon: string; items: AmenityType[]; priority: number }> = {}
    amenityTypes.value.forEach((type) => {
      if (!grouped[type.name]) {
        grouped[type.name] = { icon: type.icon || '', items: [], priority: type.priority }
      } else {
        // Update priority to the minimum priority in the group
        grouped[type.name].priority = Math.min(grouped[type.name].priority, type.priority)
      }
      grouped[type.name].items.push(type)
    })
    groupedAmenityTypes.value = grouped
  } catch (err) {
    console.error('Error fetching amenity types:', err)
  }
}

const geocodeAddress = async () => {
  if (!form.value.address) return

  try {
    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ address: form.value.address }),
    })

    if (response.ok) {
      const data = await response.json()
      form.value.latitude = data.latitude
      form.value.longitude = data.longitude
      if (data.suburb) form.value.suburb = data.suburb
      if (data.postcode) form.value.postcode = data.postcode
    }
  } catch (err) {
    console.error('Geocoding failed:', err)
  }
}

const saveAmenity = async () => {
  saving.value = true
  error.value = ''

  try {
    const url = editingAmenity.value
      ? `/api/amenities/${editingAmenity.value.id}`
      : '/api/amenities'

    // Convert amenityTypeId to number
    const payload = {
      ...form.value,
      amenityTypeId: parseInt(form.value.amenityTypeId),
    }

    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    const response = await fetch(url, {
      method: editingAmenity.value ? 'PUT' : 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to save amenity')
    }

    await fetchAmenities()
    closeModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save amenity'
    console.error('Error saving amenity:', err)
  } finally {
    saving.value = false
  }
}

const editAmenity = (amenity: Amenity) => {
  editingAmenity.value = amenity
  form.value = {
    amenityTypeId: amenity.amenityTypeId.toString(),
    name: amenity.name,
    description: amenity.description || '',
    address: amenity.address,
    latitude: amenity.latitude,
    longitude: amenity.longitude,
    phone: amenity.phone || '',
    website: amenity.website || '',
    suburb: amenity.suburb || '',
    postcode: amenity.postcode || '',
  }
  showAddModal.value = true
}

const deleteAmenity = async (id: number) => {
  if (!confirm('Are you sure you want to delete this amenity?')) return

  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const headers: Record<string, string> = {}

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    const response = await fetch(`/api/amenities/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'same-origin',
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete amenity')
    }

    await fetchAmenities()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to delete amenity. Please try again.')
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingAmenity.value = null
  form.value = {
    amenityTypeId: '',
    name: '',
    description: '',
    address: '',
    latitude: null,
    longitude: null,
    phone: '',
    website: '',
    suburb: '',
    postcode: '',
  }
  error.value = ''
}
</script>

<style scoped>
.amenity-type-select optgroup {
  font-weight: 600 !important;
  font-style: normal !important;
  padding: 0.5rem 0 !important;
  margin: 0 !important;
}

.amenity-type-select option {
  padding-left: 2rem !important;
  padding-top: 0.25rem !important;
  padding-bottom: 0.25rem !important;
}
</style>
