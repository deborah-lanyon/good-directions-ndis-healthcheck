import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'site_settings'

  async up() {
    this.defer(async (db) => {
      await db.rawQuery(
        `UPDATE ${this.tableName} SET
          hero_title = 'Moving home? Your NDIS plan moves with you.',
          hero_paragraph_1 = 'Relocating with a high-level NDIS plan can feel overwhelming — especially when your family depends on 24/7 in-home care for complex disabilities. The NDIS Healthcheck gives you confidence that your supports, funding, and care team will transition smoothly to your new location.',
          hero_paragraph_2 = 'We help families navigate the details that matter most: continuity of therapies, handover between providers, updated service agreements, and ensuring nothing falls through the cracks during the move.',
          hero_paragraph_3 = 'Get a free NDIS Healthcheck and take the uncertainty out of your next move.',
          cta_title = 'Request Your NDIS Healthcheck Now',
          cta_button_text = 'Get Started'`
      )
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(
        `UPDATE ${this.tableName} SET
          hero_title = 'Reach those in your community',
          hero_paragraph_1 = NULL,
          hero_paragraph_2 = NULL,
          hero_paragraph_3 = NULL,
          cta_title = 'Ready to welcome your community?',
          cta_button_text = 'Submit'`
      )
    })
  }
}
