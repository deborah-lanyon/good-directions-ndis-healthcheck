<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>

    <!-- Icon Grid -->
    <div v-if="icons.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-for="(icon, index) in icons" :key="index" class="relative group">
        <img
          :src="icon.url"
          :alt="icon.name"
          class="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:border-blue-500 transition"
        />
        <div
          class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition flex items-center justify-center gap-2"
        >
          <button
            @click="editIcon(index)"
            class="opacity-0 group-hover:opacity-100 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            title="Edit"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            @click="deleteIcon(index)"
            class="opacity-0 group-hover:opacity-100 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            title="Delete"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mt-2 truncate">{{ icon.name }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
      <p class="text-gray-500">No icons uploaded yet</p>
    </div>

    <!-- Upload New Icon -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Add New Icon</label>
      <label
        class="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
      >
        <span class="text-sm text-gray-600">
          <svg
            class="w-6 h-6 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Click to upload icon or drag file
        </span>
        <input
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          :disabled="isUploading"
          class="hidden"
        />
      </label>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
      {{ error }}
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      :class="[
        'fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300',
        toast.type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200',
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { uploadImage, validateImageFile } from '~/lib/image-upload'

interface Icon {
  name: string
  url: string
}

interface Props {
  title?: string
  icons?: Icon[]
}

interface Emits {
  (e: 'update', icons: Icon[]): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Icons',
  icons: () => [],
})

const emit = defineEmits<Emits>()

const isUploading = ref(false)
const error = ref<string | null>(null)
const icons = ref<Icon[]>(props.icons)

const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.show = true
  toast.message = message
  toast.type = type
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = null

  // Validate
  const validation = validateImageFile(file)
  if (!validation.valid) {
    error.value = validation.error || 'Invalid file'
    showToast(error.value, 'error')
    input.value = ''
    return
  }

  isUploading.value = true

  try {
    const url = await uploadImage(file, {
      type: 'icon',
    })

    icons.value.push({
      name: file.name.replace(/\.[^/.]+$/, ''),
      url,
    })

    emit('update', icons.value)
    showToast('Icon uploaded successfully', 'success')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    error.value = message
    showToast(message, 'error')
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

const deleteIcon = (index: number) => {
  icons.value.splice(index, 1)
  emit('update', icons.value)
  showToast('Icon deleted', 'success')
}

const editIcon = (index: number) => {
  // Could open a modal for editing icon properties
  console.log('Edit icon:', icons.value[index])
}
</script>
