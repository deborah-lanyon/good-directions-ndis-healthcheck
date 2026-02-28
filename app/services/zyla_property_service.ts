import env from '#start/env'
import type { ZylaPropertyResponse, ZylaProperty, ListingType } from '../types/property.js'

const QUOTA_WARNING_THRESHOLD = 50
const FETCH_TIMEOUT_MS = 30_000 // 30 second timeout for API calls

export class ZylaPropertyService {
  private zylaApiKey: string
  private zylaApiUrl: string
  private remainingCalls: number | null = null

  constructor() {
    this.zylaApiKey = env.get('ZYLA_API_KEY')!
    this.zylaApiUrl =
      'https://zylalabs.com/api/5919/australia+property+search+api/7810/get+properties'
  }

  /**
   * Get the remaining API calls from the last response (null if no calls made yet)
   */
  getRemainingCalls(): number | null {
    return this.remainingCalls
  }

  /**
   * Test API connectivity for a given suburb (diagnostic endpoint).
   * Makes a single page-1 sold request and returns raw status/headers/body.
   */
  async testApiForSuburb(suburb: string): Promise<{
    success: boolean
    status: number
    statusText: string
    url: string
    responseBody: string
    headers: Record<string, string>
    totalResults?: number
  }> {
    const url = new URL(this.zylaApiUrl)
    url.searchParams.set('channel', 'sold')
    url.searchParams.set('searchLocation', suburb)
    url.searchParams.set('searchLocationSubtext', 'Suburb')
    url.searchParams.set('type', 'suburb')
    url.searchParams.set('page', '1')
    url.searchParams.set('surroundingSuburbs', 'true')
    url.searchParams.set('maxSoldAge', '1')

    const fullUrl = url.toString()
    console.log(`[ZYLA API TEST] Testing suburb "${suburb}" - URL: ${fullUrl}`)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.zylaApiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    const allHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      allHeaders[key] = value
    })

    const body = await response.text()
    console.log(`[ZYLA API TEST] Response for "${suburb}": ${response.status} ${response.statusText}`)
    console.log(`[ZYLA API TEST] Headers:`, JSON.stringify(allHeaders))
    console.log(`[ZYLA API TEST] Body (first 500):`, body.substring(0, 500))

    let totalResults: number | undefined
    if (response.ok) {
      try {
        const data = JSON.parse(body)
        totalResults = data.totalResultsCount
      } catch {}
    }

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: fullUrl,
      responseBody: body.substring(0, 1000),
      headers: allHeaders,
      totalResults,
    }
  }

  /**
   * Fetch sold properties from Zyla API
   */
  async fetchProperties(options: { searchLocation: string; maxSoldAge: number }): Promise<{
    properties: ZylaProperty[]
    totalFromApi: number
    propertiesReported: number
  }> {
    return this.fetchPropertiesByChannel({
      ...options,
      channel: 'sold',
    })
  }

  /**
   * Fetch rental properties from Zyla API
   */
  async fetchRentalProperties(options: { searchLocation: string }): Promise<{
    properties: ZylaProperty[]
    totalFromApi: number
    propertiesReported: number
  }> {
    return this.fetchPropertiesByChannel({
      searchLocation: options.searchLocation,
      channel: 'rent',
    })
  }

  /**
   * Fetch properties by channel (sold or rent)
   */
  private async fetchPropertiesByChannel(options: {
    searchLocation: string
    channel: ListingType
    maxSoldAge?: number
  }): Promise<{
    properties: ZylaProperty[]
    totalFromApi: number
    propertiesReported: number
  }> {
    const { searchLocation, channel, maxSoldAge } = options

    const firstPageData = await this.fetchPage({
      pageNumber: 1,
      searchLocation,
      channel,
      maxSoldAge,
    })
    const totalResultsCount = firstPageData.totalResultsCount
    const pageSize = Number.parseInt(firstPageData.resolvedQuery.pageSize)
    const totalPages = Math.ceil(totalResultsCount / pageSize)

    const allProperties: ZylaProperty[] = []
    firstPageData.tieredResults.forEach((tier) => {
      allProperties.push(...tier.results)
    })
    if (totalPages > 1) {
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)

      for (const pageNumber of remainingPages) {
        const pageData = await this.fetchPage({
          pageNumber,
          searchLocation,
          channel,
          maxSoldAge,
        })
        pageData.tieredResults.forEach((tier) => {
          allProperties.push(...tier.results)
        })
      }
    }

    const propertiesReported = allProperties.length

    return {
      properties: allProperties,
      totalFromApi: totalResultsCount,
      propertiesReported,
    }
  }

  private async fetchPage({
    pageNumber,
    searchLocation,
    channel,
    maxSoldAge,
    retryCount = 0,
  }: {
    pageNumber: number
    searchLocation: string
    channel: ListingType
    maxSoldAge?: number
    retryCount?: number
  }): Promise<ZylaPropertyResponse> {
    // Wait between page requests to avoid rate limiting
    if (pageNumber > 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    const url = new URL(this.zylaApiUrl)
    url.searchParams.set('channel', channel)
    url.searchParams.set('searchLocation', searchLocation)
    url.searchParams.set('searchLocationSubtext', 'Suburb')
    url.searchParams.set('type', 'suburb')
    url.searchParams.set('page', pageNumber.toString())
    url.searchParams.set('surroundingSuburbs', 'true')
    if (maxSoldAge !== undefined) {
      url.searchParams.set('maxSoldAge', maxSoldAge.toString())
    }

    const fullUrl = url.toString()
    console.log(`[ZYLA API] Fetching ${channel} page ${pageNumber} for suburb "${searchLocation}" (attempt ${retryCount + 1})`)
    console.log(`[ZYLA API] Full URL: ${fullUrl}`)

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.zylaApiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })

      // Track API quota and rate limit headers
      const remaining = response.headers.get('X-Zyla-API-Calls-Monthly-Remaining')
      const limit = response.headers.get('X-Zyla-RateLimit-Limit')
      const rateLimitReset = response.headers.get('X-Zyla-RateLimit-Reset')
      if (remaining !== null) {
        this.remainingCalls = Number.parseInt(remaining, 10)
        console.log(`[ZYLA API] Remaining monthly calls: ${remaining}${limit ? `/${limit}` : ''}${rateLimitReset ? `, resets in ${rateLimitReset}s` : ''}`)

        if (this.remainingCalls <= 0) {
          throw new Error(
            'Zyla API monthly quota exhausted. Please upgrade your plan or wait for the quota to reset.'
          )
        }

        if (this.remainingCalls <= QUOTA_WARNING_THRESHOLD) {
          console.warn(
            `[ZYLA API] WARNING: Only ${this.remainingCalls} API calls remaining this month`
          )
        }
      }

      if (!response.ok) {
        let responseBody = ''
        try {
          responseBody = await response.text()
        } catch {}

        // Log all rate-limit related headers for debugging
        const rateLimitHeaders: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('limit') || key.toLowerCase().includes('zyla') || key.toLowerCase().includes('retry')) {
            rateLimitHeaders[key] = value
          }
        })
        console.error(`[ZYLA API] Error ${response.status} for suburb "${searchLocation}":`, responseBody ? responseBody.substring(0, 500) : '', 'Headers:', JSON.stringify(rateLimitHeaders))

        const isRetryable = response.status === 503 || response.status === 429 || response.status >= 500
        if (isRetryable && retryCount < 3) {
          // Use rate limit reset header if available, otherwise exponential backoff
          const resetSeconds = rateLimitReset ? Number.parseInt(rateLimitReset, 10) : 0
          const backoffMs = resetSeconds > 0
            ? (resetSeconds + 1) * 1000
            : Math.min(5000 * Math.pow(2, retryCount), 30000)
          console.warn(
            `[ZYLA API] Page ${pageNumber} returned ${response.status}, retrying in ${backoffMs}ms (attempt ${retryCount + 1}/3)${resetSeconds > 0 ? ` (rate limit resets in ${resetSeconds}s)` : ''}`
          )
          await new Promise((resolve) => setTimeout(resolve, backoffMs))
          return this.fetchPage({
            pageNumber,
            searchLocation,
            channel,
            maxSoldAge,
            retryCount: retryCount + 1,
          })
        }
        throw new Error(
          `Failed to fetch properties page ${pageNumber}: ${response.status} ${response.statusText}`
        )
      }

      const data = (await response.json()) as ZylaPropertyResponse
      const totalTierCount = data.tieredResults.reduce((sum, tier) => sum + tier.count, 0)
      if (totalTierCount === 0 && data.totalResultsCount > 0) {
        console.warn(
          `Page ${pageNumber} returned empty results despite totalResultsCount being ${data.totalResultsCount}`
        )
      }

      return data
    } catch (error) {
      // Don't retry quota exhaustion or non-retryable errors
      const message = error instanceof Error ? error.message : ''
      if (message.includes('quota exhausted') || retryCount >= 3) {
        throw error
      }
      if (retryCount < 1) {
        const backoffMs = 2000
        console.warn(`[ZYLA API] Retrying page ${pageNumber} in ${backoffMs}ms due to error:`, error)
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
        return this.fetchPage({
          pageNumber,
          searchLocation,
          channel,
          maxSoldAge,
          retryCount: retryCount + 1,
        })
      }
      throw error
    }
  }
}
