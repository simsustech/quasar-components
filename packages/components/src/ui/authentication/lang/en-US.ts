import type { Language } from '../lang'

const lang: Language = {
  isoName: 'en-US',
  myAccount: 'Account',
  signOut: 'Sign out',
  unprocessableRequest: 'The server was unable to process the request.',
  consent: {
    message: (name: string) => `${name} is requesting access to your data.`,
    deny: 'Deny',
    allow: 'Allow'
  },
  email: {
    fields: {
      email: 'Email address',
      newEmail: 'Your new email address',
      repeatNewEmail: 'Repeat your new email address'
    },
    validations: {
      fieldRequired: 'Field is required.',
      invalidEmail: 'A valid email address is required.',
      emailsDoNotMatch: 'The email addresses do not match.'
    },
    changeEmail: 'Change your email address.',
    emailChanged: 'Your email address has been changed.'
  },
  otp: {
    fields: {
      email: 'Your (current) email address'
    },
    validations: {
      fieldRequired: 'Field is required.',
      invalidEmail: 'A valid email address is required.'
    },
    messages: {
      unknownEmail: 'Email address is not registered.'
    },
    request: 'Request a one-time password',
    checkEmail:
      'You will receive a verification code in your email. Please use this verification code in the next step.',
    verificationCode: 'Verification code'
  },
  login: {
    fields: {
      email: 'Email',
      password: 'Password',
      username: 'Username'
    },
    validations: {
      fieldRequired: 'Field is required.',
      invalidEmail: 'A valid email address is required.'
    },
    login: 'Login',
    loginWith: 'Login with',
    createAccount: 'Create account',
    forgotPassword: 'Forgot your password?',
    invalidCredentials: 'Email address or password is incorrect.'
  },
  password: {
    fields: {
      password: 'Password',
      repeatPassword: 'Repeat password'
    },
    validations: {
      fieldRequired: 'Field is required',
      minimumPasswordLength: (minimumPasswordLength) =>
        `The minimum length of the password is ${minimumPasswordLength} characters.`,
      passwordsDoNotMatch: 'The password do not match.'
    },
    changePassword: 'Change your password.',
    passwordChanged: 'Your password has been changed.'
  },
  register: {
    fields: {
      email: 'Email',
      password: 'Password',
      username: 'Username',
      repeatPassword: 'Repeat password'
    },
    validations: {
      fieldRequired: 'Field is required',
      invalidEmail: 'A valid email address is required.',
      notAlphaNumeric: 'Veld mag geen speciale tekens bevatten.'
    },
    register: 'Register',
    forgotPassword: 'Forgot your password?',
    accountCreated:
      'Your account has been sucessfully created. You can now login with your credentials.',
    alreadyRegistered: 'Email address is already registered.'
  },
  verification: {
    slider: 'Please drag the slider below all the way to the right.'
  },
  account: {
    title: 'Accounts',
    fields: {
      name: 'Name',
      email: 'Email',
      roles: 'Roles'
    },
    labels: {
      addRole: 'Add role',
      removeRole: 'Remove role'
    },
    messages: {
      addRole: ({ email }) =>
        `Select the role which you want to add to ${email}.`,
      removeRole: ({ email }) =>
        `Select the role which you want to remove from ${email}.`
    }
  }
}

export default lang
