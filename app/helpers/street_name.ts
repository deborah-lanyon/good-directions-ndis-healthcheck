/**
 * Common Australian street type abbreviations mapped to their full forms.
 * Used to normalize street names for comparison so that
 * "Market St" matches "Market Street", etc.
 */
const STREET_TYPE_ABBREVIATIONS: Record<string, string> = {
  'st': 'street',
  'rd': 'road',
  'ave': 'avenue',
  'av': 'avenue',
  'dr': 'drive',
  'ct': 'court',
  'crt': 'court',
  'pl': 'place',
  'cr': 'crescent',
  'cres': 'crescent',
  'tce': 'terrace',
  'ter': 'terrace',
  'pde': 'parade',
  'hwy': 'highway',
  'ln': 'lane',
  'cl': 'close',
  'cir': 'circuit',
  'cct': 'circuit',
  'blvd': 'boulevard',
  'gr': 'grove',
  'gv': 'grove',
  'wy': 'way',
}

/**
 * Normalize a street name for comparison purposes.
 * - Lowercases the string
 * - Expands common abbreviations (St -> Street, Rd -> Road, etc.)
 * - Trims whitespace
 *
 * This ensures "Market St" matches "Market Street" and "market street".
 */
export function normalizeStreetName(streetName: string): string {
  const trimmed = streetName.trim().toLowerCase()
  const words = trimmed.split(/\s+/)

  // Expand the last word if it's an abbreviation (street type is typically last)
  if (words.length > 1) {
    const lastWord = words[words.length - 1]
    if (STREET_TYPE_ABBREVIATIONS[lastWord]) {
      words[words.length - 1] = STREET_TYPE_ABBREVIATIONS[lastWord]
    }
  }

  return words.join(' ')
}

/**
 * Compare two street names, handling case differences and abbreviations.
 */
export function streetNamesMatch(a: string, b: string): boolean {
  return normalizeStreetName(a) === normalizeStreetName(b)
}
