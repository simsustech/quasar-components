import {
  parsePhoneNumberFromString,
  type CountryCode,
  type PhoneNumber
} from 'libphonenumber-js/min'

/**
 * ISO codes reach `libphonenumber-js` from a `countries`/`country` prop, so the
 * case is whatever the consumer stored. The library throws `Unknown country:
 * nl` on the lower-case form and knows nothing about the wider `ISO3166` union
 * in `form/lang`, so every lookup goes through here.
 */
export const toCountryCode = (country?: string): CountryCode | undefined =>
  country ? (country.toUpperCase() as CountryCode) : undefined

/**
 * Parse a phone number the way stored data actually looks: E.164 with or
 * without separators (`+31612345678`, `+31 6 12345678`) or a national number
 * that only means something with the selected country (`0612345678`,
 * `612345678`).
 *
 * `undefined` means "not a phone number at all" — empty, letters, a lone trunk
 * `0`. A returned number can still be invalid; `isValid()` decides that.
 */
export const parsePhoneNumber = (
  value: string,
  country?: string
): PhoneNumber | undefined => {
  const text = (value ?? '').trim()
  if (!text) return undefined
  return parsePhoneNumberFromString(text, toCountryCode(country))
}

/** `true` only for a number that passes the metadata's validity check. */
export const isValidPhoneNumber = (value: string, country?: string): boolean =>
  parsePhoneNumber(value, country)?.isValid() ?? false

/**
 * The spaced international form (`+31 6 12345678`). This is not the component's
 * model value any more; it is kept for callers that need a readable international
 * number. `undefined` when the value is not a phone number.
 */
export const formatInternational = (
  value: string,
  country?: string
): string | undefined => parsePhoneNumber(value, country)?.formatInternational()

/**
 * The national significant number with international grouping and no national
 * prefix (`6 12345678`, `470 12 34 56`), which is what the input displays beside
 * the dial code. The dial code is already visible in the prepend, so repeating
 * the trunk `0` here would read as a second prefix.
 *
 * Derived from `formatInternational()` rather than `formatNational()`: the latter
 * keeps the trunk prefix, and `{ nationalPrefix: false }` does not remove it for
 * the countries this kit serves. Non-geographic numbers have no national form, so
 * they keep their international one. `undefined` when the value is not a number.
 */
export const formatNationalNumber = (
  value: string,
  country?: string
): string | undefined => {
  const parsed = parsePhoneNumber(value, country)
  if (!parsed) return undefined
  if (!parsed.country) return parsed.formatInternational()
  const international = parsed.formatInternational()
  const prefix = `+${parsed.countryCallingCode}`
  return international.startsWith(`${prefix} `)
    ? international.slice(prefix.length + 1)
    : international
}
