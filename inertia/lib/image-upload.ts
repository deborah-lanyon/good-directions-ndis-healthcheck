/**
 * Image Upload Utility
 * Centralized service for handling image uploads to Google Cloud Storage
 * Can be used across any page or component
 */

export interface ImageUploadOptions {
  type: 'logo' | 'banner' | 'icon' | 'other'
  onProgress?: (progress: number) => void
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export interface UploadResponse {
  success: boolean
  url?: string
  type?: string
  message?: string
}

/**
 * Upload an image to Google Cloud Storage
 */
export async function uploadImage(file: File, options: ImageUploadOptions): Promise<string> {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(
      `File must be smaller than 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    )
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be an image (JPG, PNG, GIF, or WebP)')
  }

  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', options.type)

    // Make the upload request
    const response = await fetch('/api/welcome-pack/upload-image', {
      method: 'POST',
      body: formData,
    })

    const data: UploadResponse = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Upload failed')
    }

    if (!data.url) {
      throw new Error('No URL returned from server')
    }

    options.onSuccess?.(data.url)
    return data.url
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    options.onError?.(message)
    throw error
  }
}

/**
 * Delete an uploaded image from Google Cloud Storage
 */
export async function deleteImage(fileUrl: string): Promise<void> {
  if (!fileUrl) {
    throw new Error('No URL provided')
  }

  try {
    const response = await fetch('/api/welcome-pack/delete-image', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: fileUrl }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Delete failed')
    }
  } catch (error) {
    throw error
  }
}

/**
 * Validate an image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File must be smaller than 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be an image (JPG, PNG, GIF, or WebP)',
    }
  }

  return { valid: true }
}

/**
 * Get file info from File object
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    extension: getFileExtension(file.name),
  }
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}
