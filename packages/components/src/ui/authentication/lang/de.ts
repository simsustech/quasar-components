import type { Language } from '../lang'

const lang: Language = {
  isoName: 'de',
  myAccount: 'Konto',
  signOut: 'Abmelden',
  unprocessableRequest: 'Der Server konnte die Anfrage nicht verarbeiten.',
  consent: {
    message: (name: string) => `${name} fordert Zugriff auf Ihre Daten an.`,
    deny: 'Ablehnen',
    allow: 'Zulassen'
  },
  email: {
    fields: {
      email: 'E-Mail-Adresse',
      newEmail: 'Ihre neue E-Mail-Adresse',
      repeatNewEmail: 'Neue E-Mail-Adresse wiederholen'
    },
    validations: {
      fieldRequired: 'Feld ist ein Pflichtfeld.',
      invalidEmail: 'Eine gültige E-Mail-Adresse ist erforderlich.',
      emailsDoNotMatch: 'Die E-Mail-Adressen stimmen nicht überein.'
    },
    changeEmail: 'Ändern Sie Ihre E-Mail-Adresse.',
    emailChanged: 'Ihre E-Mail-Adresse wurde geändert.'
  },
  otp: {
    fields: {
      email: 'Ihre (aktuelle) E-Mail-Adresse'
    },
    validations: {
      fieldRequired: 'Feld ist ein Pflichtfeld.',
      invalidEmail: 'Eine gültige E-Mail-Adresse ist erforderlich.'
    },
    messages: {
      unknownEmail: 'Diese E-Mail-Adresse ist nicht registriert.'
    },
    request: 'Einmalpasswort anfordern',
    checkEmail:
      'Sie erhalten einen Bestätigungscode per E-Mail. Bitte verwenden Sie diesen Bestätigungscode im nächsten Schritt.',
    verificationCode: 'Bestätigungscode'
  },
  login: {
    fields: {
      email: 'E-Mail',
      password: 'Passwort',
      username: 'Benutzername'
    },
    validations: {
      fieldRequired: 'Feld ist ein Pflichtfeld.',
      invalidEmail: 'Eine gültige E-Mail-Adresse ist erforderlich.'
    },
    login: 'Einloggen',
    loginWith: 'Einloggen mit',
    createAccount: 'Konto erstellen',
    forgotPassword: 'Passwort vergessen?',
    invalidCredentials: 'E-Mail-Adresse oder Passwort ist falsch.'
  },
  password: {
    fields: {
      password: 'Passwort',
      repeatPassword: 'Passwort wiederholen'
    },
    validations: {
      fieldRequired: 'Feld ist ein Pflichtfeld',
      minimumPasswordLength: (minimumPasswordLength) =>
        `Das Passwort muss mindestens ${minimumPasswordLength} Zeichen lang sein.`,
      passwordsDoNotMatch: 'Die Passwörter stimmen nicht überein.'
    },
    changePassword: 'Ändern Sie Ihr Passwort.',
    passwordChanged: 'Ihr Passwort wurde geändert.'
  },
  register: {
    fields: {
      email: 'E-Mail',
      password: 'Passwort',
      username: 'Benutzername',
      repeatPassword: 'Passwort wiederholen'
    },
    validations: {
      fieldRequired: 'Feld ist ein Pflichtfeld',
      invalidEmail: 'Eine gültige E-Mail-Adresse ist erforderlich.',
      notAlphaNumeric: 'Feld darf keine Sonderzeichen enthalten.'
    },
    register: 'Registrieren',
    forgotPassword: 'Passwort vergessen?',
    accountCreated:
      'Ihr Konto wurde erfolgreich erstellt. Sie können sich jetzt mit Ihren Anmeldedaten einloggen.',
    alreadyRegistered: 'Diese E-Mail-Adresse ist bereits registriert.'
  },
  verification: {
    slider: 'Bitte ziehen Sie den Schieberegler unten ganz nach rechts.'
  },
  account: {
    title: 'Konten',
    fields: {
      name: 'Name',
      email: 'E-Mail',
      roles: 'Rollen'
    },
    labels: {
      addRole: 'Rolle hinzufügen',
      removeRole: 'Rolle entfernen'
    },
    messages: {
      addRole: ({ email }) =>
        `Wählen Sie die Rolle aus, die Sie zu ${email} hinzufügen möchten.`,
      removeRole: ({ email }) =>
        `Wählen Sie die Rolle aus, die Sie von ${email} entfernen möchten.`
    }
  },
  logout: {
    confirmation: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
    logout: 'Abmelden'
  }
}

export default lang
