<template>
  <td class="px-3 py-4">
    <div class="flex items-center">
      <div class="font-medium text-gray-900">{{ property.address }}</div>
    </div>
  </td>
  <td class="whitespace-nowrap px-3 py-4 text-sm overflow-visible">
    <div ref="dropdownContainer" class="relative inline-block">
      <button
        @click="toggleDropdown"
        :disabled="isUpdating"
        :class="[
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer',
          getStatusColor(property.feedbackStatus),
          isUpdating && 'opacity-50 cursor-not-allowed',
        ]"
      >
        {{ getStatusDisplayName(property.feedbackStatus) }}
      </button>
      <div
        v-if="isDropdownOpen"
        ref="dropdownMenu"
        class="absolute z-10 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg flex flex-col"
        :style="dropdownStyle"
      >
        <button
          v-for="status in feedbackStatusOptions"
          :key="status"
          @click="selectOption(status)"
          :class="[
            'block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 whitespace-nowrap',
            status === feedbackStatusOptions[0] && 'rounded-t-md',
            status === feedbackStatusOptions[feedbackStatusOptions.length - 1] && 'rounded-b-md',
            property.feedbackStatus === status && 'bg-blue-50 font-medium',
          ]"
        >
          {{ status }}
        </button>
      </div>
    </div>
  </td>
  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
    <span v-if="property.feedbackStatus === 'Visited' && property.visit_outcome">
      {{ property.visit_outcome }}
    </span>
    <span v-else class="text-gray-400">-</span>
  </td>
  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
    <div v-if="isVisitorEditing" class="flex items-center gap-2">
      <input
        ref="visitorInputRef"
        v-model="visitorInput"
        type="text"
        class="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Enter visitor name"
        :disabled="isVisitorUpdating"
        @keydown="handleVisitorKeydown"
        @blur="saveVisitor"
      />
      <span v-if="isVisitorUpdating" class="text-xs text-gray-400">Saving...</span>
    </div>
    <button
      v-else
      type="button"
      class="rounded px-2 py-1 text-left text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      @click.stop="startVisitorEditing"
    >
      {{ property.visitor || 'Enter visitor name' }}
    </button>
  </td>
  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
    {{ formatDate(property.date_of_visit) }}
  </td>

  <td class="whitespace-nowrap px-3 py-4 text-sm">
    <span
      :class="[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        property.listing_type === 'rent'
          ? 'bg-purple-100 text-purple-800'
          : 'bg-emerald-100 text-emerald-800',
      ]"
    >
      {{ property.listing_type === 'rent' ? 'Rented' : 'Sold' }}
    </span>
  </td>
  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
    {{ formatDateAdded(property.date_sold || property.date_delisted) }}
  </td>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { router } from '@inertiajs/vue3'
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Property } from '../../../../app/types/property'

const props = defineProps<{
  property: Property
}>()

const isDropdownOpen = ref(false)
const isUpdating = ref(false)
const dropdownContainer = ref<HTMLElement | null>(null)
const dropdownMenu = ref<HTMLElement | null>(null)
const isVisitorEditing = ref(false)
const isVisitorUpdating = ref(false)
const visitorInput = ref(props.property.visitor ?? '')
const visitorInputRef = ref<HTMLInputElement | null>(null)

const feedbackStatusOptions = [
  'Not Visited',
  'Visited',
] as const

const getStatusColor = (status: string | undefined) => {
  const statusValue = status || 'pending'
  switch (statusValue) {
    case 'Visited':
      return 'bg-green-100 text-green-800 hover:bg-green-200'
    case 'Not Visited':
    case 'pending':
    default:
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
  }
}

const getStatusDisplayName = (status: string | undefined) => {
  if (!status || status === 'pending') return 'Not Visited'
  return status
}

const formatDate = (dateString: string | null) => {
  if (dateString === null || !dateString) {
    return 'Not visited'
  }

  const date = DateTime.fromISO(dateString)
  if (!date.isValid) {
    return 'Not visited'
  }

  return date.toFormat('dd/MM/yyyy')
}

