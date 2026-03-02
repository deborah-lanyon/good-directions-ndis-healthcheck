import Property from '#models/property'
import Church from '#models/church'
import db from '@adonisjs/lucid/services/db'

export interface AnalyticsFilter {
  month?: number // 1-12, undefined for all time
  year?: number // e.g., 2026, undefined for all time
}

export interface PropertyStats {
  totalProperties: number
  soldProperties: number
  rentedProperties: number
  visitedProperties: number
}

export interface OutcomeStats {
  welcomed: number
  packLeft: number
  reschedule: number
  notInterested: number
  notHome: number
  notVisited: number
}

export interface VisitorOutcome {
  visitorName: string
  totalAssigned: number
  outcomes: OutcomeStats
}

export interface AnalyticsResponse {
  propertyStats: PropertyStats
  outcomeStats: OutcomeStats
  visitorOutcomes: VisitorOutcome[]
  availableYears: number[]
  filter: AnalyticsFilter
}

// Super Admin Analytics Types
export interface ChurchAnalytics {
  churchId: number
  churchName: string
  ownerEmail: string
  totalProperties: number
  soldProperties: number
  rentedProperties: number
  visitedProperties: number
  pendingProperties: number
  outcomes: OutcomeStats
}

export interface SuperAdminAnalyticsResponse {
  totalChurches: number
  totalProperties: number
  totalVisited: number
  overallOutcomes: OutcomeStats
  churchAnalytics: ChurchAnalytics[]
  availableYears: number[]
  filter: AnalyticsFilter
}

export class AnalyticsService {
  // Super Admin Analytics - overview of all churches
  async getSuperAdminAnalytics(filter: AnalyticsFilter): Promise<SuperAdminAnalyticsResponse> {
    const [churchAnalytics, overallOutcomes, availableYears] = await Promise.all([
      this.getChurchAnalytics(filter),
      this.getOverallOutcomeStats(filter),
      this.getAllAvailableYears(),
    ])

    const totalChurches = churchAnalytics.length
    const totalProperties = churchAnalytics.reduce((sum, c) => sum + c.totalProperties, 0)
    const totalVisited = churchAnalytics.reduce((sum, c) => sum + c.visitedProperties, 0)

    return {
      totalChurches,
      totalProperties,
      totalVisited,
      overallOutcomes,
      churchAnalytics,
      availableYears,
      filter,
    }
  }

  private async getChurchAnalytics(filter: AnalyticsFilter): Promise<ChurchAnalytics[]> {
    // Get all churches with their users
    const churches = await Church.query().preload('user')

    const analytics: ChurchAnalytics[] = []

    for (const church of churches) {
      let query = Property.query().where('church_id', church.id)

      // Only include rentals that have been delisted
      query = query.where((q) => {
        q.where('listing_type', 'sold').orWhere((sub) => {
          sub.where('listing_type', 'rent').whereNotNull('date_delisted')
        })
      })

      query = this.applyDateFilter(query, filter)

      const properties = await query.select('listing_type', 'feedback_status')

      const soldCount = properties.filter((p) => p.listingType === 'sold').length
      const rentedCount = properties.filter((p) => p.listingType === 'rent').length

      // Calculate visited vs pending
      const visitedCount = properties.filter(
        (p) => p.feedbackStatus && p.feedbackStatus !== 'pending' && p.feedbackStatus !== 'No Answer'
      ).length
      const pendingCount = properties.length - visitedCount

      // Calculate outcomes from visit_outcome field (comma-separated values)
      const outcomes: OutcomeStats = {
        welcomed: 0,
        packLeft: 0,
        reschedule: 0,
        notInterested: 0,
        notHome: 0,
        notVisited: 0,
      }

      for (const prop of properties) {
        const status = prop.feedbackStatus || 'pending'
        if (status === 'Visited' && prop.visitOutcome) {
          // Parse comma-separated outcomes
          const visitOutcomes = prop.visitOutcome.split(',').map((o: string) => o.trim())
          for (const outcome of visitOutcomes) {
            switch (outcome) {
              case 'Welcomed':
                outcomes.welcomed++
                break
              case 'Pack left':
                outcomes.packLeft++
                break
              case 'Reschedule':
                outcomes.reschedule++
                break
              case 'Not Interested':
                outcomes.notInterested++
                break
              case 'Not home':
                outcomes.notHome++
                break
            }
          }
        } else if (status === 'pending' || status === 'Not Visited') {
          outcomes.notVisited++
        }
      }

      analytics.push({
        churchId: church.id,
        churchName: church.churchName || 'Unnamed Church',
        ownerEmail: church.user?.email || 'No owner',
        totalProperties: properties.length,
        soldProperties: soldCount,
        rentedProperties: rentedCount,
        visitedProperties: visitedCount,
        pendingProperties: pendingCount,
        outcomes,
      })
    }

    // Sort by total properties descending
    return analytics.sort((a, b) => b.totalProperties - a.totalProperties)
  }

