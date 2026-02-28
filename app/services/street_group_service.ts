import StreetGroup from '#models/street_group'
import StreetAssignment from '#models/street_assignment'
import Church from '#models/church'
import Property from '#models/property'
import Visitor from '#models/visitor'
import { MailService } from '#services/mail_service'
import { normalizeStreetName } from '#helpers/street_name'

export default class StreetGroupService {
  private mailService: MailService

  constructor(mailService?: MailService) {
    this.mailService = mailService ?? new MailService()
  }
  /**
   * Get all street groups for a church
   */
  async getAllStreetGroupsForChurch(churchId: number) {
    const streetGroups = await StreetGroup.query()
      .where('church_id', churchId)
      .preload('streetAssignments')
      .preload('visitors')
      .orderBy('name', 'asc')

    // Format for frontend with all relationships (including number ranges and createdAt)
    return streetGroups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      streetAssignments: group.streetAssignments.map((assignment) => ({
        id: assignment.id,
        streetName: assignment.streetName,
        streetNumberStart: assignment.streetNumberStart,
        streetNumberEnd: assignment.streetNumberEnd,
        createdAt: assignment.createdAt?.toISO() || null,
      })),
      visitors: group.visitors.map((visitor) => ({
        id: visitor.id,
        name: visitor.name,
      })),
    }))
  }

  /**
   * Get a single street group by ID
   */
  async getStreetGroupById(streetGroupId: number): Promise<StreetGroup | null> {
    return await StreetGroup.query()
      .where('id', streetGroupId)
      .preload('church')
      .preload('streetAssignments')
      .preload('visitors')
      .first()
  }

  /**
   * Create a new street group
   */
  async createStreetGroup(
    churchId: number,
    data: {
      name: string
      description?: string
    }
  ): Promise<StreetGroup> {
    // Validate church exists
    const church = await Church.find(churchId)
    if (!church) {
      throw new Error('Church not found')
    }

    const streetGroup = await StreetGroup.create({
      churchId,
      name: data.name,
      description: data.description || null,
    })

    return streetGroup
  }

  /**
   * Update a street group
   */
  async updateStreetGroup(
    streetGroupId: number,
    data: {
      name?: string
      description?: string
    }
  ): Promise<StreetGroup> {
    const streetGroup = await StreetGroup.find(streetGroupId)
    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    if (data.name !== undefined) streetGroup.name = data.name
    if (data.description !== undefined) streetGroup.description = data.description

    await streetGroup.save()
    return streetGroup
  }

  /**
   * Attach visitors to a street group and send notification emails
   */
  async attachVisitors(streetGroupId: number, visitorIds: number[]): Promise<void> {
    const streetGroup = await StreetGroup.query()
      .where('id', streetGroupId)
      .preload('streetAssignments')
      .preload('church')
      .first()

    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    await streetGroup.related('visitors').attach(visitorIds)

    // Send notification to newly attached visitors
    if (visitorIds.length > 0) {
      const visitors = await Visitor.query().whereIn('id', visitorIds)
      const streetNames = streetGroup.streetAssignments.map((a) => a.streetName)
      const normalizedNames = streetNames.map((name) => normalizeStreetName(name))

      // Get properties on the assigned streets (normalized matching)
      let properties: Array<{ address: string; dateSold: string }> = []
      if (normalizedNames.length > 0) {
        const allProps = await Property.query()
          .where('church_id', streetGroup.church.id)
          .whereNotNull('street_name')
          .orderBy('date_sold', 'desc')

        properties = allProps
          .filter((p) => p.streetName && normalizedNames.includes(normalizeStreetName(p.streetName)))
          .map((p) => ({
            address: p.address,
            dateSold: p.dateSold?.toFormat('dd/MM/yyyy') || 'N/A',
          }))
      }

      // Send notification to each visitor (don't await to avoid blocking)
      for (const visitor of visitors) {
        this.mailService
          .sendVisitorStreetGroupAssignment(visitor, streetGroup.name, streetNames, properties)
          .catch((err) => console.error(`Failed to send street group assignment notification:`, err))
      }
    }
  }

  /**
   * Detach visitors from a street group
   */
  async detachVisitors(streetGroupId: number, visitorIds: number[]): Promise<void> {
    const streetGroup = await StreetGroup.find(streetGroupId)
    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    await streetGroup.related('visitors').detach(visitorIds)
  }

  /**
   * Sync visitors for a street group (replaces all assignments)
   */
  async syncVisitors(streetGroupId: number, visitorIds: number[]): Promise<void> {
    const streetGroup = await StreetGroup.find(streetGroupId)
    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    await streetGroup.related('visitors').sync(visitorIds)
  }

  /**
   * Delete a street group (cascade deletes street assignments and visitors)
   */
  async deleteStreetGroup(streetGroupId: number): Promise<void> {
    const streetGroup = await StreetGroup.find(streetGroupId)
    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    await streetGroup.delete()
  }

  /**
   * Assign a street to a street group with optional number range
   * Sends notification to all visitors assigned to the group
   */
  async assignStreet(
    streetGroupId: number,
    streetName: string,
    options?: {
      streetNumberStart?: number | null
      streetNumberEnd?: number | null
    }
  ): Promise<StreetAssignment> {
    // Validate and clean street name input
    const cleanedStreetName = streetName.trim()
    if (!cleanedStreetName) {
      throw new Error('Street name cannot be empty')
    }
    if (cleanedStreetName.length > 200) {
      throw new Error('Street name is too long (max 200 characters)')
    }

    // Validate street group exists and load visitors
    const streetGroup = await StreetGroup.query()
      .where('id', streetGroupId)
      .preload('visitors')
      .preload('church')
      .first()

    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    // Check if exact same assignment already exists (same street name AND same number range)
    const existing = await StreetAssignment.query()
      .where('street_group_id', streetGroupId)
      .whereRaw('LOWER(street_name) = LOWER(?)', [cleanedStreetName])
      .where((query) => {
        if (options?.streetNumberStart !== undefined && options.streetNumberStart !== null) {
          query.where('street_number_start', options.streetNumberStart)
        } else {
          query.whereNull('street_number_start')
        }
      })
      .where((query) => {
        if (options?.streetNumberEnd !== undefined && options.streetNumberEnd !== null) {
          query.where('street_number_end', options.streetNumberEnd)
        } else {
          query.whereNull('street_number_end')
        }
      })
      .first()

    if (existing) {
      throw new Error('Street is already assigned to this group with the same number range')
    }

    const assignment = await StreetAssignment.create({
      streetGroupId,
      streetName: cleanedStreetName,
      streetNumberStart: options?.streetNumberStart ?? null,
      streetNumberEnd: options?.streetNumberEnd ?? null,
    })

    // Notify visitors assigned to this group about the new street
    if (streetGroup.visitors && streetGroup.visitors.length > 0) {
      // Get properties on this street
      const props = await Property.query()
        .where('church_id', streetGroup.church.id)
        .whereRaw('LOWER(street_name) = LOWER(?)', [cleanedStreetName])
        .orderBy('date_sold', 'desc')

      const properties = props.map((p) => ({
        address: p.address,
        dateSold: p.dateSold?.toFormat('dd/MM/yyyy') || 'N/A',
      }))

      // Send notification to each visitor (don't await to avoid blocking)
      for (const visitor of streetGroup.visitors) {
        this.mailService
          .sendVisitorNewStreetNotification(visitor, streetGroup.name, cleanedStreetName, properties)
          .catch((err) => console.error(`Failed to send new street notification:`, err))
      }
    }

    return assignment
  }

  /**
   * Remove a street assignment
   */
  async removeStreetAssignment(assignmentId: number): Promise<void> {
    const assignment = await StreetAssignment.find(assignmentId)
    if (!assignment) {
      throw new Error('Street assignment not found')
    }

    await assignment.delete()
  }

  /**
   * Update a street assignment
   */
  async updateStreetAssignment(
    assignmentId: number,
    data: {
      streetName?: string
      streetNumberStart?: number | null
      streetNumberEnd?: number | null
    }
  ): Promise<StreetAssignment> {
    const assignment = await StreetAssignment.find(assignmentId)
    if (!assignment) {
      throw new Error('Street assignment not found')
    }

    if (data.streetName !== undefined) {
      assignment.streetName = data.streetName
    }
    if (data.streetNumberStart !== undefined) {
      assignment.streetNumberStart = data.streetNumberStart
    }
    if (data.streetNumberEnd !== undefined) {
      assignment.streetNumberEnd = data.streetNumberEnd
    }
    await assignment.save()

    return assignment
  }

  /**
   * Get available streets for a church (from properties)
   */
  async getAvailableStreets(churchId: number): Promise<string[]> {
    const church = await Church.find(churchId)
    if (!church) {
      throw new Error('Church not found')
    }

    if (!church.postcode) {
      return []
    }

    const db = StreetGroup.query().client
    const result = await db
      .from('properties')
      .select('street_name')
      .whereNotNull('street_name')
      .where('church_id', church.id)
      .where('postcode', church.postcode)
      .distinct()
      .orderBy('street_name', 'asc')

    return result.map((row: any) => row.street_name)
  }

  /**
   * Get properties for a street group
   */
  async getPropertiesForStreetGroup(streetGroupId: number): Promise<Property[]> {
    const streetGroup = await StreetGroup.query()
      .where('id', streetGroupId)
      .preload('streetAssignments')
      .preload('church')
      .first()

    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    const streetAssignments = streetGroup.streetAssignments

    if (streetAssignments.length === 0) {
      return []
    }

    const normalizedNames = streetAssignments.map((a) => normalizeStreetName(a.streetName))

    // Fetch all properties for this church, then filter by normalized street name
    const allProperties = await Property.query()
      .where('church_id', streetGroup.church.id)
      .whereNotNull('street_name')
      .orderBy('address', 'asc')

    return allProperties.filter(
      (p) => p.streetName && normalizedNames.includes(normalizeStreetName(p.streetName))
    )
  }
}
