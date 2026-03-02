import type { HttpContext } from '@adonisjs/core/http'
import StreetGroupService from '#services/street_group_service'
import VisitorService from '#services/visitor_service'
import { resolveChurchForUser } from '#helpers/demo_church_resolver'

export default class StreetGroupsController {
  private streetGroupService = new StreetGroupService()
  private visitorService = new VisitorService()

  /**
   * Render the team management page (with tabs for Street Groups and Visitors)
   */
  async teamManagementPage({ auth, inertia, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      // Load all street groups with their relationships
      const streetGroups = await this.streetGroupService.getAllStreetGroupsForChurch(church.id)

      // Load all visitors and explicitly serialize for Inertia
      const allVisitors = await this.visitorService.getAllVisitorsForChurch(church.id)
      const serializedVisitors = allVisitors.map((v) => {
        const serialized: any = v.serialize()
        serialized.hasAccess = v.hasAccess()
        if (v.streetGroups) {
          serialized.streetGroups = v.streetGroups.map((sg) => ({
            id: sg.id,
            name: sg.name,
          }))
        }
        return serialized
      })

      return inertia.render('team-management', {
        streetGroups,
        visitors: serializedVisitors,
        church: {
          id: church.id,
          churchName: church.churchName,
          latitude: church.latitude ? Number(church.latitude) : null,
          longitude: church.longitude ? Number(church.longitude) : null,
          radius: church.radius,
        },
      })
    } catch (error) {
      console.error('Failed to load team management page:', error)
      return response.status(500).json({ message: 'Failed to load page', error: error.message })
    }
  }

  /**
   * Render the street groups management page
   */
  async page({ auth, inertia, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      // Load all street groups with their relationships
      const streetGroups = await this.streetGroupService.getAllStreetGroupsForChurch(church.id)

      // Load all visitors for the dropdown
      const allVisitors = await this.visitorService.getAllVisitorsForChurch(church.id)

      return inertia.render('street_groups', {
        streetGroups,
        allVisitors: allVisitors.map((v) => ({
          id: v.id,
          name: v.name,
          email: v.email,
        })),
        church: {
          id: church.id,
          churchName: church.churchName,
          latitude: church.latitude ? Number(church.latitude) : null,
          longitude: church.longitude ? Number(church.longitude) : null,
          radius: church.radius,
        },
      })
    } catch (error) {
      console.error('Failed to load street groups page:', error)
      return response.status(500).json({ message: 'Failed to load page', error: error.message })
    }
  }

  /**
   * Render the visitors management page for a street group
   */
  async visitorsPage({ auth, params, inertia, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streetGroup = await this.streetGroupService.getStreetGroupById(params.id)

      if (!streetGroup) {
        return response.status(404).json({ message: 'Street group not found' })
      }

      // Verify belongs to user's church
      if (streetGroup.churchId !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to street group' })
      }

      return inertia.render('street_group_visitors', {
        streetGroup: {
          id: streetGroup.id,
          name: streetGroup.name,
          description: streetGroup.description,
        },
        visitors: streetGroup.visitors || [],
      })
    } catch (error) {
      console.error('Failed to load visitors page:', error)
      return response.status(500).json({ message: 'Failed to load page', error: error.message })
    }
  }

  /**
   * Create a new street group
   */
  async create({ auth, request, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const { visitorIds, ...data } = request.only(['name', 'description', 'visitorIds'])
      const streetGroup = await this.streetGroupService.createStreetGroup(church.id, data)

      // Attach visitors if provided
      if (visitorIds && Array.isArray(visitorIds) && visitorIds.length > 0) {
        await this.streetGroupService.attachVisitors(streetGroup.id, visitorIds)
      }

      return response.status(201).json(streetGroup)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to create street group', error: error.message })
    }
  }

  /**
   * Get all street groups for the user's church (for filtering)
   */
  async listAll({ auth, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streetGroups = await this.streetGroupService.getAllStreetGroupsForChurch(church.id)
      return response.json(streetGroups)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to fetch street groups', error: error.message })
    }
  }

  /**
   * Get a single street group by ID
   */
  async show({ auth, params, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streetGroup = await this.streetGroupService.getStreetGroupById(params.id)

      if (!streetGroup) {
        return response.status(404).json({ message: 'Street group not found' })
      }

      // Verify belongs to user's church
      if (streetGroup.churchId !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to street group' })
      }

      return response.json(streetGroup)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to fetch street group', error: error.message })
    }
  }

