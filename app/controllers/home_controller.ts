import type { HttpContext } from '@adonisjs/core/http'
import { SiteSettingsService } from '#services/site_settings_service'
import { MailCampaignService } from '#services/mail_campaign_service'
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

    let campaigns: any[] = []
    let stats = {
      totalCampaigns: 0,
      postedCampaigns: 0,
      totalPacksSent: 0,
      totalResponses: 0,
      conversionRate: '0.0',
    }

    if (church) {
      const campaignService = new MailCampaignService()
      ;[campaigns, stats] = await Promise.all([
        campaignService.getCampaignsForChurch(church.id),
        campaignService.getCampaignStats(church.id),
      ])
    }

    return inertia.render('dashboard', {
      churchName: church?.churchName || '',
      stats,
      campaigns: campaigns.slice(0, 5),
    })
  }
}
