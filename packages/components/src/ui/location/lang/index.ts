import type { Ref } from 'vue'
import { ref } from 'vue'
import en from './en-US.js'

/**
 * The location module's own language pack. It is deliberately not
 * `../form/lang`: a consumer of the `./location` subpath never imports the form
 * module, so borrowing that store left `nl` and `de` unreachable for them and
 * made the strings depend on whether some other subpath happened to be loaded.
 *
 * `fields` carries only the two labels `QLocationAddress` renders itself
 * (`postalCode`, `city`); the rest of the form module's field labels stay where
 * they are.
 */
export interface LocationLanguage {
  isoName: string
  fields: {
    postalCode: string
    city: string
  }
  validations: {
    fieldRequired: string
  }
  location: {
    searchPlaceholder: string
    noResults: string
    geocodeFailed: string
    mapFailed: string
    attribution: string
    copyCoordinates: string
    whatsHere: string
    movePinHere: string
    centerHere: string
    clearPin: string
    map: string
    coordinatesCopied: string
    copyFailed: string
    closeAddress: string
    street: string
    houseNumber: string
    country: string
  }
}

export const lang = ref<LocationLanguage>(en)

const locales = import.meta.glob<{ default: LocationLanguage }>([
  './*.ts',
  '!./index.ts'
])

export const defineLang = (value: LocationLanguage) => {
  return value
}

export const useLang = () => {
  return lang as Ref<LocationLanguage>
}

let loadingLanguage = false
export const loadLang = async (isoName: string) => {
  if (!loadingLanguage) {
    loadingLanguage = true
    try {
      const data = (await locales[`./${isoName}.ts`]()).default

      if (data) {
        lang.value = data
      }
    } catch (e) {
      if (import.meta.env.DEBUG) console.error(e)
      throw new Error(
        `[quasar-components] Failed to load location ${isoName} language file.`
      )
    }
    loadingLanguage = false
  }
}
