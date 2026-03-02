import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const updateChurchProfileValidator = vine.compile(
  vine.object({
    churchName: vine.string().optional(),
    url: vine.string().url().optional(),
    address: vine.string(),
    addressLine1: vine.string().optional(),
    addressLine2: vine.string().optional(),
    country: vine.string().optional(),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
    suburb: vine.string().trim().minLength(1),
    postcode: vine.string().trim().minLength(1),
    radius: vine.number().positive().optional(),
    mapBounds: vine.any().optional(),
    mapZoom: vine.number().optional(),
  })
)

export const profileErrorMessages = new SimpleMessagesProvider({
  'churchName': 'Church name must be a string',
  'churchName.required': 'A church name is required',
  'url': 'URL must be a valid URL',
  'url.required': 'A URL is required',
  'address.required': 'An address is required',
  'latitude': 'Latitude must be a number',
  'longitude': 'Longitude must be a number',
  'suburb': 'Suburb must be a string',
  'suburb.required': 'A suburb is required',
  'suburb.minLength': 'Suburb cannot be empty',
  'postcode': 'Postcode must be a string',
  'postcode.required': 'A postcode is required',
  'postcode.minLength': 'Postcode cannot be empty',
})
