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
    AF: string
    AL: string
    DZ: string
    AS: string
    AD: string
    AO: string
    AI: string
    AQ: string
    AG: string
    AR: string
    AM: string
    AW: string
    AU: string
    AT: string
    AZ: string
    BS: string
    BH: string
    BD: string
    BB: string
    BY: string
    BE: string
    BZ: string
    BJ: string
    BM: string
    BT: string
    BO: string
    BQ: string
    BA: string
    BW: string
    BV: string
    BR: string
    IO: string
    BN: string
    BG: string
    BF: string
    BI: string
    KH: string
    CM: string
    CA: string
    CV: string
    KY: string
    CF: string
    TD: string
    CL: string
    CN: string
    CX: string
    CC: string
    CO: string
    KM: string
    CG: string
    CD: string
    CK: string
    CR: string
    HR: string
    CU: string
    CW: string
    CY: string
    CZ: string
    CI: string
    DK: string
    DJ: string
    DM: string
    DO: string
    EC: string
    EG: string
    SV: string
    GQ: string
    ER: string
    EE: string
    SZ: string
    ET: string
    FK: string
    FO: string
    FJ: string
    FI: string
    FR: string
    GF: string
    PF: string
    TF: string
    GA: string
    GM: string
    GE: string
    DE: string
    GH: string
    GI: string
    GR: string
    GL: string
    GD: string
    GP: string
    GU: string
    GT: string
    GG: string
    GN: string
    GW: string
    GY: string
    HT: string
    HM: string
    VA: string
    HN: string
    HK: string
    HU: string
    IS: string
    IN: string
    ID: string
    IR: string
    IQ: string
    IE: string
    IM: string
    IL: string
    IT: string
    JM: string
    JP: string
    JE: string
    JO: string
    KZ: string
    KE: string
    KI: string
    KP: string
    KR: string
    KW: string
    KG: string
    LA: string
    LV: string
    LB: string
    LS: string
    LR: string
    LY: string
    LI: string
    LT: string
    LU: string
    MO: string
    MK: string
    MG: string
    MW: string
    MY: string
    MV: string
    ML: string
    MT: string
    MH: string
    MQ: string
    MR: string
    MU: string
    YT: string
    MX: string
    FM: string
    MD: string
    MC: string
    MN: string
    ME: string
    MS: string
    MA: string
    MZ: string
    MM: string
    NA: string
    NR: string
    NP: string
    NL: string
    NC: string
    NZ: string
    NI: string
    NE: string
    NG: string
    NU: string
    NF: string
    MP: string
    NO: string
    OM: string
    PK: string
    PW: string
    PS: string
    PA: string
    PG: string
    PY: string
    PE: string
    PH: string
    PN: string
    PL: string
    PT: string
    PR: string
    QA: string
    RO: string
    RU: string
    RW: string
    RE: string
    BL: string
    SH: string
    KN: string
    LC: string
    MF: string
    PM: string
    VC: string
    WS: string
    SM: string
    ST: string
    SA: string
    SN: string
    RS: string
    SC: string
    SL: string
    SG: string
    SX: string
    SK: string
    SI: string
    SB: string
    SO: string
    ZA: string
    GS: string
    SS: string
    ES: string
    LK: string
    SD: string
    SR: string
    SJ: string
    SE: string
    CH: string
    SY: string
    TW: string
    TJ: string
    TZ: string
    TH: string
    TL: string
    TG: string
    TK: string
    TO: string
    TT: string
    TN: string
    TR: string
    TM: string
    TC: string
    TV: string
    UG: string
    UA: string
    AE: string
    GB: string
    US: string
    UM: string
    UY: string
    UZ: string
    VU: string
    VE: string
    VN: string
    VG: string
    VI: string
    WF: string
    EH: string
    YE: string
    ZM: string
    ZW: string
    AX: string
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
