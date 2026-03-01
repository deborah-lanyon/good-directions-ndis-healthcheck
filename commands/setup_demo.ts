import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import User from '#models/user'
import Church from '#models/church'
import Property from '#models/property'
import StreetGroup from '#models/street_group'
import Visitor from '#models/visitor'
import db from '@adonisjs/lucid/services/db'

export default class SetupDemo extends BaseCommand {
  static commandName = 'setup:demo'
  static description = 'Set up or reset the demo church with sample data'

  @flags.boolean({ description: 'Reset existing demo data' })
  declare reset: boolean

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      // Check if demo church already exists
      let demoChurch = await Church.query().where('is_demo', true).first()

      if (demoChurch && !this.reset) {
        this.logger.info('Demo church already exists. Use --reset to recreate it.')
        this.logger.info(`  Church: ${demoChurch.churchName}`)
        return
      }

      // If reset, delete existing demo data
      if (demoChurch && this.reset) {
        this.logger.info('Resetting demo data...')

        // Delete properties
        await Property.query().where('church_id', demoChurch.id).delete()

        // Delete street group visitor associations
        const streetGroups = await StreetGroup.query().where('church_id', demoChurch.id)
        for (const sg of streetGroups) {
          await db.from('street_group_visitor').where('street_group_id', sg.id).delete()
        }

        // Delete street groups
        await StreetGroup.query().where('church_id', demoChurch.id).delete()

        // Delete visitors
        await Visitor.query().where('church_id', demoChurch.id).delete()

        // Delete demo church admin user if exists
        if (demoChurch.userId) {
          await User.query().where('id', demoChurch.userId).delete()
        }

        // Delete the church
        await demoChurch.delete()
        this.logger.success('Existing demo data deleted')
      }

      // Create demo church admin user
      this.logger.info('Creating demo church admin user...')
      const demoAdmin = await User.create({
        email: 'demo-admin@gooddirections.com.au',
        fullName: 'Demo Church Admin',
        password: 'demo123!',
        role: 'admin',
        adminApprovalStatus: 'approved',
      })

      // Create demo church
      this.logger.info('Creating demo church...')
      demoChurch = await Church.create({
        userId: demoAdmin.id,
        churchName: 'Demo Community Church',
        url: 'demo.gooddirections.com.au',
        address: '123 Demo Street, Sydney NSW 2000',
        suburb: 'Sydney',
        postcode: '2000',
        latitude: -33.8688,
        longitude: 151.2093,
        radius: 5,
        isDemo: true,
        syncStatus: 'completed',
        lastSyncAt: DateTime.now(),
        lastSyncDate: DateTime.now(),
      })

      // Create street groups
      this.logger.info('Creating street groups...')
      const streetGroup1 = await StreetGroup.create({
        churchId: demoChurch.id,
        name: 'North Sydney Area',
      })

      const streetGroup2 = await StreetGroup.create({
        churchId: demoChurch.id,
        name: 'CBD Area',
      })

      // Create demo visitor
      this.logger.info('Creating demo visitor...')
      const demoVisitor = await Visitor.create({
        churchId: demoChurch.id,
        name: 'Demo Visitor',
        email: 'demo-visitor@gooddirections.com.au',
        invitationAcceptedAt: DateTime.now(),
      })

      // Link visitor to street groups
      await demoVisitor.related('streetGroups').attach([streetGroup1.id, streetGroup2.id])

