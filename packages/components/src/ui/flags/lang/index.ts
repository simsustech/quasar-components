export interface Language {
  isoName: string
  countries: {
    'ar-TN': string
    ar: string
    'az-Latn': string
    bg: string
    bn: string
    ca: string
    cs: string
    da: string
    de: string
    el: string
    'en-GB': string
    'en-US': string
    eo: string
    es: string
    et: string
    eu: string
    'fa-IR': string
    fa: string
    fi: string
    fr: string
    gn: string
    he: string
    hr: string
    hu: string
    id: string
    is: string
    it: string
    ja: string
    km: string
    'ko-KR': string
    'kur-CKB': string
    kz: string
    lt: string
    lu: string
    lv: string
    ml: string
    mm: string
    ms: string
    my: string
    'nb-NO': string
    nl: string
    pl: string
    'pt-BR': string
    pt: string
    ro: string
    ru: string
    sk: string
    sl: string
    sm: string
    'sr-CYR': string
    sr: string
    sv: string
    ta: string
    th: string
    tr: string
    ug: string
    uk: string
    'uz-Cyrl': string
    'uz-Latn': string
    vi: string
    'zh-CN': string
    'zh-TW': string
  }
  languages: {
    'ar-TN': string
    ar: string
    'az-Latn': string
    bg: string
    bn: string
    ca: string
    cs: string
    da: string
    de: string
    el: string
    'en-GB': string
    'en-US': string
    eo: string
    es: string
    et: string
    eu: string
    'fa-IR': string
    fa: string
    fi: string
    fr: string
    gn: string
    he: string
    hr: string
    hu: string
    id: string
    is: string
    it: string
    ja: string
    km: string
    'ko-KR': string
    'kur-CKB': string
    kz: string
    lt: string
    lu: string
    lv: string
    ml: string
    mm: string
    ms: string
    my: string
    'nb-NO': string
    nl: string
    pl: string
    'pt-BR': string
    pt: string
    ro: string
    ru: string
    sk: string
    sl: string
    sm: string
    'sr-CYR': string
    sr: string
    sv: string
    ta: string
    th: string
    tr: string
    ug: string
    uk: string
    'uz-Cyrl': string
    'uz-Latn': string
    vi: string
    'zh-CN': string
    'zh-TW': string
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
