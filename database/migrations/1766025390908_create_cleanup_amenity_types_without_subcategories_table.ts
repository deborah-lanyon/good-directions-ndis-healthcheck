import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'amenity_types'

  async up() {
    // Delete all amenity types that don't have a subcategory
    // These are old records that should be replaced by the seeder
    this.defer(async (db) => {
      await db.from(this.tableName).whereNull('subcategory').delete()
    })
  }

  async down() {
    // Cannot restore deleted records
  }
}
