export interface Language {
  isoName: string
  unprocessableRequest: string
  myAccount: string
  signOut: string
  consent: {
    message: (name: string) => string
    deny: string
    allow: string
  }
  email: {
    fields: {
      email: string
      newEmail: string
      repeatNewEmail: string
    }
    validations: {
      fieldRequired: string
      invalidEmail: string
      emailsDoNotMatch: string
    }
    changeEmail: string
    emailChanged: string
  }
  login: {
    fields: {
      email: string
      password: string
      username: string
    }
    validations: {
      fieldRequired: string
      invalidEmail: string
    }
    login: string
    loginWith: string
    forgotPassword: string
    createAccount: string
    invalidCredentials: string
  }
  otp: {
    fields: {
      email: string
    }
    validations: {
      fieldRequired: string
      invalidEmail: string
    }
    messages: {
      unknownEmail: string
    }
    request: string
    checkEmail: string
    verificationCode: string
  }
  password: {
    fields: {
      password: string
      repeatPassword: string
    }
    validations: {
      fieldRequired: string
      minimumPasswordLength: (minimumPasswordLength: number) => string
      passwordsDoNotMatch: string
    }
    changePassword: string
    passwordChanged: string
  }
  register: {
    fields: {
      email: string
      password: string
      repeatPassword: string
      username: string
    }
    validations: {
      fieldRequired: string
      invalidEmail: string
      notAlphaNumeric: string
    }
    register: string
    forgotPassword: string
    accountCreated: string
    alreadyRegistered: string
  }
  verification: {
    slider: string
  }
}

import type { Ref } from 'vue'
import { ref } from 'vue'
import en from './en-US'
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
