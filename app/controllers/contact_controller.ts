import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

export default class ContactController {
  /**
   * Render the Get in Touch page
   */
  async index({ inertia }: HttpContext) {
    return inertia.render('get-in-touch')
  }

  /**
   * Handle contact form submission
   */
  async submit({ request, response }: HttpContext) {
    const data = request.only([
      'firstName',
      'lastName',
      'suburb',
      'email',
      'inquiryTypes',
      'question',
    ])

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.suburb || !data.email) {
      return response.badRequest({ error: 'All required fields must be filled out.' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return response.badRequest({ error: 'Please provide a valid email address.' })
    }

    try {
      // Format inquiry types for the email
      const inquiryTypeLabels: Record<string, string> = {
        registration_info:
          'Further information about registering your organisation for the Good Directions NDIS Healthcheck',
        help_using: 'Help in using the Good Directions NDIS Healthcheck',
        book_visit: 'Book a visit to your organisation to introduce the Good Directions NDIS Healthcheck',
        ask_question: 'Ask a Question',
      }

      const selectedInquiries = (data.inquiryTypes || [])
        .map((type: string) => inquiryTypeLabels[type] || type)
        .join('\n- ')

      // Send email notification to all admin emails (comma-separated)
      const adminEmails = env
        .get('ADMIN_EMAIL', 'peter@gooddirections.com.au')
        .split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0)

      await mail.send((message) => {
        const msg = message
          .from(env.get('MAIL_FROM_ADDRESS', 'noreply@gooddirections.com.au'))
          .replyTo(data.email)
          .subject(`New Contact Form Submission from ${data.firstName} ${data.lastName}`)
        for (const email of adminEmails) {
          msg.to(email)
        }
        msg.html(`
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Suburb:</strong> ${data.suburb}</p>

            <h3>Inquiry Type(s):</h3>
            <ul>
              ${selectedInquiries ? `<li>${selectedInquiries.replace(/\n- /g, '</li><li>')}</li>` : '<li>None selected</li>'}
            </ul>

            ${
              data.question
                ? `
            <h3>Question/Feedback:</h3>
            <p>${data.question.replace(/\n/g, '<br>')}</p>
            `
                : ''
            }
          `)
      })

      return response.ok({ message: 'Message sent successfully' })
    } catch (error) {
      console.error('Error sending contact form:', error)
      return response.internalServerError({
        error: 'Failed to send message. Please try again later.',
      })
    }
  }
}
