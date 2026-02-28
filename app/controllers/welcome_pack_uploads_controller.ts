import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs'
import LocalStorageService from '#services/local_storage_service'
import GcsStorageService from '#services/gcs_storage_service'
import WelcomePackService from '#services/welcome_pack_service'
import env from '#start/env'

export default class WelcomePackUploadsController {
  /**
   * Get welcome pack template for authenticated user's church
   */
  async getTemplate(ctx: HttpContext) {
    const { response, auth } = ctx

    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().firstOrFail()

      const welcomePackService = new WelcomePackService()
      const template = await welcomePackService.getOrCreateTemplate(church.id)

      return response.json({
        success: true,
        template: template.toJSON(),
      })
    } catch (error) {
      console.error('Get template error:', error)
      return response.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get template',
      })
    }
  }

  /**
   * Handle logo and banner image uploads
   */
  async uploadImage(ctx: HttpContext) {
    const { request, response } = ctx

    // Use local storage if GCS is not configured
    const gcsBucket = env.get('GCS_BUCKET_NAME')
    const gcsProject = env.get('GCP_PROJECT_ID')
    const useGcs = gcsBucket && gcsProject

    const storageService = useGcs ? new GcsStorageService() : new LocalStorageService()

    try {
      // Get file from request
      const file = request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      })

      if (!file) {
        return response.status(400).json({
          success: false,
          message: 'No image file provided',
        })
      }

      // Validate file
      if (!file.isValid) {
        return response.status(400).json({
          success: false,
          message: file.errors?.[0]?.message || 'Invalid file',
        })
      }

      // Get upload type
      const type = request.input('type') as
        | 'logo'
        | 'banner'
        | 'aboutUs'
        | 'gettingAround'
        | 'communityServices'
        | 'thingsToDo'
      const validTypes = [
        'logo',
        'banner',
        'aboutUs',
        'gettingAround',
        'communityServices',
        'thingsToDo',
      ]
      if (!validTypes.includes(type)) {
        return response.status(400).json({
          success: false,
          message: `Invalid upload type. Must be one of: ${validTypes.join(', ')}`,
        })
      }

      // Upload to storage
      const folderMap: Record<string, string> = {
        logo: 'welcome-pack/logos',
        banner: 'welcome-pack/banners',
        aboutUs: 'welcome-pack/about-us',
        gettingAround: 'welcome-pack/getting-around',
        communityServices: 'welcome-pack/community-services',
        thingsToDo: 'welcome-pack/things-to-do',
      }
      const folder = folderMap[type]
      const tmpPath = file.tmpPath
      if (!tmpPath) {
        throw new Error('File not available for upload')
      }

      const buffer = await fs.promises.readFile(tmpPath)
      const fileUrl = await storageService.uploadFile(
        buffer,
        file.clientName,
        file.type || 'image/jpeg',
        folder
      )

      return response.json({
        success: true,
        url: fileUrl,
        type,
      })
    } catch (error) {
      console.error('Upload error:', error)
      return response.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      })
    }
  }

  /**
   * Update welcome pack template with logo/banner and colors
   */
  async updateTemplate(ctx: HttpContext) {
    const { request, response, auth } = ctx

    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().firstOrFail()

      // Use getOrCreate instead of firstOrFail to handle missing templates
      const welcomePackService = new WelcomePackService()
      const template = await welcomePackService.getOrCreateTemplate(church.id)

      // Update template fields
      const payload = request.only([
        'logoUrl',
        'bannerUrl',
        'aboutUsImageUrl',
        'gettingAroundImageUrl',
        'communityServicesImageUrl',
        'thingsToDoImageUrl',
        'aboutCommunity',
        'contactAddress',
        'contactEmail',
        'contactPhone',
        'primaryColor',
        'secondaryColor',
      ])

      template.merge(payload)
      await template.save()

      return response.json({
        success: true,
        template: template.toJSON(),
      })
    } catch (error) {
      console.error('Template update error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      return response.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update template',
      })
    }
  }

  /**
   * Delete an uploaded image
   */
  async deleteImage(ctx: HttpContext) {
    const { request, response } = ctx

    // Use local storage if GCS is not configured
    const gcsBucket = env.get('GCS_BUCKET_NAME')
    const gcsProject = env.get('GCP_PROJECT_ID')
    const useGcs = gcsBucket && gcsProject

    const storageService = useGcs ? new GcsStorageService() : new LocalStorageService()

    try {
      const fileUrl = request.input('url')

      if (!fileUrl) {
        return response.status(400).json({
          success: false,
          message: 'No URL provided',
        })
      }

      await storageService.deleteFile(fileUrl)

      return response.json({
        success: true,
        message: 'Image deleted successfully',
      })
    } catch (error) {
      console.error('Delete error:', error)
      return response.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete image',
      })
    }
  }
}
