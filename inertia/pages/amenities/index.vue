<template>
  <SidebarLayout pageTitle="Local Amenities" pageSubtitle="Manage local amenities for welcome packs">
    <!-- Action Buttons -->
    <div class="flex items-center mb-6">
      <button
        @click="showAddModal = true"
        class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
      >
        <span class="mr-2">+</span>
        Add Amenity
      </button>
    </div>

    <!-- Amenities List -->
    <div class="overflow-hidden bg-white shadow sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Type
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Name
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Address
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Contact
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Location
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="amenity in amenities" :key="amenity.id">
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm">
                <span class="mr-1">{{ amenity.amenityType.icon }}</span>
                {{ amenity.amenityType.subcategory }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">
              {{ amenity.name }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ amenity.address }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              <div v-if="amenity.phone">📞 {{ amenity.phone }}</div>
              <div v-if="amenity.website">
                <a :href="amenity.website" target="_blank" class="text-primary hover:underline">
                  🔗 Website
                </a>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ amenity.latitude?.toFixed(6) }}, {{ amenity.longitude?.toFixed(6) }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <button
                @click="editAmenity(amenity)"
                class="text-primary hover:text-primary/80 mr-4"
              >
                Edit
              </button>
              <button @click="deleteAmenity(amenity.id)" class="text-red-600 hover:text-red-800">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="amenities.length === 0" class="px-6 py-12 text-center">
        <p class="text-sm text-gray-500">
          No amenities added yet. Click "Add Amenity" to get started.
        </p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 overflow-y-auto"
      style="z-index: 9999; background-color: rgba(0, 0, 0, 0.5)"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex min-h-screen items-center justify-center px-4 py-8" @click="closeModal">
        <div
          class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative"
          @click.stop
        >
          <form @submit.prevent="saveAmenity">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <h3 class="mb-4 text-lg font-medium leading-6 text-gray-900">
                {{ editingAmenity ? 'Edit Amenity' : 'Add New Amenity' }}
              </h3>

              <div class="space-y-4">
                <!-- Amenity Type -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    v-model="form.amenityTypeId"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm amenity-type-select"
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
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    v-model="form.description"
                    rows="2"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  ></textarea>
                </div>

                <!-- Address -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    v-model="form.address"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    @blur="geocodeAddress"
                  />
                  <p class="mt-1 text-xs text-gray-500">Address will be geocoded automatically</p>
                </div>

                <!-- Coordinates (auto-filled) -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      v-model.number="form.latitude"
                      type="number"
                      step="0.000001"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      v-model.number="form.longitude"
                      type="number"
                      step="0.000001"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <!-- Website -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    v-model="form.website"
                    type="url"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <!-- Suburb & Postcode -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Suburb</label>
                    <input
                      v-model="form.suburb"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Postcode</label>
                    <input
                      v-model="form.postcode"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div v-if="error" class="mt-4 rounded-md bg-red-50 p-3">
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                :disabled="saving"
                class="inline-flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 sm:ml-3 sm:w-auto"
              >
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'

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

    const response = await fetch(url, {
      method: editingAmenity.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(form.value),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to save amenity')
    }

    await fetchAmenities()
    closeModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save amenity'
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
    const response = await fetch(`/api/amenities/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })

    if (!response.ok) throw new Error('Failed to delete amenity')
    await fetchAmenities()
  } catch (err) {
    alert('Failed to delete amenity. Please try again.')
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
  font-weight: 600;
  font-style: normal;
  padding: 0;
  margin: 0;
}

.amenity-type-select option {
  padding-left: 1.5rem;
}
</style>
