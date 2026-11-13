import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min'
import { toCountryCode } from './helpers.js'

export interface PhoneCountry {
  iso3166: string
  name: string
  icon?: string
}

const displayNames = (locale: string) => {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' })
  } catch {
    return undefined
  }
}

/**
 * Every country `libphonenumber-js/min` has metadata for (245 of them, which is
 * more than the 45 in `lang.countries`), named in `locale` by
 * `Intl.DisplayNames` and sorted the way that locale sorts.
 *
 * Countries the region data has no name for — Kosovo, Ascension — keep their
 * code as the name rather than disappearing.
 */
export const defaultCountries = (locale = 'en'): PhoneCountry[] => {
  const names = displayNames(locale)
  return getCountries()
    .map((iso3166) => ({ iso3166, name: names?.of(iso3166) ?? iso3166 }))
    .sort((a, b) => a.name.localeCompare(b.name, locale))
}

/**
 * The dial code without the `+` (`31`), or `undefined` for a code the metadata
 * does not know. Never throws: `getCountryCallingCode` throws on unknown and
 * lower-case input, and a `countries` prop can carry either.
 */
export const countryCallingCode = (iso3166: string): string | undefined => {
  const code = toCountryCode(iso3166)
  if (!code) return undefined
  try {
    return getCountryCallingCode(code)
  } catch {
    return undefined
  }
}
