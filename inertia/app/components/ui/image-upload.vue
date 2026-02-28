<template>
  <div class="border border-gray-300 rounded-lg p-4">
    <p class="text-sm font-medium text-gray-700 mb-3">{{ label }}</p>

    <!-- Image Preview -->
    <div v-if="imageUrl" class="flex flex-col gap-4 mb-4">
      <img :src="imageUrl" :alt="label" class="w-full h-48 object-cover rounded-lg" />
      <button
        type="button"
        @click="handleDelete"
        :disabled="isDeleting"
        class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 w-fit"
      >
        {{ isDeleting ? 'Deleting...' : 'Remove Image' }}
      </button>
    </div>

    <!-- No Image State -->
    <div v-else class="space-y-2 mb-4">
      <p class="text-sm text-gray-600">
        No image uploaded. Upload a PNG, JPG, WebP, or GIF file (max 5MB).
      </p>
      <div
        v-if="recommendedSize"
        class="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2"
      >
        <strong>Recommended:</strong> {{ recommendedSize }}
      </div>
    </div>

    <!-- Upload Button -->
    <label
      class="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
    >
      <span class="text-sm text-gray-600">
        {{ isUploading ? 'Uploading...' : 'Click to upload image' }}
      </span>
      <input
        type="file"
        accept="image/*"
        @change="handleUpload"
        :disabled="isUploading"
        class="hidden"
      />
    </label>

    <!-- Error Message -->
    <div v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  label: string
  imageUrl?: string
  imageType: string
  recommendedSize?: string
}>()

const emit = defineEmits<{
  'update:imageUrl': [url: string]
  'upload-success': [url: string]
  'upload-error': [message: string]
  'delete-success': []
  'delete-error': [message: string]
}>()

const isUploading = ref(false)
const isDeleting = ref(false)
const error = ref('')

const handleUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File must be smaller than 5MB'
    return
  }

  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    error.value = 'File must be an image (JPG, PNG, GIF, or WebP)'
    return
  }

  isUploading.value = true
  error.value = ''

  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', props.imageType)

    const headers: Record<string, string> = {}
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    const response = await fetch('/api/welcome-pack/upload-image', {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'same-origin',
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Upload failed')
    }

    emit('update:imageUrl', data.url)
    emit('upload-success', data.url)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    error.value = message
    emit('upload-error', message)
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

const handleDelete = async () => {
  if (!props.imageUrl) return

  isDeleting.value = true

  try {
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

    const response = await fetch('/api/welcome-pack/delete-image', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ url: props.imageUrl }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Delete failed')
    }

    emit('update:imageUrl', '')
    emit('delete-success')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    error.value = message
    emit('delete-error', message)
  } finally {
    isDeleting.value = false
  }
}
</script>
