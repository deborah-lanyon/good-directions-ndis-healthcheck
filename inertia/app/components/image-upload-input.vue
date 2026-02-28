<template>
  <div class="space-y-3">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-600">*</span>
    </label>

    <!-- Preview -->
    <div v-if="previewUrl" class="relative inline-block">
      <img
        :src="previewUrl"
        :alt="label"
        :class="['rounded-lg border border-gray-200 object-cover', sizeClass]"
      />
      <button
        v-if="deletable"
        @click="handleDelete"
        :disabled="isDeleting"
        type="button"
        class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition disabled:opacity-50"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Upload Input -->
    <label
      v-if="!previewUrl || multiple"
      :class="[
        'flex items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500',
        isUploading && 'opacity-50 cursor-not-allowed',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <span v-if="!isUploading" class="text-sm text-gray-600">
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
        Click to upload{{ multiple ? ' or drag files' : ' or drag file' }}
      </span>
      <span v-else class="text-sm text-gray-600">
        <svg
          class="w-6 h-6 mx-auto mb-2 text-gray-400 animate-spin"
          fill="none"
          stroke="currentColor"
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
        Uploading...
      </span>
      <input
        type="file"
        accept="image/*"
        :multiple="multiple"
        @change="handleFileSelect"
        :disabled="isUploading"
        class="hidden"
      />
    </label>

    <!-- Error Message -->
    <div v-if="error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
      {{ error }}
    </div>

    <!-- Help Text -->
    <p v-if="helpText" class="text-xs text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadImage, deleteImage, validateImageFile } from '~/lib/image-upload'

interface Props {
  label?: string
  previewUrl?: string
  deletable?: boolean
  multiple?: boolean
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  helpText?: string
}

interface Emits {
  (e: 'upload', url: string): void
  (e: 'delete', url: string): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  deletable: true,
  multiple: false,
})

const emit = defineEmits<Emits>()

const isUploading = ref(false)
const isDeleting = ref(false)
const isDragging = ref(false)
const error = ref<string | null>(null)

const sizeClass = computed(() => {
  const sizes = {
    sm: 'h-16 w-16',
    md: 'h-32 w-32',
    lg: 'h-48 w-48',
  }
  return sizes[props.size]
})

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  for (const file of files) {
    await uploadFile(file)
  }

  input.value = ''
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await uploadFile(file)
    }
  }
}

const uploadFile = async (file: File) => {
  error.value = null

  // Validate file
  const validation = validateImageFile(file)
  if (!validation.valid) {
    error.value = validation.error || 'Invalid file'
    emit('error', error.value)
    return
  }

  isUploading.value = true

  try {
    const url = await uploadImage(file, {
      type: 'other',
      onError: (errorMessage) => {
        error.value = errorMessage
        emit('error', errorMessage)
      },
    })

    emit('upload', url)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    error.value = message
    emit('error', message)
  } finally {
    isUploading.value = false
  }
}

const handleDelete = async () => {
  if (!props.previewUrl) return

  isDeleting.value = true
  error.value = null

  try {
    await deleteImage(props.previewUrl)
    emit('delete', props.previewUrl)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    error.value = message
    emit('error', message)
  } finally {
    isDeleting.value = false
  }
}
</script>
