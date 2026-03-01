import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SiteSettings extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare heroTitle: string

  @column({ columnName: 'hero_paragraph_1' })
  declare heroParagraph1: string | null

  @column({ columnName: 'hero_paragraph_2' })
  declare heroParagraph2: string | null

  @column({ columnName: 'hero_paragraph_3' })
  declare heroParagraph3: string | null

  @column()
  declare ctaTitle: string

  @column()
  declare ctaButtonText: string

  @column()
  declare heroImageUrl: string | null

  // How To Use page fields
  @column()
  declare howToUseTitle: string

  @column()
  declare howToUseIntro: string | null

  @column({ columnName: 'how_to_use_step1_title' })
  declare howToUseStep1Title: string | null

  @column({ columnName: 'how_to_use_step1_content' })
  declare howToUseStep1Content: string | null

  @column({ columnName: 'how_to_use_step2_title' })
  declare howToUseStep2Title: string | null

  @column({ columnName: 'how_to_use_step2_content' })
  declare howToUseStep2Content: string | null

  @column({ columnName: 'how_to_use_step3_title' })
  declare howToUseStep3Title: string | null

  @column({ columnName: 'how_to_use_step3_content' })
  declare howToUseStep3Content: string | null

  @column({ columnName: 'how_to_use_step4_title' })
  declare howToUseStep4Title: string | null

  @column({ columnName: 'how_to_use_step4_content' })
  declare howToUseStep4Content: string | null

  // About Us page fields
  @column()
  declare aboutUsTitle: string

  @column()
  declare aboutUsIntro: string | null

  @column()
  declare aboutUsMission: string | null

  @column()
  declare aboutUsVision: string | null

  @column()
  declare aboutUsContact: string | null

  @column({ columnName: 'about_us_paragraph_1' })
  declare aboutUsParagraph1: string | null

  @column({ columnName: 'about_us_paragraph_2' })
  declare aboutUsParagraph2: string | null

  @column({ columnName: 'about_us_paragraph_3' })
  declare aboutUsParagraph3: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Default content values for the home page
   */
  static readonly DEFAULTS = {
    heroTitle: 'Reach those in your community',
    heroParagraph1:
      'Welcome to the Good Directions NDIS Healthcheck—a platform designed to help organisations connect with new residents in their local area. When families move into your community, they often need guidance, support, and a warm welcome as they settle in.',
    heroParagraph2:
      "Our portal helps you identify new properties in your neighbourhood and reach out with essential information about local services, community resources, and opportunities to connect. Whether it's helping them find the nearest school, introducing them to local groups, or simply offering a friendly face, your organisation can make a meaningful difference in their transition.",
    heroParagraph3:
      'Join us in building stronger, more connected communities—one welcome at a time.',
    ctaTitle: 'Ready to welcome your community?',
    ctaButtonText: 'Submit',
    // How To Use defaults
    howToUseTitle: 'How To Use',
    howToUseIntro:
      'Getting started with the Good Directions NDIS Healthcheck is easy. Follow these simple steps to begin welcoming new residents in your community.',
    howToUseStep1Title: 'Register Your Organisation',
    howToUseStep1Content:
      "Sign up for an account and provide your organisation details. Once approved, you'll have access to all the portal features.",
    howToUseStep2Title: 'Set Up Your Profile',
    howToUseStep2Content:
      'Complete your organisation profile with your location, contact information, and customize your welcome pack template.',
    howToUseStep3Title: 'Find New Properties',
    howToUseStep3Content:
      'Use the property dashboard to discover new residents in your area. The system automatically identifies recently sold properties near your organisation.',
    howToUseStep4Title: 'Welcome Your Neighbours',
    howToUseStep4Content:
      'Generate personalized welcome packs and reach out to new residents with helpful information about your community.',
    // About Us defaults
    aboutUsTitle: 'About Us',
    aboutUsIntro:
      'The Good Directions NDIS Healthcheck was created to help organisations connect with new residents in their local communities.',
    aboutUsMission:
      'Our mission is to empower organisations to be a welcoming presence for families moving into new neighbourhoods, providing them with valuable local information and a friendly connection.',
    aboutUsVision:
      'We envision communities where every new resident feels welcomed and supported, with local organisations serving as a bridge to community resources and connections.',
    aboutUsContact:
      'For questions or support, please contact us through the registration form or reach out to your local organisation administrator.',
    aboutUsParagraph1:
      'The Good Directions NDIS Healthcheck was created to help organisations connect with new residents in their local communities.',
    aboutUsParagraph2: '',
    aboutUsParagraph3: '',
  }
}
