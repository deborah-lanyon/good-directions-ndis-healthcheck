export interface User {
  fullName: string
  email: string
  password: string
}

export interface Church {
  id: number
  userId: number
  churchName: string
  url: string
  address: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  latitude: number | null
  longitude: number | null
  suburb: string | null
  postcode: string | null
  radius: number | null
  country?: string | null
  mapBounds?: any | null
  mapZoom?: number | null
}
