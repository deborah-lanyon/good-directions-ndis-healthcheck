import { test } from '@japa/runner'
import { GeocodingService } from '#services/geocoding_service'

test.group('GeocodingService', () => {
  test('should instantiate GeocodingService', async ({ assert }) => {
    const geocodingService = new GeocodingService()
    assert.exists(geocodingService)
  })

  test('should throw error when address is not provided', async ({ assert }) => {
    const geocodingService = new GeocodingService()
    await assert.rejects(() => geocodingService.geocodeAddress(''), 'Address parameter is required')
  })

  test('should throw error when address is not a string', async ({ assert }) => {
    const geocodingService = new GeocodingService()
    await assert.rejects(
      () => geocodingService.geocodeAddress(null as any),
      'Address parameter is required'
    )
  })

  test('should use Nominatim fallback when API key not configured', async ({ assert }) => {
    const mockResponse = {
      lat: '-28.0',
      lon: '153.0',
      display_name: '123 Test St, Test Suburb, QLD 4000',
    }

    const originalFetch = global.fetch
    global.fetch = async (url: any) => {
      // Verify it's using Nominatim URL
      assert.include(url, 'nominatim.openstreetmap.org')
      return {
        ok: true,
        json: async () => [mockResponse],
      } as Response
    }

    const geocodingService = new GeocodingService()
    Object.defineProperty(geocodingService, 'apiKey', {
      value: '',
      writable: true,
      configurable: true,
    })

    const result = await geocodingService.geocodeAddress('123 Test St, Sydney, NSW, Australia')

    assert.equal(result.lat, -28.0)
    assert.equal(result.lon, 153.0)

    global.fetch = originalFetch
  })

  test('should geocode address successfully', async ({ assert }) => {
    const mockResponse = {
      lat: '-28.0',
      lon: '153.0',
      display_name: '123 Test St, Test Suburb, QLD 4000',
    }

    const originalFetch = global.fetch
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => [mockResponse],
      } as Response
    }

    const geocodingService = new GeocodingService()
    Object.defineProperty(geocodingService, 'apiKey', {
      value: 'test-api-key',
      writable: true,
      configurable: true,
    })

    const result = await geocodingService.geocodeAddress('123 Test St')

    assert.equal(result.lat, -28.0)
    assert.equal(result.lon, 153.0)
    assert.equal(result.display_name, mockResponse.display_name)

    global.fetch = originalFetch
  })

  test('should throw error when geocoding fails', async ({ assert }) => {
    const originalFetch = global.fetch
    global.fetch = async () => {
      // Return failure for both primary and fallback requests
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Internal Server Error',
      } as Response
    }

    const geocodingService = new GeocodingService()
    Object.defineProperty(geocodingService, 'apiKey', {
      value: 'test-api-key',
      writable: true,
      configurable: true,
    })

    await assert.rejects(
      async () => {
        await geocodingService.geocodeAddress('123 Test St')
      },
      Error,
      'Failed to geocode address'
    )

    global.fetch = originalFetch
  })

  test('should throw error when no results found', async ({ assert }) => {
    const originalFetch = global.fetch
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => [],
      } as Response
    }

    const geocodingService = new GeocodingService()
    Object.defineProperty(geocodingService, 'apiKey', {
      value: 'test-api-key',
      writable: true,
      configurable: true,
    })

    await assert.rejects(
      async () => {
        await geocodingService.geocodeAddress('123 Test St')
      },
      Error,
      'No results found'
    )

    global.fetch = originalFetch
  })
})
