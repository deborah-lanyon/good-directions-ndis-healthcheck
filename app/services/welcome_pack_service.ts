import WelcomePackTemplate from '#models/welcome_pack_template'
import WelcomePackLog from '#models/welcome_pack_log'
import Property from '#models/property'
import Church from '#models/church'
import AmenityService from '#services/amenity_service'
import { DateTime } from 'luxon'

export interface WelcomePackData {
  propertyAddress: string
  churchName: string
  churchInfo: string
  welcomeMessage: string
  aboutCommunity?: string
  customContent: string
  churchServices?: string
  additionalInfo?: string
  contactAddress?: string
  contactEmail?: string
  contactPhone?: string
  amenities: Record<string, any[]>
  date: string
  logoUrl?: string
  bannerUrl?: string
  aboutUsImageUrl?: string
  gettingAroundImageUrl?: string
  communityServicesImageUrl?: string
  thingsToDoImageUrl?: string
  primaryColor: string
  secondaryColor: string
}

export default class WelcomePackService {
  private amenityService: AmenityService

  constructor(amenityService?: AmenityService) {
    this.amenityService = amenityService || new AmenityService()
  }

  /**
   * Generate welcome pack data for a property
   */
  async generateWelcomePackData(propertyId: number, templateId?: number): Promise<WelcomePackData> {
    // Fetch property with church
    const property = await Property.query().where('id', propertyId).preload('church').firstOrFail()

    const church = property.church

    // Get template (or create default)
    let template: WelcomePackTemplate | null = null

    if (templateId) {
      template = await WelcomePackTemplate.find(templateId)
    } else {
      // Get default template for church
      template = await WelcomePackTemplate.query()
        .where('church_id', church.id)
        .where('enabled', true)
        .first()
    }

    // Get all amenities (coordinates not required)
    let amenities: Record<string, any[]> = {}

    if (template?.includeAmenities !== false) {
      // Fetch amenities for the current church only
      amenities = await this.amenityService.getAllAmenitiesByType(church.id)
      console.log('Amenities loaded:', Object.keys(amenities).length, 'types')
      console.log('Total amenities:', Object.values(amenities).flat().length)
    } else {
      console.log('Amenities disabled in template')
    }

    // Build church info
    const churchInfo = template?.churchInfo || this.getDefaultChurchInfo(church)

    const data = {
      propertyAddress: property.address || 'Property Address',
      churchName: church.churchName || 'Community Church',
      churchInfo,
      welcomeMessage: template?.welcomeMessage || this.getDefaultWelcomeMessage(),
      aboutCommunity: template?.aboutCommunity || undefined,
      customContent: template?.customContent || '',
      churchServices: template?.churchServices || undefined,
      additionalInfo: template?.additionalInfo || undefined,
      contactAddress: template?.contactAddress || undefined,
      contactEmail: template?.contactEmail || undefined,
      contactPhone: template?.contactPhone || undefined,
      amenities,
      date: DateTime.now().toFormat('MMMM d, yyyy'),
      logoUrl: template?.logoUrl || undefined,
      bannerUrl: template?.bannerUrl || undefined,
      aboutUsImageUrl: template?.aboutUsImageUrl || undefined,
      gettingAroundImageUrl: template?.gettingAroundImageUrl || undefined,
      communityServicesImageUrl: template?.communityServicesImageUrl || undefined,
      thingsToDoImageUrl: template?.thingsToDoImageUrl || undefined,
      primaryColor: template?.primaryColor || '#94b4af',
      secondaryColor: template?.secondaryColor || '#566874',
    }

    console.log('Welcome Pack Data:', {
      amenityTypes: Object.keys(data.amenities),
      totalAmenities: Object.values(data.amenities).flat().length,
      propertyId,
    })

    return data
  }

  /**
   * Generate HTML for welcome pack - routes to appropriate template
   */
  async generateHTML(data: WelcomePackData, templateDesign: string = 'default'): Promise<string> {
    if (templateDesign === 'magazine') {
      return this.generateMagazineHTML(data)
    }
    return this.generateDefaultHTML(data)
  }

  /**
   * Generate HTML for welcome pack with magazine/property style design
   */
  private async generateMagazineHTML(data: WelcomePackData): Promise<string> {
    const primaryColor = data.primaryColor || '#9eafa4'
    const secondaryColor = data.secondaryColor || '#4a5759'

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome - ${data.propertyAddress}</title>
  <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Montserrat:wght@400;600;700&family=Rasa:wght@300;400;500;600&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      color: #333;
      background: #ffffff;
    }

    body p {
    font-family: 'Rasa', serif;
    font-size: 18px;
    line-height: 1.65;
    margin-bottom: 20px;
    }


    ul {
    list-style-type: disc;
    margin-block-start: 1em;
    margin-block-end: 1em;
    padding-inline-start: 40px;
    }

