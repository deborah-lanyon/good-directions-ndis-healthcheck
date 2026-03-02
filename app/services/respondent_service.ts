import Respondent from '#models/respondent'
import type { RespondentStatus } from '#models/respondent'
import { MailService } from '#services/mail_service'
import { TrackingCodeService } from '#services/tracking_code_service'

export class RespondentService {
  private mailService: MailService
  private trackingCodeService: TrackingCodeService

  constructor(mailService?: MailService) {
    this.mailService = mailService ?? new MailService()
    this.trackingCodeService = new TrackingCodeService()
  }

  /**
   * Register a new respondent from the public form
   */
  async register(data: {
    name: string
    email: string
    phone?: string
    trackingCode?: string
  }): Promise<Respondent> {
    let propertyId: number | null = null
    let churchId: number | null = null

    // If tracking code provided, look up the property
    if (data.trackingCode) {
      const property = await this.trackingCodeService.findPropertyByCode(data.trackingCode)
      if (property) {
        propertyId = property.id
        churchId = property.churchId
      }
    }

    const respondent = await Respondent.create({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      trackingCode: data.trackingCode?.toUpperCase() || null,
      propertyId,
      churchId,
      status: 'new',
    })

    // Send emails asynchronously (don't block registration)
    this.sendRegistrationEmails(respondent).catch((error) => {
      console.error('Failed to send respondent registration emails:', error)
    })

    return respondent
  }

  private async sendRegistrationEmails(respondent: Respondent): Promise<void> {
    await Promise.all([
      this.mailService.sendRespondentConfirmation(respondent),
      this.mailService.sendRespondentAdminNotification(respondent),
    ])
  }

  /**
   * Get all respondents for a church
   */
  async getRespondentsForChurch(churchId: number): Promise<Respondent[]> {
    return Respondent.query()
      .where('church_id', churchId)
      .preload('property')
      .orderBy('created_at', 'desc')
  }

  /**
   * Update respondent status
   */
  async updateStatus(
    respondentId: number,
    status: RespondentStatus,
    notes?: string
  ): Promise<Respondent> {
    const respondent = await Respondent.findOrFail(respondentId)
    respondent.status = status
    if (notes !== undefined) respondent.notes = notes
    await respondent.save()
    return respondent
  }
}
