import type { LocationLanguage } from './index.js'

const lang: LocationLanguage = {
  isoName: 'nl',
  fields: {
    postalCode: 'Postcode',
    city: 'Plaats'
  },
  validations: {
    fieldRequired: 'Veld is vereist.'
  },
  location: {
    searchPlaceholder: 'Zoek een adres',
    noResults: 'Geen adressen gevonden.',
    geocodeFailed: 'Adres zoeken mislukt.',
    mapFailed: 'Kan de kaart niet laden.',
    attribution: 'Kaartinformatie',
    copyCoordinates: 'Coördinaten kopiëren',
    whatsHere: 'Wat is hier?',
    movePinHere: 'Speld hierheen verplaatsen',
    centerHere: 'Kaart hier centreren',
    map: 'Kaart',
    clearPin: 'Speld verwijderen',
    coordinatesCopied: 'Coördinaten gekopieerd.',
    closeAddress: 'Adres sluiten',
    copyFailed: 'Kan de coördinaten niet kopiëren.',
    street: 'Straat',
    houseNumber: 'Huisnummer',
    country: 'Land'
  }
}

export default lang
