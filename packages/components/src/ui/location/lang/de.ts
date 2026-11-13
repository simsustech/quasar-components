import type { LocationLanguage } from './index.js'

const lang: LocationLanguage = {
  isoName: 'de',
  fields: {
    postalCode: 'Postleitzahl',
    city: 'Ort'
  },
  validations: {
    fieldRequired: 'Feld ist ein Pflichtfeld.'
  },
  location: {
    searchPlaceholder: 'Adresse suchen',
    noResults: 'Keine Adressen gefunden.',
    geocodeFailed: 'Adresssuche fehlgeschlagen.',
    mapFailed: 'Karte konnte nicht geladen werden.',
    attribution: 'Kartenquellen',
    copyCoordinates: 'Koordinaten kopieren',
    whatsHere: 'Was ist hier?',
    movePinHere: 'Markierung hierher verschieben',
    centerHere: 'Karte hier zentrieren',
    map: 'Karte',
    clearPin: 'Markierung entfernen',
    coordinatesCopied: 'Koordinaten kopiert.',
    closeAddress: 'Adresse schließen',
    copyFailed: 'Koordinaten konnten nicht kopiert werden.',
    street: 'Straße',
    houseNumber: 'Hausnummer',
    country: 'Land'
  }
}

export default lang
