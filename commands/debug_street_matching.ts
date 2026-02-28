import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import Property from '#models/property'
import db from '@adonisjs/lucid/services/db'

export default class DebugStreetMatching extends BaseCommand {
  static commandName = 'debug:street-matching'
  static description = 'Debug street name matching between properties and street groups'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const churchId = await this.prompt.ask('Enter church ID to debug')

    this.logger.info(`Debugging street matching for church ${churchId}`)

    // Get all unique street names from properties
    const propertyStreets = await db
      .from('properties')
      .where('church_id', churchId)
      .select('street_name')
      .distinct()
      .orderBy('street_name')

    this.logger.info(`\nFound ${propertyStreets.length} unique streets in properties:`)
    propertyStreets.forEach((row: any) => {
      this.logger.info(`  - "${row.street_name}"`)
    })

    // Get all street assignments
    const streetAssignments = await db
      .from('street_assignments')
      .join('street_groups', 'street_assignments.street_group_id', 'street_groups.id')
      .join('territories', 'street_groups.territory_id', 'territories.id')
      .where('territories.church_id', churchId)
      .select('street_assignments.street_name', 'street_groups.name as group_name')
      .orderBy('street_assignments.street_name')

    this.logger.info(`\nFound ${streetAssignments.length} street assignments:`)
    streetAssignments.forEach((row: any) => {
      this.logger.info(`  - "${row.street_name}" (Group: ${row.group_name})`)
    })

    // Find streets that don't match
    const propertyStreetNames = new Set(propertyStreets.map((r: any) => r.street_name))
    const assignmentStreetNames = new Set(streetAssignments.map((r: any) => r.street_name))

    const unmatchedProperties = [...propertyStreetNames].filter(
      (name) => !assignmentStreetNames.has(name)
    )
    const unmatchedAssignments = [...assignmentStreetNames].filter(
      (name) => !propertyStreetNames.has(name)
    )

    if (unmatchedProperties.length > 0) {
      this.logger.warning(`\nStreets in properties but NOT in street groups:`)
      unmatchedProperties.forEach((name) => {
        this.logger.warning(`  - "${name}"`)
      })
    }

    if (unmatchedAssignments.length > 0) {
      this.logger.warning(`\nStreets in street groups but NOT in properties:`)
      unmatchedAssignments.forEach((name) => {
        this.logger.warning(`  - "${name}"`)
      })
    }

    // Check for case-insensitive near matches
    this.logger.info(`\n--- Checking for case-insensitive matches ---`)
    unmatchedProperties.forEach((propStreet) => {
      const propLower = propStreet.toLowerCase()
      const nearMatches = [...assignmentStreetNames].filter(
        (assignStreet) => assignStreet.toLowerCase() === propLower
      )
      if (nearMatches.length > 0) {
        this.logger.warning(
          `  Property "${propStreet}" might match assignment "${nearMatches[0]}" (case difference)`
        )
      }
    })

    // Sample some properties to show their full addresses
    const sampleProperties = await Property.query()
      .where('church_id', churchId)
      .limit(10)
      .select('address', 'street_name', 'postcode')

    this.logger.info(`\n--- Sample property addresses and extracted street names ---`)
    sampleProperties.forEach((prop) => {
      this.logger.info(`  Full address: "${prop.address}"`)
      this.logger.info(`  Extracted street: "${prop.streetName}"`)
      this.logger.info(`  Postcode: "${prop.postcode}"`)
      this.logger.info('')
    })
  }
}
