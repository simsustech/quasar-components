import type { Language } from '../lang'

const lang: Language = {
  isoName: 'en-US',
  yes: 'Yes',
  no: 'No',
  buttons: {
    close: 'Close'
  },
  fields: {
    name: 'Name',
    firstName: 'First name',
    lastName: 'Surname',
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
  }
}

export default lang