    li p {
    line-height: .5;
    }

    .container {
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
      background: white;
      border: 1px solid #ddd;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Hero and Welcome Wrapper */
    .hero-wrapper {
      display: grid;
      grid-template-rows: 280px 280px;
      position: relative;
      flex: 0 0 auto;
    }

    /* Top row - contains h1 */
    .hero-wrapper-top {
      background: ${primaryColor};
      display: flex;
      align-items: center;
      justify-content: center;
      height: 280px;
    }

    /* Bottom row - contains content box */
    .hero-wrapper-bottom {
      background: ${primaryColor};
      position: relative;
      height: 280px;
    }

    .hero-wrapper-bottom::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 50%;
      height: 100%;
      background: ${secondaryColor};
      z-index: 0;
    }
    .hero-image {
      position: relative;
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      max-height: 210px;
    }

    ${
      data.bannerUrl
        ? `
    .hero-image::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('${data.bannerUrl}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 0;
    }
    `
        : ''
    }

    .hero-wrapper-top h1 {
      font-family: 'Abril Fatface', serif;
      font-size: 130px;
      font-weight: 400;
      color: white;
      letter-spacing: 2px;
      margin-top: -20px;
      line-height: 1;
      position: relative;
      z-index: 1;
    }

    /* Content Box */
    .content-box {
      background: white;
      margin: -105px 80px 0;
      padding: 40px 50px 10px 50px;
      position: relative;
      z-index: 3;
    }

    .welcome-header {
      padding-bottom: 0;
      margin-bottom: 0;
    }

