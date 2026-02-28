import SiteSettings from '#models/site_settings'

export class SiteSettingsService {
  /**
   * Get or create site settings (singleton pattern - only one row)
   */
  async getOrCreateSettings(): Promise<SiteSettings> {
    let settings = await SiteSettings.first()

    if (!settings) {
      settings = await SiteSettings.create({
        heroTitle: SiteSettings.DEFAULTS.heroTitle,
        heroParagraph1: SiteSettings.DEFAULTS.heroParagraph1,
        heroParagraph2: SiteSettings.DEFAULTS.heroParagraph2,
        heroParagraph3: SiteSettings.DEFAULTS.heroParagraph3,
        ctaTitle: SiteSettings.DEFAULTS.ctaTitle,
        ctaButtonText: SiteSettings.DEFAULTS.ctaButtonText,
        // How To Use fields
        howToUseTitle: SiteSettings.DEFAULTS.howToUseTitle,
        howToUseIntro: SiteSettings.DEFAULTS.howToUseIntro,
        howToUseStep1Title: SiteSettings.DEFAULTS.howToUseStep1Title,
        howToUseStep1Content: SiteSettings.DEFAULTS.howToUseStep1Content,
        howToUseStep2Title: SiteSettings.DEFAULTS.howToUseStep2Title,
        howToUseStep2Content: SiteSettings.DEFAULTS.howToUseStep2Content,
        howToUseStep3Title: SiteSettings.DEFAULTS.howToUseStep3Title,
        howToUseStep3Content: SiteSettings.DEFAULTS.howToUseStep3Content,
        howToUseStep4Title: SiteSettings.DEFAULTS.howToUseStep4Title,
        howToUseStep4Content: SiteSettings.DEFAULTS.howToUseStep4Content,
        // About Us fields
        aboutUsTitle: SiteSettings.DEFAULTS.aboutUsTitle,
        aboutUsIntro: SiteSettings.DEFAULTS.aboutUsIntro,
        aboutUsMission: SiteSettings.DEFAULTS.aboutUsMission,
        aboutUsVision: SiteSettings.DEFAULTS.aboutUsVision,
        aboutUsContact: SiteSettings.DEFAULTS.aboutUsContact,
        aboutUsParagraph1: SiteSettings.DEFAULTS.aboutUsParagraph1,
        aboutUsParagraph2: SiteSettings.DEFAULTS.aboutUsParagraph2,
        aboutUsParagraph3: SiteSettings.DEFAULTS.aboutUsParagraph3,
      })
    }

    return settings
  }

  /**
   * Update site settings
   */
  async updateSettings(
    data: Partial<{
      heroTitle: string
      heroParagraph1: string | null
      heroParagraph2: string | null
      heroParagraph3: string | null
      ctaTitle: string
      ctaButtonText: string
      heroImageUrl: string | null
      // How To Use fields
      howToUseTitle: string
      howToUseIntro: string | null
      howToUseStep1Title: string | null
      howToUseStep1Content: string | null
      howToUseStep2Title: string | null
      howToUseStep2Content: string | null
      howToUseStep3Title: string | null
      howToUseStep3Content: string | null
      howToUseStep4Title: string | null
      howToUseStep4Content: string | null
      // About Us fields
      aboutUsTitle: string
      aboutUsIntro: string | null
      aboutUsMission: string | null
      aboutUsVision: string | null
      aboutUsContact: string | null
      aboutUsParagraph1: string | null
      aboutUsParagraph2: string | null
      aboutUsParagraph3: string | null
    }>
  ): Promise<SiteSettings> {
    const settings = await this.getOrCreateSettings()

    // Filter out empty strings for required fields, use defaults instead
    const cleanedData = { ...data }

    // For required string fields, if empty string is provided, use the default
    if (cleanedData.heroTitle === '') {
      cleanedData.heroTitle = SiteSettings.DEFAULTS.heroTitle
    }
    if (cleanedData.ctaTitle === '') {
      cleanedData.ctaTitle = SiteSettings.DEFAULTS.ctaTitle
    }
    if (cleanedData.ctaButtonText === '') {
      cleanedData.ctaButtonText = SiteSettings.DEFAULTS.ctaButtonText
    }
    if (cleanedData.howToUseTitle === '') {
      cleanedData.howToUseTitle = SiteSettings.DEFAULTS.howToUseTitle
    }
    if (cleanedData.aboutUsTitle === '') {
      cleanedData.aboutUsTitle = SiteSettings.DEFAULTS.aboutUsTitle
    }

    settings.merge(cleanedData)
    await settings.save()

    return settings
  }