  private async getOverallOutcomeStats(filter: AnalyticsFilter): Promise<OutcomeStats> {
    let query = Property.query()

    // Only include rentals that have been delisted
    query = query.where((q) => {
      q.where('listing_type', 'sold').orWhere((sub) => {
        sub.where('listing_type', 'rent').whereNotNull('date_delisted')
      })
    })

    query = this.applyDateFilter(query, filter)

    const properties = await query.select('feedback_status', 'visit_outcome')

    const stats: OutcomeStats = {
      welcomed: 0,
      packLeft: 0,
      reschedule: 0,
      notInterested: 0,
      notHome: 0,
      notVisited: 0,
    }

    for (const prop of properties) {
      const status = prop.feedbackStatus || 'pending'
      if (status === 'Visited' && prop.visitOutcome) {
        // Parse comma-separated outcomes
        const visitOutcomes = prop.visitOutcome.split(',').map((o: string) => o.trim())
        for (const outcome of visitOutcomes) {
          switch (outcome) {
            case 'Welcomed':
              stats.welcomed++
              break
            case 'Pack left':
              stats.packLeft++
              break
            case 'Reschedule':
              stats.reschedule++
              break
            case 'Not Interested':
              stats.notInterested++
              break
            case 'Not home':
              stats.notHome++
              break
          }
        }
      } else if (status === 'pending' || status === 'Not Visited') {
        stats.notVisited++
      }
    }

    return stats
  }

  private async getAllAvailableYears(): Promise<number[]> {
    const result = await db.rawQuery(
      `
      SELECT DISTINCT EXTRACT(YEAR FROM COALESCE(date_sold, date_delisted)) as year
      FROM properties
      WHERE (listing_type = 'sold' OR (listing_type = 'rent' AND date_delisted IS NOT NULL))
        AND COALESCE(date_sold, date_delisted) IS NOT NULL
      ORDER BY year DESC
    `
    )

    return result.rows.map((row: { year: string }) => Number(row.year)).filter((y: number) => y > 0)
  }

  // Church-specific analytics
  async getAnalytics(churchId: number, filter: AnalyticsFilter): Promise<AnalyticsResponse> {
    const [propertyStats, outcomeStats, visitorOutcomes, availableYears] = await Promise.all([
      this.getPropertyStats(churchId, filter),
      this.getOutcomeStats(churchId, filter),
      this.getVisitorOutcomes(churchId, filter),
      this.getAvailableYears(churchId),
    ])

    return {
      propertyStats,
      outcomeStats,
      visitorOutcomes,
      availableYears,
      filter,
    }
  }

  async getChurchByUserId(userId: number): Promise<Church> {
    const church = await Church.query().where('user_id', userId).first()
    if (!church) {
      throw new Error('Territory not found for user')
    }
    return church
  }

  private async getPropertyStats(churchId: number, filter: AnalyticsFilter): Promise<PropertyStats> {
    let query = Property.query().where('church_id', churchId)

    // Only include rentals that have been delisted (leased)
    query = query.where((q) => {
      q.where('listing_type', 'sold').orWhere((sub) => {
        sub.where('listing_type', 'rent').whereNotNull('date_delisted')
      })
    })

    // Apply date filter
    query = this.applyDateFilter(query, filter)

    const properties = await query.select('listing_type', 'date_of_visit')

    const soldCount = properties.filter((p) => p.listingType === 'sold').length
    const rentedCount = properties.filter((p) => p.listingType === 'rent').length
    const visitedCount = properties.filter((p) => p.dateOfVisit !== null).length

    return {
      totalProperties: properties.length,
      soldProperties: soldCount,
      rentedProperties: rentedCount,
      visitedProperties: visitedCount,
    }
  }

  private async getOutcomeStats(churchId: number, filter: AnalyticsFilter): Promise<OutcomeStats> {
    let query = Property.query().where('church_id', churchId)

    // Only include rentals that have been delisted
    query = query.where((q) => {
      q.where('listing_type', 'sold').orWhere((sub) => {
        sub.where('listing_type', 'rent').whereNotNull('date_delisted')
      })
    })

    query = this.applyDateFilter(query, filter)

    const properties = await query.select('feedback_status', 'visit_outcome')

    const stats: OutcomeStats = {
      welcomed: 0,
      packLeft: 0,
      reschedule: 0,
      notInterested: 0,
      notHome: 0,
      notVisited: 0,
    }

    for (const prop of properties) {
      const status = prop.feedbackStatus || 'pending'
      if (status === 'Visited' && prop.visitOutcome) {
        // Parse comma-separated outcomes
        const visitOutcomes = prop.visitOutcome.split(',').map((o: string) => o.trim())
        for (const outcome of visitOutcomes) {
          switch (outcome) {
            case 'Welcomed':
              stats.welcomed++
              break
            case 'Pack left':
              stats.packLeft++
              break
            case 'Reschedule':
              stats.reschedule++
              break
            case 'Not Interested':
              stats.notInterested++
              break
            case 'Not home':
              stats.notHome++
              break
          }
        }
      } else if (status === 'pending' || status === 'Not Visited') {
        stats.notVisited++
      }
    }

    return stats
  }