    h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 15px;
    }

    .content-text {
      color: #4a5759;
      text-align: left;
    }

    /* Community Section */
    .community-section {
      background: white;
      padding: 40px 60px;
      position: relative;
      z-index: 2;
    }

    .community-content {
      color: #4a5759;
    }

    /* About Section */
    .about-section {
      padding: 50px 60px;
    }

    .about-section h3 {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid #333;
    }

    .amenities-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 20px;
    }

    .amenities-column ul {
      list-style: none;
      padding: 0;
    }

    .amenities-column li {
      font-size: 14px;
      line-height: 2;
      color: #4a5759;
      padding-left: 20px;
      position: relative;
    }

    .amenities-column li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: ${secondaryColor};
      font-weight: bold;
    }

    /* Page 2 - About Us */
    .page-2 {
      page-break-before: always;
      width: 210mm;
      height: 297mm;
      position: relative;
    }

    .about-hero {
      position: relative;
      height: 200px;
      overflow: hidden;
      margin: 0;
    }

    .about-hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .about-title {
      font-family: 'Abril Fatface', serif;
      font-size: 90px;
      font-weight: 400;
      color: white;
      letter-spacing: 2px;
      margin: 0 0 -15px 60px;
      line-height: 1;
      position: absolute; 
      bottom: 0;          
      left: 0;             
    }

    .about-content {
      padding: 60px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
    }

    .about-left h3 {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 3px solid #333;
    }

    .about-signature {
      font-family: 'Dancing Script', cursive;
      font-size: 48px;
      color: #333;
    }

    .contact-box {
      background: ${primaryColor};
      color: white;
      padding: 40px;
    }

    .contact-box h3 {
      font-family: 'Montserrat', sans-serif;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 30px;
      color: white;
    }

    .contact-item {
      margin-bottom: 30px;
    }

    .contact-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.7);
      margin-bottom: 8px;
    }

    .contact-value {
      font-family: 'Rasa', serif;
      font-size: 20px;
      color: white;
    }

    .host-features {
      list-style: none;
      padding: 0;
      margin-top: 30px;
    }

    .host-features li {
      font-family: 'Rasa', serif;
      font-size: 20px;
      line-height: 2;
      color: white;
      padding-left: 20px;
      position: relative;
    }

    .host-features li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: white;
      font-weight: bold;
    }

    /* Page 3 - Getting Around / Additional Info */
    .page-3 {
      page-break-before: always;
      width: 210mm;
      height: 297mm;
      background: #f5f5f5;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .page-title {
      font-family: 'Abril Fatface', serif;
      font-size: 72px;
      color: #333;
      padding: 60px 60px 20px;
      margin: 0;
      line-height: 1.1;
      letter-spacing: 2px;
    }

    .page-subtitle {
      font-family: 'Rasa', serif;
      font-size: 20px;
      color: #999;
      font-style: italic;
      padding: 0 60px 40px;
      margin: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      padding: 0 60px 40px;
      flex: 0 0 auto;
    }

    .info-item {
      background: white;
      padding: 30px;
      border-radius: 0;
    }

    .info-item h4 {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 15px;
      color: #333;
    }

    .info-item p {
      font-family: 'Rasa', serif;
      font-size: 20px;
      line-height: 1.8;
      color: #666;
      margin: 0;
    }

    .page-graphics-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      height: 300px;
    }

    .graphics-left {
      background: ${primaryColor};
      padding: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .graphics-right {
      background: white;
      padding: 0;
      height: 100%;
      margin: 0;
    }

    .graphics-right img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .page-footer-section {
      background: white;
      padding: 60px;
    }

    .page-footer-section h2 {
      font-family: 'Abril Fatface', serif;
      font-size: 56px;
      color: #333;
      margin-bottom: 30px;
      line-height: 1.1;
      letter-spacing: 2px;
    }

    .page-footer-section p {
      font-family: 'Rasa', serif;
      font-size: 20px;
      line-height: 1.8;
      color: #666;
      max-width: 800px;
    }

    /* Page 4 - Community Services */
    .page-4 {
      page-break-before: always;
      width: 210mm;
      height: 297mm;
      background: #f5f5f5;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* Page 5 - Things to Do */
    .page-5 {
      page-break-before: always;
      width: 210mm;
      height: 297mm;
      background: #fff;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .content-header {
      padding: 60px 60px 40px;
      flex: 0 0 auto;
    }

    .content-header h1 {
      font-family: 'Abril Fatface', serif;
      font-size: 56px;
      color: #333;
      margin-bottom: 5px;
      letter-spacing: 2px;
    }

    .content-header .subtitle {
      font-family: 'Rasa', serif;
      font-size: 18px;
      color: #999;
      font-style: italic;
      text-align: right;
    }

    .two-column-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      padding: 40px 60px;
      flex: 0 0 auto;
    }

    .text-column {
      display: flex;
      flex-direction: column;
      gap: 35px;
    }

    .text-item h4 {
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #333;
      margin-bottom: 12px;
    }

    .text-item p {
      font-family: 'Rasa', serif;
      font-size: 20px;
      line-height: 1.7;
      color: #666;
    }

    .image-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .image-column img {
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: 4px;
    }

    /* Info Page Layout (Page 5) */
    .info-page-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      height: 100%;
      gap: 0;
    }

    .info-page-image {
      position: relative;
      overflow: hidden;
    }

    .info-page-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .info-page-content {
      background: white;
      padding: 60px 70px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .info-section {
      margin-bottom: 40px;
    }

    .info-section:last-child {
      margin-bottom: 0;
    }

    .info-section-title {
      font-family: 'Abril Fatface', serif;
      font-size: 42px;
      font-weight: 400;
      color: #333;
      margin: 0 0 25px 0;
      letter-spacing: 1px;
    }

    .info-section-text {
      font-family: 'Rasa', serif;
      font-size: 16px;
      line-height: 1.8;
      color: #4a5759;
    }

    .info-section-text p {
      margin: 0 0 8px 0;
    }

    .colored-footer {
      background: ${data.primaryColor ? `${data.primaryColor}CC` : '#c9a8a8'};
      color: #fff;
      padding: 50px 60px 60px;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      min-height: 350px;
    }

    .colored-footer h2 {
      font-family: 'Abril Fatface', serif;
      font-size: 48px;
      color: #fff;
      margin-bottom: 30px;
      text-align: center;
      letter-spacing: 2px;
    }

    .footer-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      max-width: 900px;
      margin: 0 auto;
    }

    .colored-footer ul {
      list-style: none;
      padding: 0;
    }

    .colored-footer li {
      font-family: 'Rasa', serif;
      font-size: 22px;
      line-height: 2;
      color: #fff;
    }

    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      .container {
        border: none;
        width: 210mm;
        height: 297mm;
        margin: 0;
      }
      .page-2 { page-break-before: always; }
      .page-3 { page-break-before: always; }
      .page-4 { page-break-before: always; }
      .page-5 { page-break-before: always; }

      /* Ensure edge-to-edge backgrounds */
      .hero-wrapper-top,
      .hero-wrapper-bottom,
      .about-hero,
      .page-graphics-bottom,
      .colored-footer {
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Hero and Welcome Wrapper -->

    <div class="hero-wrapper">

      <!-- Top Row - Welcome Title -->
      <div class="hero-wrapper-top">
        <h1>Welcome</h1>
      </div>

      <!-- Bottom Row - Content Box with right border -->
      <div class="hero-wrapper-bottom">
        <div class="content-box">
          <div class="welcome-header">
            <h2>WELCOME TO OUR COMMUNITY</h2>
          </div>
          <div class="content-text">
            ${data.welcomeMessage || ''}
          </div>
        </div>
      </div>

    </div>

    <!-- Image area for banner -->
      <div class="hero-image">
      </div>

    ${
      data.aboutCommunity
        ? `
    <!-- Community Section -->
    <div class="community-section">
      <div class="community-content">
        ${data.aboutCommunity}
      </div>
    </div>
    `
        : ''
    }


  </div>

  <!-- Page 2: About the Church -->
  <div class="container page-2">

    <!-- Hero Image with Title Overlay -->
    <div class="about-hero">
      ${data.aboutUsImageUrl ? `<img src="${data.aboutUsImageUrl}" alt="About us">` : ''}
      <h1 class="about-title">About us</h1>
    </div>

    <!-- Content Section -->
    <div class="about-content">

      <!-- Left Column: About Text -->
      <div class="about-left">
        ${data.churchInfo || ''}
        <div class="about-signature">${data.churchName || ''}</div>
      </div>

      <!-- Right Column: Contact Information -->
      <div class="about-right">
        ${(() => {
          // Parse church services if available
          let churchServices: Array<{ name: string; days: string[]; time: string }> = []
          if (data.churchServices) {
            try {
              churchServices =
                typeof data.churchServices === 'string'
                  ? JSON.parse(data.churchServices)
                  : data.churchServices
            } catch (e) {
              console.error('Failed to parse church services:', e)
            }
          }

          return `
            ${
              churchServices.length > 0
                ? `
              <div class="contact-box" style="margin-bottom: 20px;">
                <h3>CHURCH SERVICES</h3>
                ${churchServices
                  .map((service: { name: string; days: string[]; time: string }) => {
                    const days = Array.isArray(service.days) ? service.days : []
                    const dayLabels: Record<string, string> = {
                      monday: 'Mon',
                      tuesday: 'Tue',
                      wednesday: 'Wed',
                      thursday: 'Thu',
                      friday: 'Fri',
                      saturday: 'Sat',
                      sunday: 'Sun',
                    }
                    const daysText = days.map((d: string) => dayLabels[d] || d).join(', ')

                    // Format time from 24h to 12h format
                    let timeText = service.time || ''
                    if (timeText) {
                      const [hours, minutes] = timeText.split(':')
                      const h = Number.parseInt(hours)
                      const ampm = h >= 12 ? 'PM' : 'AM'
                      const displayHours = h % 12 || 12
                      timeText = `${displayHours}:${minutes} ${ampm}`
                    }

                    return `
                    <div class="contact-item" style="margin-bottom: 15px;">
                      <div class="contact-label">${service.name || 'Service'}</div>
                      <div class="contact-value">
                        ${daysText ? `${daysText}` : ''}
                        ${daysText && timeText ? ' • ' : ''}
                        ${timeText}
                      </div>
                    </div>
                  `
                  })
                  .join('')}
              </div>
            `
                : ''
            }

            ${
              data.contactAddress || data.contactEmail || data.contactPhone
                ? `
              <div class="contact-box">
                <h3>CONTACT INFORMATION</h3>

                ${
                  data.contactAddress
                    ? `
                  <div class="contact-item">
                    <div class="contact-label">ADDRESS</div>
                    <div class="contact-value">${data.contactAddress}</div>
                  </div>
                `
                    : ''
                }

                ${
                  data.contactEmail
                    ? `
                  <div class="contact-item">
                    <div class="contact-label">EMAIL</div>
                    <div class="contact-value">${data.contactEmail}</div>
                  </div>
                `
                    : ''
                }

                ${
                  data.contactPhone
                    ? `
                  <div class="contact-item">
                    <div class="contact-label">PHONE</div>
                    <div class="contact-value">${data.contactPhone}</div>
                  </div>
                `
                    : ''
                }
              </div>
            `
                : ''
            }
          `
        })()}
      </div>
    </div>

  </div>

  <!-- Page 3: Getting Around / Additional Information -->
  <div class="container page-3">

    <!-- Title Section -->
    <h1 class="page-title">Getting around</h1>
    <p class="page-subtitle">— ${data.propertyAddress}</p>

    <!-- Information Grid -->
    <div class="info-grid">
      ${(() => {
        const infoBoxes = []

        // Get all transport amenities
        const transportAmenities = []
        for (const [type, amenities] of Object.entries(data.amenities)) {
          if (type.toLowerCase().includes('transport')) {
            transportAmenities.push(...amenities)
          }
        }

        // Group transport amenities by subcategory
        if (transportAmenities.length > 0) {
          const subcategoryGroups: Record<string, any[]> = {}
          for (const amenity of transportAmenities) {
            const subcategory = amenity.subcategory || 'Other'
            if (!subcategoryGroups[subcategory]) {
              subcategoryGroups[subcategory] = []
            }
            subcategoryGroups[subcategory].push(amenity)
          }

          // Create a box for each subcategory (limit to 4)
          const subcategories = Object.entries(subcategoryGroups).slice(0, 4)
          for (const [subcategory, items] of subcategories) {
            const itemsList = items
              .slice(0, 2)
              .map((item) => {
                let parts = []
                parts.push(`<strong>${item.name}</strong>`)
                if (item.address) {
                  parts.push(item.address)
                }
                if (item.distance) {
                  parts.push(item.distance)
                }
                return parts.join(' - ')
              })
              .join('<br>')

            const moreText =
              items.length > 2 ? `<br><em>+ ${items.length - 2} more nearby</em>` : ''

            infoBoxes.push(`
      <div class="info-item">
        <h4>${subcategory.toUpperCase()}</h4>
        <p style="line-height: 1.9;">${itemsList}${moreText}</p>
      </div>`)
          }
        }

        // If we don't have enough transport subcategories, add other amenity categories
        if (infoBoxes.length < 4) {
          const otherCategories = [
            {
              names: ['Dining', 'dining', 'Restaurants', 'restaurants', 'Cafes', 'cafes'],
              title: 'DINING',
            },
            {
              names: ['Entertainment', 'entertainment', 'Recreation', 'recreation'],
              title: 'ENTERTAINMENT',
            },
          ]

          for (const category of otherCategories) {
            if (infoBoxes.length >= 4) break

            const items = []
            for (const [type, amenities] of Object.entries(data.amenities)) {
              if (category.names.some((name) => type.toLowerCase().includes(name.toLowerCase()))) {
                items.push(...amenities)
              }
            }

            if (items.length > 0) {
              const itemsList = items
                .slice(0, 2)
                .map((item) => {
                  let parts = []
                  parts.push(`<strong>${item.name}</strong>`)
                  if (item.address) {
                    parts.push(item.address)
                  }
                  if (item.distance) {
                    parts.push(item.distance)
                  }
                  return parts.join(' - ')
                })
                .join('<br>')

              const moreText =
                items.length > 2 ? `<br><em>+ ${items.length - 2} more nearby</em>` : ''

              infoBoxes.push(`
      <div class="info-item">
        <h4>${category.title}</h4>
        <p style="line-height: 1.9;">${itemsList}${moreText}</p>
      </div>`)
            }
          }
        }

        // Fill remaining slots with placeholder boxes
        while (infoBoxes.length < 4) {
          infoBoxes.push(`
      <div class="info-item">
        <h4>LOCAL INFORMATION</h4>
        <p>Additional information about the local area and amenities will be provided.</p>
      </div>`)
        }

        return infoBoxes.join('')
      })()}
    </div>

    <!-- Image and Color Block Layout -->
    <div class="page-graphics-bottom">
      <div class="graphics-left">
        <!-- Decorative color block -->
      </div>
      <div class="graphics-right">
        ${
          data.gettingAroundImageUrl
            ? `<img src="${data.gettingAroundImageUrl}" alt="Getting around">`
            : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#f5f5f5 0%,#e0e0e0 100%);display:flex;align-items:center;justify-content:center;color:#999;font-size:18px;font-style:italic;">Upload an image for this page</div>'
        }
      </div>
    </div>

  </div>

  <!-- Page 4: Community Services -->
  <div class="container page-4">

    <!-- Title Section -->
    <h1 class="page-title">Community services</h1>
    <p class="page-subtitle">— ${data.propertyAddress}</p>

    <!-- Information Grid -->
    <div class="info-grid">
      ${(() => {
        const infoBoxes = []

        // Define categories to look for
        const categoryGroups = [
          {
            names: ['Community Services', 'community services', 'Community', 'community'],
            prefix: 'community',
          },
          {
            names: ['Medical', 'medical', 'Health', 'health', 'Healthcare', 'healthcare'],
            prefix: 'medical',
          },
        ]

        // Process each category group
        for (const categoryGroup of categoryGroups) {
          // Get all amenities for this category group
          const categoryAmenities = []
          for (const [type, amenities] of Object.entries(data.amenities)) {
            if (
              categoryGroup.names.some((name) => type.toLowerCase().includes(name.toLowerCase()))
            ) {
              categoryAmenities.push(...amenities)
            }
          }

          // Group by subcategory
          if (categoryAmenities.length > 0) {
            const subcategoryGroups: Record<string, any[]> = {}
            for (const amenity of categoryAmenities) {
              const subcategory = amenity.subcategory || 'Other'
              if (!subcategoryGroups[subcategory]) {
                subcategoryGroups[subcategory] = []
              }
              subcategoryGroups[subcategory].push(amenity)
            }

            // Add boxes for subcategories
            for (const [subcategory, items] of Object.entries(subcategoryGroups)) {
              if (infoBoxes.length >= 4) break

              const itemsList = items
                .slice(0, 2)
                .map((item) => {
                  let parts = []
                  parts.push(`<strong>${item.name}</strong>`)
                  if (item.address) {
                    parts.push(item.address)
                  }
                  if (item.distance) {
                    parts.push(item.distance)
                  }
                  return parts.join(' - ')
                })
                .join('<br>')

              const moreText =
                items.length > 2 ? `<br><em>+ ${items.length - 2} more nearby</em>` : ''

              infoBoxes.push(`
      <div class="info-item">
        <h4>${subcategory.toUpperCase()}</h4>
        <p style="line-height: 1.9;">${itemsList}${moreText}</p>
      </div>`)
            }
          }

          if (infoBoxes.length >= 4) break
        }

        // Don't add placeholder boxes - only show actual amenities

        return infoBoxes.join('')
      })()}
    </div>

    <!-- Image and Color Block Layout -->
    <div class="page-graphics-bottom">
      <div class="graphics-left">
        <!-- Decorative color block -->
      </div>
      <div class="graphics-right">
        ${
          data.communityServicesImageUrl
            ? `<img src="${data.communityServicesImageUrl}" alt="Community services">`
            : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#f5f5f5 0%,#e0e0e0 100%);display:flex;align-items:center;justify-content:center;color:#999;font-size:18px;font-style:italic;">Upload an image for this page</div>'
        }
      </div>
    </div>

  </div>

  <!-- Page 5: Things to Do & Dining -->
  <div class="container page-5">

    <!-- Two Column Layout: Image Left, Content Right -->
    <div class="info-page-layout">

      <!-- Left Column: Full Height Image -->
      <div class="info-page-image">
        ${
          data.thingsToDoImageUrl
            ? `<img src="${data.thingsToDoImageUrl}" alt="Things to do">`
            : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#f5f5f5 0%,#e0e0e0 100%);display:flex;align-items:center;justify-content:center;color:#999;font-size:18px;font-style:italic;">Upload an image for this page</div>'
        }
      </div>

      <!-- Right Column: Things to Do & Dining Sections -->
      <div class="info-page-content">

        <!-- Things to Do Section -->
        <div class="info-section">
          <h2 class="info-section-title">Things to Do</h2>
          <div class="info-section-text">
            ${(() => {
              // Get entertainment/shopping amenities
              const thingsToDoAmenities = []
              for (const [type, amenities] of Object.entries(data.amenities)) {
                if (
                  type.toLowerCase().includes('entertainment') ||
                  type.toLowerCase().includes('shopping') ||
                  type.toLowerCase().includes('recreation')
                ) {
                  thingsToDoAmenities.push(...amenities)
                }
              }

              if (thingsToDoAmenities.length > 0) {
                return thingsToDoAmenities
                  .slice(0, 8)
                  .map((item) => {
                    return `<p>• ${item.name}${item.address ? ' - ' + item.address : ''}</p>`
                  })
                  .join('')
              } else {
                return `
                  <p>• Local attractions and activities</p>
                  <p>• Shopping districts and markets</p>
                  <p>• Parks and recreational areas</p>
                  <p>• Cultural venues and entertainment</p>
                `
              }
            })()}
          </div>
        </div>

        <!-- Dining In and Out Section -->
        <div class="info-section">
          <h2 class="info-section-title">Dining In and Out</h2>
          <div class="info-section-text">
            ${(() => {
              // Get food/cafe amenities
              const diningAmenities = []
              for (const [type, amenities] of Object.entries(data.amenities)) {
                if (
                  type.toLowerCase().includes('food') ||
                  type.toLowerCase().includes('cafe') ||
                  type.toLowerCase().includes('restaurant') ||
                  type.toLowerCase().includes('dining')
                ) {
                  diningAmenities.push(...amenities)
                }
              }

              if (diningAmenities.length > 0) {
                return diningAmenities
                  .slice(0, 8)
                  .map((item) => {
                    return `<p>• ${item.name}${item.address ? ' - ' + item.address : ''}</p>`
                  })
                  .join('')
              } else {
                return `
                  <p>• Local restaurants and cafes</p>
                  <p>• Grocery stores and markets</p>
                  <p>• Specialty food shops</p>
                  <p>• Delivery and takeout options</p>
                `
              }
            })()}
          </div>
        </div>

      </div>

    </div>

  </div>

</body>
</html>
`
    return html
  }

  /**
   * Generate HTML for welcome pack with modern design (original)
   */
  private async generateDefaultHTML(data: WelcomePackData): Promise<string> {
    console.log('generateHTML called with amenities:', {
      amenityKeys: Object.keys(data.amenities),
      amenityCount: Object.values(data.amenities).flat().length,
    })

    const primaryColor = data.primaryColor || '#6d3b90'
    const secondaryColor = data.secondaryColor || '#059669'
    const lightBg = '#f8f9fa'
    const borderColor = '#e0e0e0'

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Pack - ${data.propertyAddress}</title>
  <link href="https://fonts.googleapis.com/css2?family=Caprasimo&family=Karla:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #2d3748;
      background: #ffffff;
      padding: 0;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
    }
    
    /* Header Section */
    .header {
      background: linear-gradient(135deg, ${primaryColor} 0%, #0041a3 100%);
      color: white;
      padding: 0;
      text-align: center;
      border-radius: 0;
      page-break-after: avoid;
    }
    
    .header-content {
      padding: 40px;
    }
    
    .header-logo {
      max-height: 150px;
      margin-bottom: 20px;
      display: inline-block;
    }
    
    .header-banner {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      margin: 0;
      border-radius: 0;
      display: block;
    }
    
    .header h1 {
      font-family: 'Caprasimo', cursive;
      font-size: 42px;
      font-weight: 400;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }
    
    .header-address {
      font-size: 18px;
      opacity: 0.95;
      margin-bottom: 10px;
      font-weight: 500;
    }
    
    .header-date {
      font-size: 14px;
      opacity: 0.85;
    }
    
    /* Main Content */
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section:first-of-type {
      margin-top: 20px;
    }
    
    h2 {
      font-family: 'Caprasimo', cursive;
      font-size: 28px;
      font-weight: 400;
      color: ${primaryColor};
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 15px;
      border-bottom: 3px solid ${secondaryColor};
    }
    
    .section-icon {
      font-size: 28px;
    }
    
    .section-content {
      color: #4a5568;
      line-height: 1.8;
    }
    
    .section-content p {
      margin-bottom: 15px;
    }
    
    .church-info-box {
      background: ${lightBg};
      border-left: 4px solid ${secondaryColor};
      padding: 20px;
      border-radius: 4px;
      margin: 15px 0;
    }
    
    /* Amenities Section */
    .amenities-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    
    .amenity-category {
      page-break-inside: avoid;
    }
    
    .category-title {
      font-family: 'Karla', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: ${secondaryColor};
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .subcategory-group {
      margin-bottom: 16px;
    }

    .subcategory-title {
      font-family: 'Karla', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 8px;
      padding-left: 8px;
      border-left: 3px solid ${secondaryColor};
    }

    .amenity-item {
      background: white;
      border: 1px solid ${borderColor};
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 12px;
      transition: box-shadow 0.2s;
    }
    
    .amenity-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .amenity-name {
      font-family: 'Karla', sans-serif;
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
      margin-bottom: 6px;
    }
    
    .amenity-address {
      color: #718096;
      font-size: 12px;
      margin-bottom: 6px;
    }
    
    .amenity-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #a0aec0;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #edf2f7;
    }
    
    .amenity-distance {
      background: #edf2f7;
      color: ${secondaryColor};
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .amenity-contact {
      margin-top: 6px;
      color: #4a5568;
      font-size: 12px;
    }
    
    .amenity-phone,
    .amenity-website {
      display: block;
      margin: 3px 0;
    }
    
    .amenity-website a {
      color: ${primaryColor};
      text-decoration: none;
      word-break: break-word;
    }
    
    /* Footer */
    .footer {
      background: ${lightBg};
      border-top: 2px solid ${borderColor};
      padding: 30px 40px;
      text-align: center;
      color: #718096;
      font-size: 13px;
      margin-top: 50px;
    }
    
    .footer-message {
      font-size: 14px;
      color: ${primaryColor};
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .footer-credit {
      font-size: 12px;
      color: #a0aec0;
    }
    
    /* Utility */
    .no-amenities {
      text-align: center;
      color: #a0aec0;
      padding: 20px;
      font-style: italic;
    }
    
    @media print {
      body { padding: 0; }
      .container { box-shadow: none; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${data.bannerUrl ? `<img src="${data.bannerUrl}" alt="Banner" class="header-banner" />` : ''}
      <div class="header-content">
        ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" class="header-logo" />` : ''}
        <h1>Welcome to Your New Home</h1>
        <div class="header-address">${data.propertyAddress}</div>
        <div class="header-date">${data.date}</div>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <h2>Welcome Message</h2>
        <div class="section-content">
          ${data.welcomeMessage}
        </div>
      </div>

      <div class="section">
        <h2>About ${data.churchName}</h2>
        <div class="church-info-box">
          <div class="section-content">
            ${data.churchInfo}
          </div>
        </div>
      </div>
