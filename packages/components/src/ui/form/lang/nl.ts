import type { Language } from './index.js'

const lang: Language = {
  isoName: 'nl',
  yes: 'Ja',
  no: 'Nee',
  selectMultiple: 'Selecteer één of meerdere',
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
    telephoneNumber: 'Telefoonnummer'
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
  },
  datePicker: {
    date: 'Datum',
    placeholder: 'JJJJ/MM/DD',
    YYYY: 'JJJJ',
    MM: 'MM',
    DD: 'DD',
    validations: {
      unavailableRange: 'De geselecteerde periode bevat ongeschikbare datums.'
    }
  },
  currency: {
    currency: 'Valuta',
    EUR: 'Euro',
    USD: 'USD'
  },
  locale: {
    locale: 'Regio'
  },
  cron: {
    name: 'Herhaling',
    minute: 'Minuut',
    hour: 'Uur',
    dayOfMonth: 'Dag van maand',
    month: 'Maand',
    dayOfWeek: 'Dag van week',
    every: {
      minute: 'Iedere minuut',
      hour: 'Ieder uur',
      dayOfMonth: 'Iedere dag',
      month: 'Iedere maand',
      dayOfWeek: 'Iedere dag van de week'
    },
    validations: {
      invalidCron: 'Cron regel is ongeldig.'
    }
  }
}

export default lang
