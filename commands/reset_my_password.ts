import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class ResetMyPassword extends BaseCommand {
  static commandName = 'reset:my-password'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Hello world from "ResetMyPassword"')
  }
}
