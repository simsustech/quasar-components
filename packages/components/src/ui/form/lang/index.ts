interface LocaleEntry {
  language: string
  country: string
}

export type Locales =
  | 'ar-SA'
  | 'bn-BD'
  | 'bn-IN'
  | 'cs-CZ'
  | 'da-DK'
  | 'de-AT'
  | 'de-CH'
  | 'de-DE'
  | 'el-GR'
  | 'en-AU'
  | 'en-CA'
  | 'en-GB'
  | 'en-IE'
  | 'en-IN'
  | 'en-NZ'
  | 'en-US'
  | 'en-ZA'
  | 'es-AR'
  | 'es-CL'
  | 'es-CO'
  | 'es-ES'
  | 'es-MX'
  | 'es-US'
  | 'fi-FI'
  | 'fr-BE'
  | 'fr-CA'
  | 'fr-CH'
  | 'fr-FR'
  | 'he-IL'
  | 'hi-IN'
  | 'hu-HU'
  | 'id-ID'
  | 'it-CH'
  | 'it-IT'
  | 'ja-JP'
  | 'ko-KR'
  | 'nl-BE'
  | 'nl-NL'
  | 'no-NO'
  | 'pl-PL'
  | 'pt-BR'
  | 'pt-PT'
  | 'ro-RO'
  | 'ru-RU'
  | 'sk-SK'
  | 'sv-SE'
  | 'ta-IN'
  | 'ta-LK'
  | 'th-TH'
  | 'tr-TR'
  | 'zh-CN'
  | 'zh-HK'
  | 'zh-TW'

export type ISO639 =
  | 'ar'
  | 'bn'
  | 'bn'
  | 'cs'
  | 'da'
  | 'de'
  | 'de'
  | 'de'
  | 'el'
  | 'en'
  | 'en'
  | 'en'
  | 'en'
  | 'en'
  | 'en'
  | 'en'
  | 'en'
  | 'es'
  | 'es'
  | 'es'
  | 'es'
  | 'es'
  | 'es'
  | 'fi'
  | 'fr'
  | 'fr'
  | 'fr'
  | 'fr'
  | 'he'
  | 'hi'
  | 'hu'
  | 'id'
  | 'it'
  | 'it'
  | 'ja'
  | 'ko'
  | 'nl'
  | 'nl'
  | 'no'
  | 'pl'
  | 'pt'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'sv'
  | 'ta'
  | 'ta'
  | 'th'
  | 'tr'
  | 'zh'
  | 'zh'
  | 'zh'

export type ISO3166 =
  | 'SA'
  | 'BD'
  | 'IN'
  | 'CZ'
  | 'DK'
  | 'AT'
  | 'CH'
  | 'DE'
  | 'GR'
  | 'AU'
  | 'CA'
  | 'GB'
  | 'IE'
  | 'IN'
  | 'NZ'
  | 'US'
  | 'ZA'
  | 'AR'
  | 'CL'
  | 'CO'
  | 'ES'
  | 'MX'
  | 'US'
  | 'FI'
  | 'BE'
  | 'CA'
  | 'CH'
  | 'FR'
  | 'IL'
  | 'IN'
  | 'HU'
  | 'ID'
  | 'CH'
  | 'IT'
  | 'JP'
  | 'KR'
  | 'BE'
  | 'NL'
  | 'NO'
  | 'PL'
  | 'BR'
  | 'PT'
  | 'RO'
  | 'RU'
  | 'SK'
  | 'SE'
  | 'IN'
  | 'LK'
  | 'TH'
  | 'TR'
  | 'CN'
  | 'HK'
  | 'TW'

export interface Language {
  isoName: string
  yes: string
  no: string
  selectMultiple: string
  noResultsAvailable: string
  buttons: {
    close: string
  }
  email: {
    subject: string
  }
  fields: {
    name: string
    firstName: string
    lastName: string
    address: string
    postalCode: string
    city: string
    telephoneNumber: string
  }
  validations: {
    fieldRequired: string
  }
  gender: {
    gender: string
    male: string
    female: string
    other: string
  }
  postalCode: {
    postalCode: string
    validations: {
      invalidPostalCode: string
    }
  }
  datePicker: {
    date: string
    placeholder: string
    YYYY: string
    MM: string
    DD: string
    validations: {
      unavailableRange: string
    }
  }
  currency: {
    currency: string
    EUR: string
    USD: string
  }
  locale: {
    locale: string
  }
  cron: {
    name: string
    minute: string
    hour: string
    dayOfMonth: string
    month: string
    dayOfWeek: string
    every: {
      minute: string
      hour: string
      dayOfMonth: string
      month: string
      dayOfWeek: string
    }
    validations: {
      invalidCron: string
    }
  }
  countries: Record<ISO3166, string>
  languages: Record<ISO639, string>
  bcp47: Record<Locales, LocaleEntry>
}

import type { Ref } from 'vue'
import { ref } from 'vue'
import en from './en-US.js'
export const lang = ref(en)

const locales = import.meta.glob<{ default: Language }>([
  './*.ts',
  '!./index.ts'
])

export const defineLang = (lang: Language) => {
  return lang
}

export const useLang = () => {
  return lang as Ref<Language>
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
        `[quasar-components] Failed to load ${isoName} language file.`
      )
    }
    loadingLanguage = false
  }
}
