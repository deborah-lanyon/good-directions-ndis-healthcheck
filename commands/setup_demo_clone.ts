import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import Church from '#models/church'
import Property from '#models/property'
import StreetGroup from '#models/street_group'
import StreetAssignment from '#models/street_assignment'
import Visitor from '#models/visitor'
import WelcomePackTemplate from '#models/welcome_pack_template'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export default class SetupDemoClone extends BaseCommand {
  static commandName = 'setup:demo-clone'
  static description = 'Create a demo church by cloning data from an existing church'

  @args.string({ description: 'Name of the church to clone (partial match supported)' })
  declare churchName: string

  @flags.string({ description: 'Custom name for the demo church (defaults to "Demo - {original name}")' })
  declare name: string

  @flags.boolean({ description: 'Reset existing cloned demo data before recreating' })
  declare reset: boolean

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      // Find the source church by name (partial match)
      const sourceChurch = await Church.query()
        .whereLike('church_name', `%${this.churchName}%`)
        .where('is_demo', false)
        .first()

      if (!sourceChurch) {
        this.logger.error(`No church found matching "${this.churchName}"`)
        const allChurches = await Church.query()
          .where('is_demo', false)
          .orderBy('church_name', 'asc')
        this.logger.info('Available churches:')
        for (const c of allChurches) {
          this.logger.info(`  - ${c.churchName}`)
        }
        return
      }

      this.logger.info(`Found source church: ${sourceChurch.churchName}`)

      const demoName = this.name || `Demo - ${sourceChurch.churchName}`

      // Check if this cloned demo already exists
      let existingDemo = await Church.query()
        .where('church_name', demoName)
        .where('is_demo', true)
        .first()

      if (existingDemo && !this.reset) {
        this.logger.info(`Demo church "${demoName}" already exists. Use --reset to recreate it.`)
        return
      }

      // Reset existing demo if requested
      if (existingDemo && this.reset) {
        this.logger.info('Resetting existing cloned demo data...')
        await this.deleteChurchData(existingDemo)
        this.logger.success('Existing cloned demo data deleted')
      }

      // Create demo admin user
      this.logger.info('Creating demo admin user...')
      const slug = sourceChurch.churchName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const demoAdmin = await User.create({
        email: `demo-clone-${slug}@gooddirections.com.au`,
        fullName: `Demo Admin (${sourceChurch.churchName})`,
        password: 'demo123!',
        role: 'admin',
        adminApprovalStatus: 'approved',
      })

      // Create the demo church as a copy
      this.logger.info(`Creating demo church: ${demoName}...`)
      const demoChurch = await Church.create({
        userId: demoAdmin.id,
        churchName: demoName,
        url: `demo-${slug}.gooddirections.com.au`,
        address: sourceChurch.address,
        addressLine1: sourceChurch.addressLine1,
        addressLine2: sourceChurch.addressLine2,
        suburb: sourceChurch.suburb,
        postcode: sourceChurch.postcode,
        latitude: sourceChurch.latitude,
        longitude: sourceChurch.longitude,
        radius: sourceChurch.radius,
        country: sourceChurch.country,
        mapBounds: sourceChurch.mapBounds,
        mapZoom: sourceChurch.mapZoom,
        isDemo: true,
        syncStatus: 'completed',
        lastSyncAt: DateTime.now(),
        lastSyncDate: DateTime.now(),
      })

      // Clone street groups and their street assignments
      this.logger.info('Cloning street groups...')
      const sourceStreetGroups = await StreetGroup.query()
        .where('church_id', sourceChurch.id)
        .preload('streetAssignments')

      const streetGroupIdMap = new Map<number, number>() // old ID -> new ID

      for (const sg of sourceStreetGroups) {
        const newSg = await StreetGroup.create({
          churchId: demoChurch.id,
          name: sg.name,
          description: sg.description,
        })
        streetGroupIdMap.set(sg.id, newSg.id)

        // Clone street assignments
        for (const sa of sg.streetAssignments) {
          await StreetAssignment.create({
            streetGroupId: newSg.id,
            streetName: sa.streetName,
            streetNumberStart: sa.streetNumberStart,
            streetNumberEnd: sa.streetNumberEnd,
          })
        }
      }
      this.logger.info(`  Cloned ${sourceStreetGroups.length} street groups`)

      // Clone visitors and their street group associations
      this.logger.info('Cloning visitors...')
      const sourceVisitors = await Visitor.query()
        .where('church_id', sourceChurch.id)
        .preload('streetGroups')

      const visitorIdMap = new Map<number, number>() // old ID -> new ID

      for (const visitor of sourceVisitors) {
        const newVisitor = await Visitor.create({
          churchId: demoChurch.id,
          name: visitor.name,
          email: visitor.email ? `demo-${visitor.email}` : null,
          phone: visitor.phone,
          // Don't copy userId - demo visitors shouldn't link to real user accounts
          invitationAcceptedAt: visitor.invitationAcceptedAt,
        })
        visitorIdMap.set(visitor.id, newVisitor.id)

        // Re-associate with cloned street groups
        const newSgIds = visitor.streetGroups
          .map((sg) => streetGroupIdMap.get(sg.id))
          .filter((id): id is number => id !== undefined)

        if (newSgIds.length > 0) {
          await newVisitor.related('streetGroups').attach(newSgIds)
        }
      }
      this.logger.info(`  Cloned ${sourceVisitors.length} visitors`)

      // Clone properties
      this.logger.info('Cloning properties...')
      const sourceProperties = await Property.query()
        .where('church_id', sourceChurch.id)

      for (const prop of sourceProperties) {
        await Property.create({
          churchId: demoChurch.id,
          address: prop.address,
          streetName: prop.streetName,
          streetNumber: prop.streetNumber,
          postcode: prop.postcode,
          listingType: prop.listingType,
          dateSold: prop.dateSold,
          dateListed: prop.dateListed,
          rentalPrice: prop.rentalPrice,
          feedbackStatus: prop.feedbackStatus,
          visitor: prop.visitor,
          distanceFromChurch: prop.distanceFromChurch,
          latitude: prop.latitude,
          longitude: prop.longitude,
          dateOfVisit: prop.dateOfVisit,
          visitNotes: prop.visitNotes,
          visitOutcome: prop.visitOutcome,
          dateDelisted: prop.dateDelisted,
          lastSeenAt: prop.lastSeenAt,
        })
      }
      this.logger.info(`  Cloned ${sourceProperties.length} properties`)

      // Clone welcome pack template if it exists
      const sourceTemplate = await WelcomePackTemplate.query()
        .where('church_id', sourceChurch.id)
        .first()

      if (sourceTemplate) {
        this.logger.info('Cloning welcome pack template...')
        await WelcomePackTemplate.create({
          churchId: demoChurch.id,
          name: sourceTemplate.name,
          welcomeMessage: sourceTemplate.welcomeMessage,
          churchInfo: sourceTemplate.churchInfo,
          customContent: sourceTemplate.customContent,
          aboutCommunity: sourceTemplate.aboutCommunity,
          additionalInfo: sourceTemplate.additionalInfo,
          churchServices: sourceTemplate.churchServices,
          logoUrl: sourceTemplate.logoUrl,
          bannerUrl: sourceTemplate.bannerUrl,
          aboutUsImageUrl: sourceTemplate.aboutUsImageUrl,
          gettingAroundImageUrl: sourceTemplate.gettingAroundImageUrl,
          communityServicesImageUrl: sourceTemplate.communityServicesImageUrl,
          thingsToDoImageUrl: sourceTemplate.thingsToDoImageUrl,
          contactAddress: sourceTemplate.contactAddress,
          contactEmail: sourceTemplate.contactEmail,
          contactPhone: sourceTemplate.contactPhone,
          primaryColor: sourceTemplate.primaryColor,
          secondaryColor: sourceTemplate.secondaryColor,
          templateDesign: sourceTemplate.templateDesign,
          includeAmenities: sourceTemplate.includeAmenities,
          enabled: sourceTemplate.enabled,
        })
      }

      this.logger.success('Demo clone setup complete!')
      this.logger.info('')
      this.logger.info('Cloned Demo Church Details:')
      this.logger.info(`  Source: ${sourceChurch.churchName}`)
      this.logger.info(`  Demo Church: ${demoName}`)
      this.logger.info(`  Street Groups: ${sourceStreetGroups.length}`)
      this.logger.info(`  Visitors: ${sourceVisitors.length}`)
      this.logger.info(`  Properties: ${sourceProperties.length}`)
      this.logger.info(`  Welcome Pack: ${sourceTemplate ? 'Yes' : 'No'}`)
    } catch (error) {
      this.logger.error(`Failed to setup demo clone: ${error.message}`)
      console.error(error)
    }
  }

  private async deleteChurchData(church: Church) {
    // Delete properties
    await Property.query().where('church_id', church.id).delete()

    // Delete street group visitor associations and street assignments
    const streetGroups = await StreetGroup.query().where('church_id', church.id)
    for (const sg of streetGroups) {
      await db.from('street_group_visitor').where('street_group_id', sg.id).delete()
      await StreetAssignment.query().where('street_group_id', sg.id).delete()
    }

    // Delete street groups
    await StreetGroup.query().where('church_id', church.id).delete()

    // Delete visitors
    await Visitor.query().where('church_id', church.id).delete()

    // Delete welcome pack template
    await WelcomePackTemplate.query().where('church_id', church.id).delete()

    // Delete demo admin user if exists
    if (church.userId) {
      await User.query().where('id', church.userId).delete()
    }

    // Delete the church
    await church.delete()
  }
}