`

    if (data.customContent) {
      html += `
      <div class="section">
        <h2>Additional Information</h2>
        <div class="section-content">
          ${data.customContent}
        </div>
      </div>
`
    }

    if (Object.keys(data.amenities).length > 0) {
      const amenitiesWithItems = Object.entries(data.amenities).filter(
        ([_, items]) => items.length > 0
      )

      if (amenitiesWithItems.length > 0) {
        html += `
      <div class="section">
        <h2>Local Amenities</h2>
        <p style="color: #718096; margin-bottom: 20px;">Here are some useful places near your new home:</p>
        <div class="amenities-container">
`

        for (const [type, items] of amenitiesWithItems) {
          if (items.length > 0) {
            // Group items by subcategory
            const subcategoryGroups: Record<string, any[]> = {}
            for (const amenity of items) {
              const subcategory = amenity.subcategory || 'Other'
              if (!subcategoryGroups[subcategory]) {
                subcategoryGroups[subcategory] = []
              }
              subcategoryGroups[subcategory].push(amenity)
            }

            html += `
          <div class="amenity-category">
            <div class="category-title">${type}</div>
`
            // Display each subcategory
            for (const [subcategory, subcategoryItems] of Object.entries(subcategoryGroups)) {
              html += `
            <div class="subcategory-group">
              <div class="subcategory-title">${subcategory}</div>
