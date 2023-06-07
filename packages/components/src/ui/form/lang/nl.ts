import type { Language } from '../lang'

const lang: Language = {
  isoName: 'nl',
  yes: 'Ja',
  no: 'Nee',
  buttons: {
    close: 'Sluiten'
  },
  email: {
    subject: 'Onderwerp'
  },
  fields: {
    name: 'Naam',
    firstName: 'Voornaam',
    lastName: 'Achternaam',
    address: 'Adres',
    postalCode: 'Postcode',
    city: 'Woonplaats',
    telephoneNumber: 'Telefoonnumer'
  },
  validations: {
    fieldRequired: 'Veld is vereist.'
  },
  gender: {
    gender: 'Geslacht',
    male: 'Mannelijk',
    female: 'Vrouwelijk',
    other: 'Anders'
  },
  postalCode: {
    postalCode: 'Postcode',
    validations: {
      invalidPostalCode: 'Ongeldige postcode'
    }
  }
}

export default lang