  private async getVisitorOutcomes(
    churchId: number,
    filter: AnalyticsFilter
  ): Promise<VisitorOutcome[]> {
    let query = Property.query().where('church_id', churchId).whereNotNull('visitor')

    // Only include rentals that have been delisted
    query = query.where((q) => {
      q.where('listing_type', 'sold').orWhere((sub) => {
        sub.where('listing_type', 'rent').whereNotNull('date_delisted')
      })
    })

    query = this.applyDateFilter(query, filter)

    const properties = await query.select('visitor', 'feedback_status', 'visit_outcome')

    // Group by visitor (visitor field can contain comma-separated names)
    const visitorMap = new Map<string, { total: number; outcomes: OutcomeStats }>()

    for (const prop of properties) {
      // Split by comma if multiple visitors
      const visitors = prop.visitor?.split(',').map((v) => v.trim()) || []

      for (const visitorName of visitors) {
        if (!visitorName) continue

        if (!visitorMap.has(visitorName)) {
          visitorMap.set(visitorName, {
            total: 0,
            outcomes: {
              welcomed: 0,
              packLeft: 0,
              reschedule: 0,
              notInterested: 0,
              notHome: 0,
              notVisited: 0,
            },
          })
        }

        const entry = visitorMap.get(visitorName)!
        entry.total++

        const status = prop.feedbackStatus || 'pending'
        if (status === 'Visited' && prop.visitOutcome) {
          // Parse comma-separated outcomes
          const visitOutcomes = prop.visitOutcome.split(',').map((o: string) => o.trim())
          for (const outcome of visitOutcomes) {
            switch (outcome) {
              case 'Welcomed':
                entry.outcomes.welcomed++
                break
              case 'Pack left':
                entry.outcomes.packLeft++
                break
              case 'Reschedule':
                entry.outcomes.reschedule++
                break
              case 'Not Interested':
                entry.outcomes.notInterested++
                break
              case 'Not home':
                entry.outcomes.notHome++
                break
            }
          }
        } else if (status === 'pending' || status === 'Not Visited') {
          entry.outcomes.notVisited++
        }
      }
    }

    // Convert to array and sort by total assigned
    return Array.from(visitorMap.entries())
      .map(([visitorName, data]) => ({
        visitorName,
        totalAssigned: data.total,
        outcomes: data.outcomes,
      }))
      .sort((a, b) => b.totalAssigned - a.totalAssigned)
  }

  private async getAvailableYears(churchId: number): Promise<number[]> {
    // Get distinct years from both dateSold and dateDelisted
    const result = await db.rawQuery(
      `
      SELECT DISTINCT EXTRACT(YEAR FROM COALESCE(date_sold, date_delisted)) as year
      FROM properties
      WHERE church_id = ?
        AND (listing_type = 'sold' OR (listing_type = 'rent' AND date_delisted IS NOT NULL))
        AND COALESCE(date_sold, date_delisted) IS NOT NULL
      ORDER BY year DESC
    `,
      [churchId]
    )

    return result.rows.map((row: { year: string }) => Number(row.year)).filter((y: number) => y > 0)
  }

  private applyDateFilter<T extends ReturnType<typeof Property.query>>(
    query: T,
    filter: AnalyticsFilter
  ): T {
    if (filter.month !== undefined && filter.year !== undefined) {
      // Filter by specific month and year
      query = query.whereRaw(
        'EXTRACT(MONTH FROM COALESCE(date_sold, date_delisted)) = ?',
        [filter.month]
      ) as T
      query = query.whereRaw(
        'EXTRACT(YEAR FROM COALESCE(date_sold, date_delisted)) = ?',
        [filter.year]
      ) as T
    } else if (filter.year !== undefined) {
      // Filter by year only
      query = query.whereRaw(
        'EXTRACT(YEAR FROM COALESCE(date_sold, date_delisted)) = ?',
        [filter.year]
      ) as T
    }
    // If neither month nor year specified, return all data (all time)

    return query
  }
}
