import type { Language } from './index.js'

const lang: Language = {
  isoName: 'de',
  yes: 'Ja',
  no: 'Nein',
  selectMultiple: 'Wählen Sie eines oder mehrere aus',
  noResultsAvailable: 'Keine Ergebnisse verfügbar.',
  buttons: {
    close: 'Schließen'
  },
  email: {
    subject: 'Betreff'
  },
  fields: {
    name: 'Name',
    firstName: 'Vorname',
    lastName: 'Nachname',
    address: 'Adresse',
    postalCode: 'PLZ',
    city: 'Ort',
    telephoneNumber: 'Telefonnummer'
  },
  validations: {
    fieldRequired: 'Feld ist ein Pflichtfeld.'
  },
  gender: {
    gender: 'Geschlecht',
    male: 'Männlich',
    female: 'Weiblich',
    other: 'Andere'
  },
  postalCode: {
    postalCode: 'PLZ',
    validations: {
      invalidPostalCode: 'Ungültige Postleitzahl'
    }
  },
  datePicker: {
    date: 'Datum',
    placeholder: 'JJJJ/MM/TT',
    YYYY: 'JJJJ',
    MM: 'MM',
    DD: 'TT',
    validations: {
      unavailableRange:
        'Der ausgewählte Zeitraum enthält nicht verfügbare Daten.'
    }
  },
  currency: {
    currency: 'Währung',
    EUR: 'Euro',
    USD: 'USD'
  },
  locale: {
    locale: 'Region'
  },
  cron: {
    name: 'Wiederholung',
    minute: 'Minute',
    hour: 'Stunde',
    dayOfMonth: 'Tag des Monats',
    month: 'Monat',
    dayOfWeek: 'Wochentag',
    every: {
      minute: 'Jede Minute',
      hour: 'Jede Stunde',
      dayOfMonth: 'Jeden Tag',
      month: 'Jeden Monat',
      dayOfWeek: 'Jeden Wochentag'
    },
    validations: {
      invalidCron: 'Cron-Ausdruck ist ungültig.'
    }
  },
  countries: {
    SA: 'Saudi-Arabien',
    BD: 'Bangladesch',
    IN: 'Indien',
    CZ: 'Tschechien',
    DK: 'Dänemark',
    AT: 'Österreich',
    CH: 'Schweiz',
    DE: 'Deutschland',
    GR: 'Griechenland',
    AU: 'Australien',
    CA: 'Kanada',
    GB: 'Vereinigtes Königreich',
    IE: 'Irland',
    NZ: 'Neuseeland',
    US: 'Vereinigte Staaten',
    ZA: 'Südafrika',
    AR: 'Argentinien',
    CL: 'Chile',
    CO: 'Kolumbien',
    ES: 'Spanien',
    MX: 'Mexiko',
    FI: 'Finnland',
    BE: 'Belgien',
    FR: 'Frankreich',
    IL: 'Israel',
    HU: 'Ungarn',
    ID: 'Indonesien',
    IT: 'Italien',
    JP: 'Japan',
    KR: 'Südkorea',
    NL: 'Niederlande',
    NO: 'Norwegen',
    PL: 'Polen',
    BR: 'Brasilien',
    PT: 'Portugal',
    RO: 'Rumänien',
    RU: 'Russland',
    SK: 'Slowakei',
    SE: 'Schweden',
    LK: 'Sri Lanka',
    TH: 'Thailand',
    TR: 'Türkei',
    CN: 'China',
    HK: 'Hongkong',
    TW: 'Taiwan'
  },
  languages: {
    ar: 'Arabisch',
    bn: 'Bengalisch',
    cs: 'Tschechisch',
    da: 'Dänisch',
    de: 'Deutsch',
    el: 'Griechisch',
    en: 'Englisch',
    es: 'Spanisch',
    fi: 'Finnisch',
    fr: 'Französisch',
    he: 'Hebräisch',
    hi: 'Hindi',
    hu: 'Ungarisch',
    id: 'Indonesisch',
    it: 'Italienisch',
    ja: 'Japanisch',
    ko: 'Koreanisch',
    nl: 'Niederländisch',
    no: 'Norwegisch',
    pl: 'Polnisch',
    pt: 'Portugiesisch',
    ro: 'Rumänisch',
    ru: 'Russisch',
    sk: 'Slowakisch',
    sv: 'Schwedisch',
    ta: 'Tamil',
    th: 'Thailändisch',
    tr: 'Türkisch',
    zh: 'Chinesisch'
  },
  bcp47: {
    'ar-SA': { language: 'Arabisch', country: 'Saudi-Arabien' },
    'bn-BD': { language: 'Bengalisch', country: 'Bangladesch' },
    'bn-IN': { language: 'Bengalisch', country: 'Indien' },
    'cs-CZ': { language: 'Tschechisch', country: 'Tschechien' },
    'da-DK': { language: 'Dänisch', country: 'Dänemark' },
    'de-AT': { language: 'Deutsch', country: 'Österreich' },
    'de-CH': { language: 'Deutsch', country: 'Schweiz' },
    'de-DE': { language: 'Deutsch', country: 'Deutschland' },
    'el-GR': { language: 'Griechisch', country: 'Griechenland' },
    'en-AU': { language: 'Englisch', country: 'Australien' },
    'en-CA': { language: 'Englisch', country: 'Kanada' },
    'en-GB': { language: 'Englisch', country: 'Vereinigtes Königreich' },
    'en-IE': { language: 'Englisch', country: 'Irland' },
    'en-IN': { language: 'Englisch', country: 'Indien' },
    'en-NZ': { language: 'Englisch', country: 'Neuseeland' },
    'en-US': { language: 'Englisch', country: 'Vereinigte Staaten' },
    'en-ZA': { language: 'Englisch', country: 'Südafrika' },
    'es-AR': { language: 'Spanisch', country: 'Argentinien' },
    'es-CL': { language: 'Spanisch', country: 'Chile' },
    'es-CO': { language: 'Spanisch', country: 'Kolumbien' },
    'es-ES': { language: 'Spanisch', country: 'Spanien' },
    'es-MX': { language: 'Spanisch', country: 'Mexiko' },
    'es-US': { language: 'Spanisch', country: 'Vereinigte Staaten' },
    'fi-FI': { language: 'Finnisch', country: 'Finnland' },
    'fr-BE': { language: 'Französisch', country: 'Belgien' },
    'fr-CA': { language: 'Französisch', country: 'Kanada' },
    'fr-CH': { language: 'Französisch', country: 'Schweiz' },
    'fr-FR': { language: 'Französisch', country: 'Frankreich' },
    'he-IL': { language: 'Hebräisch', country: 'Israel' },
    'hi-IN': { language: 'Hindi', country: 'Indien' },
    'hu-HU': { language: 'Ungarisch', country: 'Ungarn' },
    'id-ID': { language: 'Indonesisch', country: 'Indonesien' },
    'it-CH': { language: 'Italienisch', country: 'Schweiz' },
    'it-IT': { language: 'Italienisch', country: 'Italien' },
    'ja-JP': { language: 'Japanisch', country: 'Japan' },
    'ko-KR': { language: 'Koreanisch', country: 'Südkorea' },
    'nl-BE': { language: 'Niederländisch', country: 'Belgien' },
    'nl-NL': { language: 'Niederländisch', country: 'Niederlande' },
    'no-NO': { language: 'Norwegisch', country: 'Norwegen' },
    'pl-PL': { language: 'Polnisch', country: 'Polen' },
    'pt-BR': { language: 'Portugiesisch', country: 'Brasilien' },
    'pt-PT': { language: 'Portugiesisch', country: 'Portugal' },
    'ro-RO': { language: 'Rumänisch', country: 'Rumänien' },
    'ru-RU': { language: 'Russisch', country: 'Russische Föderation' },
    'sk-SK': { language: 'Slowakisch', country: 'Slowakei' },
    'sv-SE': { language: 'Schwedisch', country: 'Schweden' },
    'ta-IN': { language: 'Tamil', country: 'Indien' },
    'ta-LK': { language: 'Tamil', country: 'Sri Lanka' },
    'th-TH': { language: 'Thailändisch', country: 'Thailand' },
    'tr-TR': { language: 'Türkisch', country: 'Türkei' },
    'zh-CN': { language: 'Chinesisch', country: 'China' },
    'zh-HK': { language: 'Chinesisch', country: 'Hongkong' },
    'zh-TW': { language: 'Chinesisch', country: 'Taiwan' }
  }
}

export default lang
