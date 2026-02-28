export interface ZylaPropertyResponse {
  prettyUrl: string
  totalResultsCount: number
  resolvedLocalities: Array<{
    display: string
    precision: string
    atlasId: string
    state: string
  }>
  resolvedQuery: {
    localities: Array<{
      locality: string
      searchLocation: string
    }>
    channel: string
    pageSize: string
    page: string
    filters: {
      surroundingSuburbs: boolean
      maxSoldAge: {
        value: string
        unit: string
      }
    }
  }
  tieredResults: Array<{
    tier: number
    count: number
    results: ZylaProperty[]
  }>
}

export interface ZylaProperty {
  prettyUrl: string
  standard: boolean
  midtier: boolean
  featured: boolean
  signature: boolean
  constructionStatus: string
  channel: string
  description: string
  title: string
  features: {
    general: {
      bedrooms: number
      bathrooms: number
      parkingSpaces: number
    }
  }
  propertyTypeId: string
  landSize: {
    displayAppAbbreviated: string
    displayApp: string
    unit: string
    value: number
    display: string
  }
  price: {
    display: string
  }
  propertyType: string
  propertyTypeDisplay: string
  address: {
    streetAddress: string
    locality: string
    postcode: string
    suburb: string
    postCode: string
    location: {
      latitude: number
      longitude: number
    }
    subdivisionCode: string
    state: string
    showAddress: boolean
  }
  // For sold properties
  dateSold?: {
    display: string
    value: string
  }
  // For rental properties
  dateListed?: {
    display: string
    value: string
  }
  agency: {
    website: string
    address: {
      streetAddress: string
      postcode: string
      suburb: string
      state: string
    }
    phoneNumber: string
    branded: boolean
    name: string
    agencyId: string
    email: string
  }
  isSoldChannel: boolean
  isBuyChannel: boolean
  isRentChannel?: boolean
}

export type ListingType = 'sold' | 'rent'

export interface PropertyNotificationDetail {
  address: {
    singleLineAddress: string
  }
  propertyType: string
  propertySubType: string
  settlementDate: string
  saleType: string
}

export interface PropertySummary {
  address: {
    singleLineAddress: string
  }
  attributes: {
    bathrooms: number
    bedrooms: number
    carSpaces: number
    isCalculatedLandArea: boolean
    landArea: number
    lockUpGarages: number
  }
  coordinate: {
    latitude: number
    longitude: number
  }
  id: number
  isActiveProperty: boolean
  lastSaleDetail: {
    agency: string
    agent?: string
    contractDate: string
    isAgentsAdvice: boolean
    isArmsLength: boolean
    isPriceWithheld: boolean
    price: number
    settlementDate: string
    type: string
  }
  locationIdentifiers: {
    councilAreaId: number
    localityId: number
    postCodeId: number
    streetId: number
  }
  propertyPhoto: {
    largePhotoUrl: string
    mediumPhotoUrl: string
    scanDate: string
    thumbnailPhotoUrl: string
  }
  propertyStatus: {
    otmForRent: boolean
    otmForSale: boolean
    recentSale: boolean
  }
  propertySubType: string
  propertyType: string
  radiusSummary?: {
    distanceFromPoint: string
  }
}

export interface PaginatedResponse {
  _embedded: {
    propertySummaryList: Array<{
      propertySummary: PropertySummary
    }>
  }
  _links: {
    first: { href: string }
    self: { href: string }
    next?: { href: string }
    last: { href: string }
  }
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export type FeedbackStatus =
  | 'Not Visited'
  | 'Visited'
  | 'pending'

export interface Property {
  uid: string
  id?: number
  address: string
  feedbackStatus: FeedbackStatus
  visitor: string | null
  visited: boolean
  date_of_visit: string | null
  date_sold: string | null
  date_listed: string | null
  date_delisted: string | null
  listing_type: ListingType
  rental_price: string | null
  latitude: number | null
  longitude: number | null
  streetName: string | null
  postcode: string | null
  visit_outcome: string | null
}
