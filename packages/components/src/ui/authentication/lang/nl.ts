import type { Language } from '../lang'

const lang: Language = {
  isoName: 'nl',
  myAccount: 'Account',
  signOut: 'Uitloggen',
  unprocessableRequest: 'De server kon de aanvraag niet verwerken.',
  consent: {
    message: (name: string) => `${name} vraagt toegang tot uw data.`,
    deny: 'Weigeren',
    allow: 'Accepteren'
  },
  email: {
    fields: {
      email: 'Email',
      newEmail: 'Uw nieuwe email adres',
      repeatNewEmail: 'Herhaal uw nieuwe email adres'
    },
    validations: {
      fieldRequired: 'Veld is vereist.',
      invalidEmail: 'Het email adres is ongeldig.',
      emailsDoNotMatch: 'Email adressen komen niet overeen.'
    },
    changeEmail: 'Verander uw email adres.',
    emailChanged: 'Uw email adres is gewijzigd.'
  },
  otp: {
    fields: {
      email: 'Email'
    },
    validations: {
      fieldRequired: 'Veld is vereist.',
      invalidEmail: 'Het email adres is ongeldig.'
    },
    request: 'Vraag een eenmalig wachtwoord aan.',
    checkEmail:
      'U ontvangt een verificatie code in uw mailbox. Gebruik deze code in de volgende stap.',
    verificationCode: 'Verificatie code'
  },
  login: {
    fields: {
      email: 'Email',
      password: 'Wachtwoord',
      username: 'Gebruikersnaam'
    },
    validations: {
      fieldRequired: 'Veld is vereist.',
      invalidEmail: 'Het email adres is ongeldig.'
    },
    login: 'Inloggen',
    loginWith: 'Inloggen met',
    createAccount: 'Account aanmaken',
    forgotPassword: 'Wachtwoord vergeten?',
    invalidCredentials: 'Email adres of wachtwoord is incorrect'
  },
  password: {
    fields: {
      password: 'Wachtwoord',
      repeatPassword: 'Herhaal wachtwoord'
    },
    validations: {
      fieldRequired: 'Veld is vereist',
      minimumPasswordLength: (minimumPasswordLength) =>
        `De minimum lengte van een wachtwoord is ${minimumPasswordLength} tekens.`,
      passwordsDoNotMatch: 'De wachtwoorden komen niet overeen.'
    },
    changePassword: 'Verander uw wachtwoord.',
    passwordChanged: 'Uw wachtwoord is gewijzigd.'
  },
  register: {
    fields: {
      email: 'Email',
      password: 'Wachtwoord',
      username: 'Gebruikersnaam',
      repeatPassword: 'Herhaal wachtwoord'
    },
    validations: {
      fieldRequired: 'Veld is vereist',
      invalidEmail: 'Het email adres is ongeldig.',
      notAlphaNumeric: 'Veld mag geen speciale tekens bevatten.'
    },
    register: 'Registreren',
    forgotPassword: 'Wachtwoord vergeten?',
    accountCreated:
      'Uw account is aangemaakt. U kunt nu inloggen met uw inloggegevens.',
    alreadyRegistered: 'Email adres is al geregistreerd.'
  },
  verification: {
    slider:
      'Please drag the slider all the way to the right until it turns green.'
  }
}

export default lang
