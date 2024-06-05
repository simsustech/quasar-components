export interface Language {
  isoName: string
  yes: string
  no: string
  selectMultiple: string
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