      // Create sample properties
      this.logger.info('Creating sample properties...')
      const sampleProperties = [
        // Visited properties
        {
          address: '10 George Street, Sydney NSW 2000',
          streetName: 'George Street',
          streetNumber: 10,
          postcode: '2000',
          listingType: 'sold' as const,
          dateSold: DateTime.now().minus({ days: 14 }),
          feedbackStatus: 'Visited',
          visitOutcome: 'Welcomed',
          visitor: 'Demo Visitor',
          dateOfVisit: DateTime.now().minus({ days: 7 }),
          visitNotes: 'Friendly family, interested in community events',
          latitude: -33.8651,
          longitude: 151.2099,
          distanceFromChurch: 0.5,
        },
        {
          address: '25 Pitt Street, Sydney NSW 2000',
          streetName: 'Pitt Street',
          streetNumber: 25,
          postcode: '2000',
          listingType: 'sold' as const,
          dateSold: DateTime.now().minus({ days: 10 }),
          feedbackStatus: 'Visited',
          visitOutcome: 'Pack left',
          visitor: 'Demo Visitor',
          dateOfVisit: DateTime.now().minus({ days: 5 }),
          visitNotes: 'Not home, left welcome pack at door',
          latitude: -33.8670,
          longitude: 151.2100,
          distanceFromChurch: 0.3,
        },
        {
          address: '42 Martin Place, Sydney NSW 2000',
          streetName: 'Martin Place',
          streetNumber: 42,
          postcode: '2000',
          listingType: 'sold' as const,
          dateSold: DateTime.now().minus({ days: 21 }),
          feedbackStatus: 'Visited',
          visitOutcome: 'Not Interested',
          visitor: 'Demo Visitor',
          dateOfVisit: DateTime.now().minus({ days: 10 }),
          latitude: -33.8680,
          longitude: 151.2105,
          distanceFromChurch: 0.4,
        },
        // Pending/Not visited properties
        {
          address: '15 York Street, Sydney NSW 2000',
          streetName: 'York Street',
          streetNumber: 15,
          postcode: '2000',
          listingType: 'sold' as const,
          dateSold: DateTime.now().minus({ days: 5 }),
          feedbackStatus: 'pending',
          latitude: -33.8665,
          longitude: 151.2065,
          distanceFromChurch: 0.6,
        },
        {
          address: '88 Clarence Street, Sydney NSW 2000',
          streetName: 'Clarence Street',
          streetNumber: 88,
          postcode: '2000',
          listingType: 'sold' as const,
          dateSold: DateTime.now().minus({ days: 3 }),
          feedbackStatus: 'pending',
          latitude: -33.8660,
          longitude: 151.2055,
          distanceFromChurch: 0.7,
        },
        {
          address: '5 Barrack Street, Sydney NSW 2000',
          streetName: 'Barrack Street',
          streetNumber: 5,
          postcode: '2000',
          listingType: 'sold' as const,
          dateSold: DateTime.now().minus({ days: 2 }),
          feedbackStatus: 'Not Visited',
          latitude: -33.8675,
          longitude: 151.2110,
          distanceFromChurch: 0.4,
        },
        // Rental properties
        {
          address: '200 Kent Street, Sydney NSW 2000',
          streetName: 'Kent Street',
          streetNumber: 200,
          postcode: '2000',
          listingType: 'rent' as const,
          dateDelisted: DateTime.now().minus({ days: 7 }),
          feedbackStatus: 'pending',
          rentalPrice: '$650/week',
          latitude: -33.8645,
          longitude: 151.2040,
          distanceFromChurch: 0.8,
        },
        {
          address: '77 Sussex Street, Sydney NSW 2000',
          streetName: 'Sussex Street',
          streetNumber: 77,
          postcode: '2000',
          listingType: 'rent' as const,
          dateDelisted: DateTime.now().minus({ days: 4 }),
          feedbackStatus: 'Visited',
          visitOutcome: 'Welcomed,Reschedule',
          visitor: 'Demo Visitor',
          dateOfVisit: DateTime.now().minus({ days: 2 }),
          visitNotes: 'New tenant, would like to attend Sunday service',
          rentalPrice: '$550/week',
          latitude: -33.8640,
          longitude: 151.2035,
          distanceFromChurch: 0.9,
        },
      ]

      for (const prop of sampleProperties) {
        await Property.create({
          churchId: demoChurch.id,
          ...prop,
        })
      }

      this.logger.success('Demo setup complete!')
      this.logger.info('')
      this.logger.info('Demo Church Details:')
      this.logger.info(`  Church: ${demoChurch.churchName}`)
      this.logger.info(`  Admin Email: demo-admin@gooddirections.com.au`)
      this.logger.info(`  Admin Password: demo123!`)
      this.logger.info('')
      this.logger.info(`  Visitor: Demo Visitor`)
      this.logger.info(`  Street Groups: ${streetGroup1.name}, ${streetGroup2.name}`)
      this.logger.info(`  Properties: ${sampleProperties.length}`)
      this.logger.info('')
      this.logger.info('Super admins can use the demo mode toggle to switch between')
      this.logger.info('church admin and visitor views when impersonating the demo church.')
    } catch (error) {
      this.logger.error(`Failed to setup demo: ${error.message}`)
      console.error(error)
    }
  }
}
