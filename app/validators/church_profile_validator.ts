import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const updateChurchProfileValidator = vine.compile(
  vine.object({
    churchName: vine.string().optional(),
    url: vine.string().url().optional(),
    address: vine.string().optional(),
    addressLine1: vine.string().optional(),
    addressLine2: vine.string().optional(),
    country: vine.string().optional(),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
    suburb: vine.string().optional(),
    postcode: vine.string().trim().minLength(1),
    radius: vine.number().positive().optional(),
    mapBounds: vine.any().optional(),
    mapZoom: vine.number().optional(),
  })
)

export const profileErrorMessages = new SimpleMessagesProvider({
  'churchName': 'Territory name must be a string',
  'churchName.required': 'A territory name is required',
  'url': 'URL must be a valid URL',
  'url.required': 'A URL is required',
  'latitude': 'Latitude must be a number',
  'longitude': 'Longitude must be a number',
  'postcode': 'Postcode must be a string',
  'postcode.required': 'A postcode is required',
  'postcode.minLength': 'Postcode cannot be empty',
})
