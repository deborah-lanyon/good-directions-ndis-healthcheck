import type { HttpContext } from '@adonisjs/core/http'
import { SiteSettingsService } from '#services/site_settings_service'
import Property from '#models/property'
import Visitor from '#models/visitor'
import StreetGroup from '#models/street_group'
import { resolveChurchForUser } from '#helpers/demo_church_resolver'

export default class HomeController {
  /**
   * Render home page with dynamic content from site settings
   */
  async index({ inertia }: HttpContext) {
    const siteSettingsService = new SiteSettingsService()
    const settings = await siteSettingsService.getSettingsForHomePage()

    return inertia.render('home', {
      siteSettings: settings,
    })
  }

  /**
   * Render How It Works page (public - logged out users)
   */
  async howItWorks({ inertia }: HttpContext) {
    const siteSettingsService = new SiteSettingsService()
    const content = await siteSettingsService.getSettingsForHowToUsePage()

    return inertia.render('how-it-works', {
      content: {
        ...content,
        title: 'How It Works',
      },
    })
  }

  /**
   * Render How To Use page (logged in users)
   */
  async howToUse({ inertia }: HttpContext) {
    const siteSettingsService = new SiteSettingsService()
    const content = await siteSettingsService.getSettingsForHowToUsePage()

    return inertia.render('how-to-use', {
      content,
    })
  }

  /**
   * Render About Us page with dynamic content from site settings
   */
  async aboutUs({ inertia }: HttpContext) {
    const siteSettingsService = new SiteSettingsService()
    const content = await siteSettingsService.getSettingsForAboutUsPage()

    return inertia.render('about-us', {
      content,
    })
  }

  /**
   * Render Hub dashboard with stats and quick access to all functional areas
   */
  async hub({ inertia, auth, session }: HttpContext) {
    const church = await resolveChurchForUser({ auth, session })

    const churchId = church?.id

    // Get stats for the dashboard
    let stats = {
      propertiesSold: 0,
      propertiesRented: 0,
      visitedProperties: 0,
      teamMembers: 0,
      streetGroups: 0,
    }

    if (churchId) {
      // Count sold properties (welcomeable)
      const soldPropertiesCount = await Property.query()
        .where('church_id', churchId)
        .where('listing_type', 'sold')
        .count('* as total')

      // Count rented properties (delisted rentals - welcomeable)
      const rentedPropertiesCount = await Property.query()
        .where('church_id', churchId)
        .where('listing_type', 'rent')
        .whereNotNull('date_delisted')
        .count('* as total')

      // Count visited properties - only welcomeable: sold OR delisted rentals
      const visitedPropertiesCount = await Property.query()
        .where('church_id', churchId)
        .whereNotNull('date_of_visit')
        .where((q) => {
          q.where('listing_type', 'sold').orWhere((sub) => {
            sub.where('listing_type', 'rent').whereNotNull('date_delisted')
          })
        })
        .count('* as total')

      // Count team members (visitors)
      const teamMembersCount = await Visitor.query()
        .where('church_id', churchId)
        .count('* as total')

      // Count street groups
      const streetGroupsCount = await StreetGroup.query()
        .where('church_id', churchId)
        .count('* as total')

      stats = {
        propertiesSold: Number(soldPropertiesCount[0].$extras.total) || 0,
        propertiesRented: Number(rentedPropertiesCount[0].$extras.total) || 0,
        visitedProperties: Number(visitedPropertiesCount[0].$extras.total) || 0,
        teamMembers: Number(teamMembersCount[0].$extras.total) || 0,
        streetGroups: Number(streetGroupsCount[0].$extras.total) || 0,
      }
    }

    return inertia.render('dashboard', {
      churchName: church?.churchName || '',
      stats,
    })
  }
}
