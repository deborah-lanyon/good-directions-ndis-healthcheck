import { Storage } from '@google-cloud/storage'
import env from '#start/env'
import { randomUUID } from 'node:crypto'

export default class GcsStorageService {
  private storage: Storage
  private bucketName: string

  constructor() {
    // Initialize Google Cloud Storage client
    const projectId = env.get('GCP_PROJECT_ID', '')
    this.bucketName = env.get('GCS_BUCKET_NAME', 'welcomers-portal-uploads')

    // Use Application Default Credentials (works with GCP service account)
    this.storage = new Storage({
      projectId: projectId || undefined,
    })
  }

  /**
   * Upload a file to Google Cloud Storage
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'general'
  ): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName)
      const uniqueFileName = `${folder}/${randomUUID()}-${fileName}`
      const file = bucket.file(uniqueFileName)

      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
        },
        resumable: false,
      })

      // Files are public by bucket-level permissions (uniform bucket-level access)
      // No need to call makePublic() on individual files
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${uniqueFileName}`

      return publicUrl
    } catch (error) {
      console.error('Error uploading file to GCS:', error)
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName)
      const fileName = fileUrl.split(`/${this.bucketName}/`)[1]

      if (!fileName) {
        throw new Error('Invalid file URL')
      }

      await bucket.file(fileName).delete()
    } catch (error) {
      console.error('Error deleting file from GCS:', error)
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Generate a signed URL for temporary access
   */
  async getSignedUrl(fileUrl: string, expirationHours: number = 24): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName)
      const fileName = fileUrl.split(`/${this.bucketName}/`)[1]

      if (!fileName) {
        throw new Error('Invalid file URL')
      }

      const file = bucket.file(fileName)
      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expirationHours * 60 * 60 * 1000,
      })

      return signedUrl
    } catch (error) {
      console.error('Error generating signed URL:', error)
      throw new Error(
        `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: string = 'general'): Promise<Array<{ name: string; url: string }>> {
    try {
      const bucket = this.storage.bucket(this.bucketName)
      const prefix = folder ? `${folder}/` : ''
      const [files] = await bucket.getFiles({ prefix })

      return files.map((file) => ({
        name: file.name.split('/').pop() || '',
        url: `https://storage.googleapis.com/${this.bucketName}/${file.name}`,
      }))
    } catch (error) {
      console.error('Error listing files from GCS:', error)
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
