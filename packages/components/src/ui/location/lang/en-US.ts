import type { LocationLanguage } from './index.js'

const lang: LocationLanguage = {
  isoName: 'en-US',
  // Only the two field labels `QLocationAddress` draws itself; the rest of the
  // form module's `fields` block is not this module's business.
  fields: {
    postalCode: 'Postal code',
    city: 'City'
  },
  validations: {
    fieldRequired: 'Field is required.'
  },
  location: {
    searchPlaceholder: 'Search for an address',
    noResults: 'No addresses found.',
    geocodeFailed: 'Address lookup failed.',
    mapFailed: 'Could not load the map.',
    attribution: 'Map attribution',
    copyCoordinates: 'Copy coordinates',
    whatsHere: "What's here?",
    movePinHere: 'Move pin here',
    centerHere: 'Center map here',
    map: 'Map',
    clearPin: 'Clear pin',
    coordinatesCopied: 'Coordinates copied.',
    closeAddress: 'Close address',
    copyFailed: 'Could not copy the coordinates.',
    street: 'Street',
    houseNumber: 'House number',
    country: 'Country'
  }
}

export default lang
