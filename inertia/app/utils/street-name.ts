/**
 * Common Australian street type abbreviations mapped to their full forms.
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
 * Lowercases and expands common abbreviations (St -> Street, Rd -> Road, etc.)
 */
export function normalizeStreetName(streetName: string): string {
  const trimmed = streetName.trim().toLowerCase()
  const words = trimmed.split(/\s+/)

  if (words.length > 1) {
    const lastWord = words[words.length - 1]
    if (STREET_TYPE_ABBREVIATIONS[lastWord]) {
      words[words.length - 1] = STREET_TYPE_ABBREVIATIONS[lastWord]
    }
  }

  return words.join(' ')
}