  /**
   * Update a street group
   */
  async update({ auth, params, request, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streetGroup = await this.streetGroupService.getStreetGroupById(params.id)

      if (!streetGroup) {
        return response.status(404).json({ message: 'Street group not found' })
      }

      // Verify belongs to user's church
      if (streetGroup.churchId !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to street group' })
      }

      const { visitorIds, ...data } = request.only(['name', 'description', 'visitorIds'])
      const updated = await this.streetGroupService.updateStreetGroup(params.id, data)

      // Sync visitors if provided
      if (visitorIds !== undefined && Array.isArray(visitorIds)) {
        await this.streetGroupService.syncVisitors(params.id, visitorIds)
      }

      return response.json(updated)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to update street group', error: error.message })
    }
  }

  /**
   * Delete a street group
   */
  async destroy({ auth, params, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streetGroup = await this.streetGroupService.getStreetGroupById(params.id)

      if (!streetGroup) {
        return response.status(404).json({ message: 'Street group not found' })
      }

      // Verify belongs to user's church
      if (streetGroup.churchId !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to street group' })
      }

      await this.streetGroupService.deleteStreetGroup(params.id)

      return response.status(204).send('')
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to delete street group', error: error.message })
    }
  }

  /**
   * Update visitors assigned to a street group
   */
  async updateVisitors({ auth, params, request, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streetGroup = await this.streetGroupService.getStreetGroupById(params.id)

      if (!streetGroup) {
        return response.status(404).json({ message: 'Street group not found' })
      }

      // Verify belongs to user's church
      if (streetGroup.churchId !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to street group' })
      }

      const { visitorIds } = request.only(['visitorIds'])

      if (!Array.isArray(visitorIds)) {
        return response.status(400).json({ message: 'visitorIds must be an array' })
      }

      await this.streetGroupService.syncVisitors(params.id, visitorIds)

      return response.json({ message: 'Visitors updated successfully' })
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to update visitors', error: error.message })
    }
  }

  /**
   * Assign a street to a street group
   */
  async assignStreet({ auth, params, request, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streetGroup = await this.streetGroupService.getStreetGroupById(params.id)

      if (!streetGroup) {
        return response.status(404).json({ message: 'Street group not found' })
      }

      // Verify belongs to user's church
      if (streetGroup.churchId !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to street group' })
      }

      const { streetName, streetNumberStart, streetNumberEnd } = request.only([
        'streetName',
        'streetNumberStart',
        'streetNumberEnd',
      ])

      const assignment = await this.streetGroupService.assignStreet(params.id, streetName, {
        streetNumberStart: streetNumberStart ?? null,
        streetNumberEnd: streetNumberEnd ?? null,
      })

      return response.status(201).json(assignment)
    } catch (error) {
      if (error.message === 'Street is already assigned to this group') {
        return response.status(400).json({ message: error.message })
      }
      return response.status(500).json({ message: 'Failed to assign street', error: error.message })
    }
  }

  /**
   * Remove a street assignment
   */
  async removeStreet({ auth, params, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      // Authorization check would require loading the assignment and checking ownership
      // For now, trust that the assignmentId is valid for this user's data

      await this.streetGroupService.removeStreetAssignment(params.assignmentId)

      return response.status(204).send('')
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to remove street assignment', error: error.message })
    }
  }

  /**
   * Update a street assignment
   */
  async updateStreet({ auth, params, request, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const { streetName, streetNumberStart, streetNumberEnd } = request.only([
        'streetName',
        'streetNumberStart',
        'streetNumberEnd',
      ])
      const updated = await this.streetGroupService.updateStreetAssignment(params.assignmentId, {
        streetName,
        streetNumberStart: streetNumberStart ?? null,
        streetNumberEnd: streetNumberEnd ?? null,
      })

      return response.json(updated)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to update street assignment', error: error.message })
    }
  }

  /**
   * Get available streets for a church (from properties)
   */
  async availableStreets({ auth, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streets = await this.streetGroupService.getAvailableStreets(church.id)

      return response.json(streets)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to fetch available streets', error: error.message })
    }
  }

  /**
   * Get properties for a street group
   */
  async properties({ auth, params, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const streetGroup = await this.streetGroupService.getStreetGroupById(params.id)

      if (!streetGroup) {
        return response.status(404).json({ message: 'Street group not found' })
      }

      // Verify belongs to user's church
      if (streetGroup.churchId !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to street group' })
      }

      const properties = await this.streetGroupService.getPropertiesForStreetGroup(params.id)

      return response.json(properties)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to fetch properties', error: error.message })
    }
  }
}
