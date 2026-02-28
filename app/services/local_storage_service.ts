import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import env from '#start/env'

export default class LocalStorageService {
  private uploadDir: string

  constructor() {
    // Store uploads in public/uploads directory
    this.uploadDir = join(process.cwd(), 'public', 'uploads')
  }

  /**
   * Upload a file to local storage
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    _mimeType: string,
    folder: string = 'general'
  ): Promise<string> {
    try {
      const folderPath = join(this.uploadDir, folder)

      // Create directory if it doesn't exist
      if (!existsSync(folderPath)) {
        await mkdir(folderPath, { recursive: true })
      }

      const uniqueFileName = `${randomUUID()}-${fileName}`
      const filePath = join(folderPath, uniqueFileName)

      await writeFile(filePath, fileBuffer)

      // Return public URL
      const appUrl = env.get('APP_URL', 'http://localhost:3333')
      const publicUrl = `${appUrl}/uploads/${folder}/${uniqueFileName}`

      return publicUrl
    } catch (error) {
      console.error('Error uploading file to local storage:', error)
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Delete a file from local storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const urlParts = fileUrl.split('/uploads/')
      if (urlParts.length < 2) {
        throw new Error('Invalid file URL')
      }

      const relativePath = urlParts[1]
      const filePath = join(this.uploadDir, relativePath)

      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    } catch (error) {
      console.error('Error deleting file from local storage:', error)
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Check if a file exists
   */
  fileExists(fileUrl: string): boolean {
    try {
      const urlParts = fileUrl.split('/uploads/')
      if (urlParts.length < 2) {
        return false
      }

      const relativePath = urlParts[1]
      const filePath = join(this.uploadDir, relativePath)

      return existsSync(filePath)
    } catch {
      return false
    }
  }
}
