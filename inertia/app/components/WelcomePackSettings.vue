<template>
  <div class="space-y-4">
    <!-- Logo and Banner Upload - Side by Side -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Logo Upload -->
      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium text-gray-700">Church Logo</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="template.logoUrl" class="flex flex-col items-center gap-4">
            <img
              :src="template.logoUrl"
              alt="Church Logo"
              class="h-32 w-32 object-cover rounded-lg"
            />
            <button
              @click="deleteImage('logo')"
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50"
            >
              {{ isDeleting ? 'Deleting...' : 'Remove Logo' }}
            </button>
          </div>
          <div v-else class="text-sm text-gray-600 mb-2">
            No logo uploaded. Upload a PNG, JPG, or GIF file (max 5MB).
          </div>
          <label
            class="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
          >
            <span class="text-sm text-gray-600">
              {{ uploading === 'logo' ? 'Uploading...' : 'Click to upload logo' }}
            </span>
            <input
              type="file"
              accept="image/*"
              @change="uploadImage($event, 'logo')"
              :disabled="uploading === 'logo'"
              class="hidden"
            />
          </label>
          <div v-if="errors.logo" class="text-sm text-red-600">{{ errors.logo }}</div>
        </CardContent>
      </Card>

      <!-- Banner Upload -->
      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium text-gray-700">Banner Image</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="template.bannerUrl" class="flex flex-col gap-4">
            <img
              :src="template.bannerUrl"
              alt="Banner"
              class="w-full h-32 object-cover rounded-lg"
            />
            <button
              @click="deleteImage('banner')"
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 w-fit"
            >
              {{ isDeleting ? 'Deleting...' : 'Remove Banner' }}
            </button>
          </div>
          <div v-else class="space-y-2">
            <p class="text-sm text-gray-600">
              No banner uploaded. Upload a PNG, JPG, WebP, or GIF file (max 5MB).
            </p>
            <div class="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
              <strong>Recommended:</strong> 1200-1600px wide × 300-400px tall (landscape, 4:1 or
              16:5 aspect ratio)
            </div>
          </div>
          <label
            class="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
          >
            <span class="text-sm text-gray-600">
              {{ uploading === 'banner' ? 'Uploading...' : 'Click to upload banner' }}
            </span>
            <input
              type="file"
              accept="image/*"
              @change="uploadImage($event, 'banner')"
              :disabled="uploading === 'banner'"
              class="hidden"
            />
          </label>
          <div v-if="errors.banner" class="text-sm text-red-600">{{ errors.banner }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Toast Notifications -->
    <div
      v-if="toast.show"
      :class="[
        'fixed bottom-4 right-4 z-50 max-w-sm w-full px-4 py-3 rounded-lg shadow-lg transition-all duration-300',
        toast.type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : toast.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200',
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/app/components/ui/card'

interface WelcomePackTemplate {
  logoUrl?: string
  bannerUrl?: string
}

interface Toast {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}

const uploading = ref<'logo' | 'banner' | null>(null)
const isDeleting = ref(false)
const errors = reactive<{
  logo?: string
  banner?: string
}>({})

const template = reactive<WelcomePackTemplate>({
  logoUrl: undefined,
  bannerUrl: undefined,
})

const toast = reactive<Toast>({
  show: false,
  message: '',
  type: 'success',
})

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  toast.show = true
  toast.message = message
  toast.type = type
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const uploadImage = async (event: Event, type: 'logo' | 'banner') => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    errors[type] = 'File must be smaller than 5MB'
    return
  }

  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    errors[type] = 'File must be an image (JPG, PNG, GIF, or WebP)'
    return
  }

  uploading.value = type
  errors[type] = undefined

  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)

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

    if (type === 'logo') {
      template.logoUrl = data.url
    } else {
      template.bannerUrl = data.url
    }

    await updateTemplate()
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`, 'success')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    errors[type] = message
    showToast(message, 'error')
    console.error('Upload error:', error)
  } finally {
    uploading.value = null
    input.value = ''
  }
}

const deleteImage = async (type: 'logo' | 'banner') => {
  const url = type === 'logo' ? template.logoUrl : template.bannerUrl
  if (!url) return

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
      body: JSON.stringify({ url }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Delete failed')
    }

    if (type === 'logo') {
      template.logoUrl = undefined
    } else {
      template.bannerUrl = undefined
    }

    await updateTemplate()
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully`, 'success')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed'
    showToast(message, 'error')
  } finally {
    isDeleting.value = false
  }
}

const updateTemplate = async () => {
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

    const response = await fetch('/api/welcome-pack/template-update', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        logoUrl: template.logoUrl,
        bannerUrl: template.bannerUrl,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Update failed')
    }

    showToast('Template updated successfully', 'success')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed'
    showToast(message, 'error')
  }
}

const loadTemplate = async () => {
  try {
    const response = await fetch('/api/welcome-pack/template')
    const data = await response.json()

    if (data.template) {
      if (data.template.logoUrl) template.logoUrl = data.template.logoUrl
      if (data.template.bannerUrl) template.bannerUrl = data.template.bannerUrl
    }
  } catch (error) {
    console.error('Failed to load template:', error)
  }
}

onMounted(() => {
  loadTemplate()
})
</script>