const formatDateAdded = (dateString: string | null) => {
  if (dateString === null || !dateString) {
    return '-'
  }

  const date = DateTime.fromISO(dateString)
  if (!date.isValid) {
    return '-'
  }

  return date.toFormat('dd/MM/yyyy')
}

const dropdownStyle = ref({})

const toggleDropdown = () => {
  if (!isUpdating.value) {
    isDropdownOpen.value = !isDropdownOpen.value
    if (isDropdownOpen.value) {
      // Calculate position after dropdown is rendered
      setTimeout(() => {
        calculateDropdownPosition()
      }, 0)
    }
  }
}

const calculateDropdownPosition = () => {
  if (!dropdownContainer.value || !dropdownMenu.value) return

  const containerRect = dropdownContainer.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const preferredWidth = 250
  const minWidth = 200
  const margin = 16

  // Calculate available space
  const spaceOnRight = viewportWidth - containerRect.right - margin
  const spaceOnLeft = containerRect.left - margin

  // Determine positioning and width
  let maxWidth = preferredWidth
  let left = '0'
  let right = 'auto'

  // If positioned to the left (default), check if it fits
  const leftPositionRightEdge = containerRect.left + preferredWidth
  if (leftPositionRightEdge > viewportWidth - margin) {
    // Doesn't fit on the right, constrain width or flip
    if (spaceOnLeft > spaceOnRight) {
      // More space on left, flip to right alignment
      right = '0'
      left = 'auto'
      maxWidth = Math.min(preferredWidth, Math.max(minWidth, spaceOnLeft))
    } else {
      // Stay on left but constrain width
      maxWidth = Math.min(preferredWidth, Math.max(minWidth, spaceOnRight))
    }
  } else {
    // Fits on the right, use preferred width
    maxWidth = preferredWidth
  }

  dropdownStyle.value = {
    left,
    right,
    width: `${maxWidth}px`,
    minWidth: '200px',
  }
}

const selectOption = async (feedbackStatus: string) => {
  if (isUpdating.value || feedbackStatus === props.property.feedbackStatus) {
    isDropdownOpen.value = false
    return
  }

  isUpdating.value = true
  isDropdownOpen.value = false
  const propertyId = props.property.id || props.property.uid

  try {
    const response = await fetch(`/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedbackStatus }),
    })
    isUpdating.value = false

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update feedback status')
    }

    router.reload({ only: ['properties'] })
  } catch (error) {
    console.error('Error updating feedback status:', error)
    isUpdating.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  // Guard against null refs during HMR
  if (!dropdownContainer.value) return

  const target = event.target as HTMLElement
  if (!dropdownContainer.value.contains(target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => props.property.visitor,
  (newVisitor) => {
    if (!isVisitorEditing.value) {
      visitorInput.value = newVisitor ?? ''
    }
  }
)

const startVisitorEditing = async () => {
  if (isVisitorUpdating.value) {
    return
  }

  isVisitorEditing.value = true
  visitorInput.value = props.property.visitor ?? ''

  await nextTick()
  visitorInputRef.value?.focus()
}

const cancelVisitorEditing = () => {
  isVisitorEditing.value = false
  visitorInput.value = props.property.visitor ?? ''
}

const saveVisitor = async () => {
  if (isVisitorUpdating.value) {
    return
  }

  const trimmedVisitor = visitorInput.value.trim()
  const formattedVisitor = trimmedVisitor.length > 0 ? trimmedVisitor : null

  if (formattedVisitor === (props.property.visitor ?? null)) {
    isVisitorEditing.value = false
    return
  }

  isVisitorUpdating.value = true
  const propertyId = props.property.id || props.property.uid

  try {
    const response = await fetch(`/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visitor: formattedVisitor }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update visitor')
    }

    isVisitorEditing.value = false
    router.reload({ only: ['properties'] })
  } catch (error) {
    console.error('Error updating visitor:', error)
  } finally {
    isVisitorUpdating.value = false
  }
}

const handleVisitorKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    saveVisitor()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancelVisitorEditing()
  }
}
</script>