`
              // Show top 3 of each subcategory for better layout
              const topItems = subcategoryItems.slice(0, 3)
              for (const amenity of topItems) {
                html += `
              <div class="amenity-item">
                <div class="amenity-name">${amenity.name}</div>
                <div class="amenity-address">${amenity.address}</div>
                ${
                  amenity.distance > 0
                    ? `<div class="amenity-meta">
                  <span class="amenity-distance">${amenity.distance} km</span>
                </div>`
                    : ''
                }
`
                if (amenity.phone || amenity.website) {
                  html += `<div class="amenity-contact">`
                  if (amenity.phone) {
                    html += `<span class="amenity-phone">Phone: ${amenity.phone}</span>`
                  }
                  if (amenity.website) {
                    html += `<span class="amenity-website"><a href="${amenity.website}" target="_blank">Website: ${amenity.website}</a></span>`
                  }
                  html += `</div>`
                }
                html += `
              </div>
`
              }
              html += `
            </div>
`
            }
            html += `
          </div>
`
          }
        }

        html += `
        </div>
      </div>
`
      }
    }

    html += `
      <div class="footer">
        <div class="footer-message">We're here to help you settle into your new community!</div>
        <div class="footer-credit">Welcome Pack generated by ${data.churchName}</div>
      </div>
    </div>
  </div>
