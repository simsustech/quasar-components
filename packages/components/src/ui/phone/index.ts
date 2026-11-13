export { default as QTelephoneNumber } from './QTelephoneNumber.vue'
export type { Props as QTelephoneNumberProps } from './QTelephoneNumber.vue'
export {
  isValidPhoneNumber,
  formatInternational,
  formatNationalNumber,
  parsePhoneNumber
} from './helpers.js'
export {
  defaultCountries,
  countryCallingCode,
  type PhoneCountry
} from './countries.js'
export { useLang, loadLang } from '../form/lang/index.js'
