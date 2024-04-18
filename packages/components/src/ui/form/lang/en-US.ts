import type { Language } from './index.js'

const lang: Language = {
  isoName: 'en-US',
  yes: 'Yes',
  no: 'No',
  selectMultiple: 'Select one or multiple',
  buttons: {
    close: 'Close'
  },
  email: {
    subject: 'Subject'
  },
  fields: {
    name: 'Name',
    firstName: 'First name',
    lastName: 'Last name',
    address: 'Address',
    postalCode: 'Postal code',
    city: 'City',
    telephoneNumber: 'Telephone number'
  },
  validations: {
    fieldRequired: 'Field is required.'
  },
  gender: {
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other'
  },
  postalCode: {
    postalCode: 'Postal code',
    validations: {
      invalidPostalCode: 'Invalid postal code'
    }
  },
  datePicker: {
    placeholder: 'YYYY/MM/DD',
    YYYY: 'YYYY',
    MM: 'MM',
    DD: 'DD',
    validations: {
      unavailableRange: 'The selected period contains unavailable dates.'
    }
  },
  currency: {
    currency: 'Currency',
    EUR: 'Euro',
    USD: 'USD'
  }
}

export default lang
