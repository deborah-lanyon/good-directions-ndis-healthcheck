import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'churches'

  async up() {
    // Check if constraint exists before dropping
    const hasConstraint = await this.db.rawQuery(
      `SELECT constraint_name 
       FROM information_schema.table_constraints 
       WHERE table_name = 'churches' 
       AND constraint_name = 'churches_user_id_unique'`
    )

    if (hasConstraint.rows.length > 0) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropUnique(['user_id'])
      })
    }
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['user_id'])
    })
  }
}