</body>
</html>
`

    return html
  }

  /**
   * Log a welcome pack delivery
   */
  async logDelivery(
    propertyId: number,
    deliveryMethod: 'email' | 'print',
    templateId?: number,
    sentToEmail?: string,
    sentBy?: string
  ): Promise<WelcomePackLog> {
    return await WelcomePackLog.create({
      propertyId,
      welcomePackTemplateId: templateId || null,
      sentToEmail: sentToEmail || null,
      sentBy: sentBy || null,
      deliveryMethod,
      sentAt: DateTime.now(),
    })
  }

  /**
   * Get or create template for a church
   */
  async getOrCreateTemplate(churchId: number): Promise<WelcomePackTemplate> {
    let template = await WelcomePackTemplate.query().where('church_id', churchId).first()

    if (!template) {
      template = await WelcomePackTemplate.create({
        churchId,
        name: 'Default Template',
        welcomeMessage: this.getDefaultWelcomeMessage(),
        churchInfo: '',
        customContent: '',
        logoUrl: null,
        bannerUrl: null,
        primaryColor: '#6d3b90',
        secondaryColor: '#059669',
        templateDesign: 'default',
        includeAmenities: true,
        enabled: true,
      })
    }

    return template
  }

  /**
   * Update a welcome pack template
   */
  async updateTemplate(
    templateId: number,
    data: {
      name?: string
      welcomeMessage?: string
      aboutCommunity?: string
      churchInfo?: string
      customContent?: string
      additionalInfo?: string
      churchServices?: string
      contactAddress?: string
      contactEmail?: string
      contactPhone?: string
      includeAmenities?: boolean
      enabled?: boolean
      logoUrl?: string
      bannerUrl?: string
      aboutUsImageUrl?: string
      gettingAroundImageUrl?: string
      communityServicesImageUrl?: string
      thingsToDoImageUrl?: string
      primaryColor?: string
      secondaryColor?: string
      templateDesign?: string
    }
  ): Promise<WelcomePackTemplate> {
    const template = await WelcomePackTemplate.findOrFail(templateId)
    template.merge(data)
    await template.save()
    return template
  }

  /**
   * Get default welcome message
   */
  private getDefaultWelcomeMessage(): string {
    return `Welcome to your new home! We're delighted to have you join our community.`
  }

  /**
   * Get default church info
   */
  private getDefaultChurchInfo(church: Church): string {
    const parts = [church.churchName || 'Our Church']

    if (church.url) {
      parts.push(`Visit us online at ${church.url}`)
    }

    return parts.join('. ')
  }
}
