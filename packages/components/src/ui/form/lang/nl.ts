import type { Language } from '../lang'

const lang: Language = {
  isoName: 'nl',
  yes: 'Ja',
  no: 'Nee',
  buttons: {
    close: 'Sluiten'
  },
  fields: {
    name: 'Naam',
    firstName: 'Voornaam',
    surname: 'Achternaam',
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
    male: 'Man',
    female: 'Vrouw',
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
