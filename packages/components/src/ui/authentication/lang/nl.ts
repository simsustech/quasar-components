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
      email: 'Uw (huidige) email adres'
    },
    validations: {
      fieldRequired: 'Veld is vereist.',
      invalidEmail: 'Het email adres is ongeldig.'
    },
    messages: {
      unknownEmail: 'Email adres is niet geregistreerd.'
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
    slider: 'Sleep a.u.b. het onderstaande bolletje helemaal naar rechts.'
  },
  account: {
    title: 'Accounts',
    fields: {
      name: 'Naam',
      email: 'Email',
      roles: 'Rollen'
    },
    labels: {
      addRole: 'Rol toevoegen',
      removeRole: 'Rol verwijderen'
    },
    messages: {
      addRole: ({ email }) =>
        `Selecteer de rol die u wilt toevoegen aan ${email}.`,
      removeRole: ({ email }) =>
        `Selecteer de rol die u wilt verwijderen van ${email}.`
    }
  },
  logout: {
    confirmation: 'Weet u zeker dat u wilt uitloggen?',
    logout: 'Log uit'
  }
}

export default lang
