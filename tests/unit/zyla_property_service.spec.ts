import { test } from '@japa/runner'
import { ZylaPropertyService } from '#services/zyla_property_service'
import type { ZylaPropertyResponse } from '../../app/types/property.js'

test.group('ZylaPropertyService', () => {
  test('should instantiate ZylaPropertyService', async ({ assert }) => {
    const zylaService = new ZylaPropertyService()
    assert.exists(zylaService)
  })

  test('should fetch properties successfully', async ({ assert }) => {
    const mockResponse: ZylaPropertyResponse = {
      prettyUrl: '',
      totalResultsCount: 10,
      resolvedLocalities: [],
      resolvedQuery: {
        localities: [],
        channel: 'sold',
        pageSize: '5',
        page: '1',
        filters: {
          surroundingSuburbs: true,
          maxSoldAge: {
            value: '1',
            unit: 'month',
          },
        },
      },
      tieredResults: [
        {
          tier: 1,
          count: 2,
          results: [
            {
              address: {
                streetAddress: '123 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.0,
                  longitude: 153.0,
                },
              },
              dateSold: {
                value: '2024-01-15',
              },
              propertyType: 'HOUSE',
              propertyTypeDisplay: 'House: Standard',
            } as any,
          ],
        },
      ],
    }

    const originalFetch = global.fetch
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => mockResponse,
      } as Response
    }

    const zylaService = new ZylaPropertyService()
    Object.defineProperty(zylaService, 'zylaApiKey', {
      value: 'test-api-key',
      writable: true,
      configurable: true,
    })

    const result = await zylaService.fetchProperties({
      searchLocation: 'Test Suburb',
      maxSoldAge: 1,
    })

    assert.exists(result)
    assert.equal(result.totalFromApi, 10)
    assert.equal(result.propertiesReported, 2)
    assert.equal(result.properties.length, 2)

    global.fetch = originalFetch
  })

  test('should handle multiple pages', async ({ assert }) => {
    const mockPage1: ZylaPropertyResponse = {
      prettyUrl: '',
      totalResultsCount: 10,
      resolvedLocalities: [],
      resolvedQuery: {
        localities: [],
        channel: 'sold',
        pageSize: '5',
        page: '1',
        filters: {
          surroundingSuburbs: true,
          maxSoldAge: {
            value: '1',
            unit: 'month',
          },
        },
      },
      tieredResults: [
        {
          tier: 1,
          count: 5,
          results: [
            {
              address: {
                streetAddress: '123 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.0,
                  longitude: 153.0,
                },
              },
              dateSold: {
                value: '2024-01-15',
              },
              propertyType: 'HOUSE',
              propertyTypeDisplay: 'House: Standard',
            } as any,
            {
              address: {
                streetAddress: '124 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.01,
                  longitude: 153.01,
                },
              },
              dateSold: {
                value: '2024-01-16',
              },
              propertyType: 'HOUSE',
              propertyTypeDisplay: 'House: Standard',
            } as any,
            {
              address: {
                streetAddress: '125 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.02,
                  longitude: 153.02,
                },
              },
              dateSold: {
                value: '2024-01-17',
              },
              propertyType: 'HOUSE',
              propertyTypeDisplay: 'House: Standard',
            } as any,
            {
              address: {
                streetAddress: '126 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.03,
                  longitude: 153.03,
                },
              },
              dateSold: {
                value: '2024-01-18',
              },
              propertyType: 'HOUSE',
              propertyTypeDisplay: 'House: Standard',
            } as any,
            {
              address: {
                streetAddress: '127 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.04,
                  longitude: 153.04,
                },
              },
              dateSold: {
                value: '2024-01-19',
              },
              propertyType: 'HOUSE',
              propertyTypeDisplay: 'House: Standard',
            } as any,
          ],
        },
      ],
    }

    const mockPage2: ZylaPropertyResponse = {
      prettyUrl: '',
      totalResultsCount: 10,
      resolvedLocalities: [],
      resolvedQuery: {
        localities: [],
        channel: 'sold',
        pageSize: '5',
        page: '2',
        filters: {
          surroundingSuburbs: true,
          maxSoldAge: {
            value: '1',
            unit: 'month',
          },
        },
      },
      tieredResults: [
        {
          tier: 1,
          count: 5,
          results: [
            {
              address: {
                streetAddress: '456 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.1,
                  longitude: 153.1,
                },
              },
              dateSold: {
                value: '2024-01-20',
              },
              propertyType: 'UNIT',
              propertyTypeDisplay: 'Unit: Apartment',
            } as any,
            {
              address: {
                streetAddress: '457 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.11,
                  longitude: 153.11,
                },
              },
              dateSold: {
                value: '2024-01-21',
              },
              propertyType: 'UNIT',
              propertyTypeDisplay: 'Unit: Apartment',
            } as any,
            {
              address: {
                streetAddress: '458 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.12,
                  longitude: 153.12,
                },
              },
              dateSold: {
                value: '2024-01-22',
              },
              propertyType: 'UNIT',
              propertyTypeDisplay: 'Unit: Apartment',
            } as any,
            {
              address: {
                streetAddress: '459 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.13,
                  longitude: 153.13,
                },
              },
              dateSold: {
                value: '2024-01-23',
              },
              propertyType: 'UNIT',
              propertyTypeDisplay: 'Unit: Apartment',
            } as any,
            {
              address: {
                streetAddress: '460 Test St',
                suburb: 'Test Suburb',
                postcode: '4000',
                location: {
                  latitude: -28.14,
                  longitude: 153.14,
                },
              },
              dateSold: {
                value: '2024-01-24',
              },
              propertyType: 'UNIT',
              propertyTypeDisplay: 'Unit: Apartment',
            } as any,
          ],
        },
      ],
    }

    let pageCallCount = 0
    const originalFetch = global.fetch
    global.fetch = async () => {
      pageCallCount++
      return {
        ok: true,
        json: async () => (pageCallCount === 1 ? mockPage1 : mockPage2),
      } as Response
    }

    const zylaService = new ZylaPropertyService()
    Object.defineProperty(zylaService, 'zylaApiKey', {
      value: 'test-api-key',
      writable: true,
      configurable: true,
    })

    const result = await zylaService.fetchProperties({
      searchLocation: 'Test Suburb',
      maxSoldAge: 1,
    })

    assert.exists(result)
    assert.equal(result.totalFromApi, 10)
    assert.equal(result.propertiesReported, 10)
    assert.equal(result.properties.length, 10)
    assert.equal(pageCallCount, 2)

    global.fetch = originalFetch
  })

  test('should throw error when fetch fails', async ({ assert }) => {
    const originalFetch = global.fetch
    global.fetch = async () => {
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response
    }

    const zylaService = new ZylaPropertyService()
    Object.defineProperty(zylaService, 'zylaApiKey', {
      value: 'test-api-key',
      writable: true,
      configurable: true,
    })

    await assert.rejects(
      () =>
        zylaService.fetchProperties({
          searchLocation: 'Test Suburb',
          maxSoldAge: 1,
        }),
      'Failed to fetch properties page 1: 500 Internal Server Error'
    )

    global.fetch = originalFetch
  })

  test('should retry on failure', async ({ assert }) => {
    let callCount = 0
    const originalFetch = global.fetch
    global.fetch = async () => {
      callCount++
      if (callCount === 1) {
        return {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response
      }
      return {
        ok: true,
        json: async () => ({
          prettyUrl: '',
          totalResultsCount: 5,
          resolvedLocalities: [],
          resolvedQuery: {
            localities: [],
            channel: 'sold',
            pageSize: '5',
            page: '1',
            filters: {
              surroundingSuburbs: true,
              maxSoldAge: {
                value: '1',
                unit: 'month',
              },
            },
          },
          tieredResults: [
            {
              tier: 1,
              count: 5,
              results: [],
            },
          ],
        }),
      } as Response
    }

    const zylaService = new ZylaPropertyService()
    Object.defineProperty(zylaService, 'zylaApiKey', {
      value: 'test-api-key',
      writable: true,
      configurable: true,
    })

    const result = await zylaService.fetchProperties({
      searchLocation: 'Test Suburb',
      maxSoldAge: 1,
    })

    assert.exists(result)
    assert.equal(callCount, 2)

    global.fetch = originalFetch
  })
})