  /**
   * Get settings formatted for the home page with fallbacks to defaults
   */
  async getSettingsForHomePage(): Promise<{
    heroTitle: string
    heroParagraph1: string
    heroParagraph2: string
    heroParagraph3: string
    ctaTitle: string
    ctaButtonText: string
    heroImageUrl: string | null
  }> {
    const settings = await this.getOrCreateSettings()

    return {
      heroTitle: settings.heroTitle || SiteSettings.DEFAULTS.heroTitle,
      heroParagraph1: settings.heroParagraph1 || SiteSettings.DEFAULTS.heroParagraph1,
      heroParagraph2: settings.heroParagraph2 || SiteSettings.DEFAULTS.heroParagraph2,
      heroParagraph3: settings.heroParagraph3 || SiteSettings.DEFAULTS.heroParagraph3,
      ctaTitle: settings.ctaTitle || SiteSettings.DEFAULTS.ctaTitle,
      ctaButtonText: settings.ctaButtonText || SiteSettings.DEFAULTS.ctaButtonText,
      heroImageUrl: settings.heroImageUrl,
    }
  }

  /**
   * Get settings formatted for the How To Use page with fallbacks to defaults
   */
  async getSettingsForHowToUsePage(): Promise<{
    title: string
    intro: string
    step1Title: string
    step1Content: string
    step2Title: string
    step2Content: string
    step3Title: string
    step3Content: string
    step4Title: string
    step4Content: string
  }> {
    const settings = await this.getOrCreateSettings()

    return {
      title: settings.howToUseTitle || SiteSettings.DEFAULTS.howToUseTitle,
      intro: settings.howToUseIntro || SiteSettings.DEFAULTS.howToUseIntro,
      step1Title: settings.howToUseStep1Title || SiteSettings.DEFAULTS.howToUseStep1Title,
      step1Content: settings.howToUseStep1Content || SiteSettings.DEFAULTS.howToUseStep1Content,
      step2Title: settings.howToUseStep2Title || SiteSettings.DEFAULTS.howToUseStep2Title,
      step2Content: settings.howToUseStep2Content || SiteSettings.DEFAULTS.howToUseStep2Content,
      step3Title: settings.howToUseStep3Title || SiteSettings.DEFAULTS.howToUseStep3Title,
      step3Content: settings.howToUseStep3Content || SiteSettings.DEFAULTS.howToUseStep3Content,
      step4Title: settings.howToUseStep4Title || SiteSettings.DEFAULTS.howToUseStep4Title,
      step4Content: settings.howToUseStep4Content || SiteSettings.DEFAULTS.howToUseStep4Content,
    }
  }

  /**
   * Get settings formatted for the About Us page with fallbacks to defaults
   */
  async getSettingsForAboutUsPage(): Promise<{
    title: string
    paragraph1: string
    paragraph2: string
    paragraph3: string
  }> {
    const settings = await this.getOrCreateSettings()

    return {
      title: settings.aboutUsTitle || SiteSettings.DEFAULTS.aboutUsTitle,
      paragraph1: settings.aboutUsParagraph1 || SiteSettings.DEFAULTS.aboutUsParagraph1,
      paragraph2: settings.aboutUsParagraph2 || '',
      paragraph3: settings.aboutUsParagraph3 || '',
    }
  }
}
