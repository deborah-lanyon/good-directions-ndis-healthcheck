import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'site_settings'

  async up() {
    this.defer(async (db) => {
      await db.from(this.tableName).update({
        hero_title: 'Moving home? Your NDIS plan moves with you.',
        hero_paragraph_1:
          'Relocating with a high-level NDIS plan can feel overwhelming — especially when your family depends on 24/7 in-home care for complex disabilities. The NDIS Healthcheck gives you confidence that your supports, funding, and care team will transition smoothly to your new location.',
        hero_paragraph_2:
          'We help families navigate the details that matter most: continuity of therapies, handover between providers, updated service agreements, and ensuring nothing falls through the cracks during the move. Because when care is this important, there\'s no room for disruption.',
        hero_paragraph_3:
          'Get a free NDIS Healthcheck and take the uncertainty out of your next move.',
        cta_title: 'Get Your Free Healthcheck Now',
        cta_button_text: 'Get Started',
        about_us_title: 'About Us',
        about_us_paragraph_1:
          'Good Directions is an established registered NDIS Service Provider set up to allow participants to develop and maintain 100% person centred supports.',
        about_us_paragraph_2:
          'Our vision is to apply our model of Good Directions Participant-owned Disability Service Provider and continually find new ways for participants to own and manage more of their personal resources. We do this through a shared management approach that enables people to live their lives in a way that they choose, with the right support.',
        about_us_paragraph_3:
          'Good Directions Participant-Owned Disability Service model has earned very high accolades. Recent Quality Assurance Audits (QAA) have awarded Good Directions with four best practice areas, and described Good Directions as taking choice and control to the next level.',
        about_us_intro:
          'Good Directions is an established registered NDIS Service Provider set up to allow participants to develop and maintain 100% person centred supports.',
        about_us_mission:
          'Our vision is to apply our model of Good Directions Participant-owned Disability Service Provider and continually find new ways for participants to own and manage more of their personal resources.',
        about_us_vision:
          'We envision a world where every NDIS participant has true choice and control over their supports, with a level of service that exceeds expectations.',
        about_us_contact:
          'For questions or support, please contact us through the registration form.',
      })
    })
  }

  async down() {}
}
