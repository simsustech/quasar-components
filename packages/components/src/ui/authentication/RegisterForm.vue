<template>
  <q-form
    ref="formRef"
    class="q-gutter-md"
    v-bind="form"
    @submit="(e) => submit"
  >
    <q-input
      v-if="!useUsername"
      v-bind="input"
      id="email"
      v-model="email"
      name="email"
      :label="lang.register.fields.email"
      bottom-slots
      :rules="validations['email']"
      lazy-rules
    />
    <q-input
      v-if="useUsername"
      v-bind="input"
      id="username"
      v-model="username"
      name="username"
      :label="lang.register.fields.username"
      bottom-slots
      :rules="validations['username']"
      lazy-rules
    />
    <q-input
      v-for="field in extraFields"
      :key="field.name"
      v-model="extraFieldValues[field.name]"
      type="text"
      :name="field.name"
      :label="field.label"
      :rules="field.rules"
      bottom-slots
    />
    <q-input
      v-bind="input"
      id="password"
      v-model="password"
      name="password"
      :type="showPassword ? 'text' : 'password'"
      :label="lang.register.fields.password"
      :rules="validations['password']"
      lazy-rules
      bottom-slots
    >
      <template #append>
        <q-icon
          :name="showPassword ? icons.visibility : icons.visibilityOff"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>
    <q-input
      id="repeatPassword"
      v-model="repeatPassword"
      :type="showPassword ? 'text' : 'password'"
      :label="lang.register.fields.repeatPassword"
      bottom-slots
      required
      :rules="validations['repeatPassword']"
      lazy-rules
    >
      <template #append>
        <q-icon
          :name="showPassword ? icons.visibility : icons.visibilityOff"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>
    <slot name="default" :submit="submit" />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'RegisterForm'
}
</script>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { useQuasar, QFormProps, QForm, QInputProps } from 'quasar'
import { useLang, loadLang } from './lang'
import isEmail from 'validator/es/lib/isEmail.js'
import equals from 'validator/es/lib/equals.js'
import isAlphanumeric from 'validator/es/lib/isAlphanumeric.js'

import QSubmitButton from '../general/QSubmitButton.vue'

export interface Props {
  useUsername?: boolean
  extraFields?: {
    name: string
    label: string
    rules?: ((val: string) => boolean)[]
  }[]
  minimumPasswordLength?: number
  form?: QFormProps & Partial<HTMLFormElement> & Partial<HTMLDivElement>
  input?: Omit<
    QInputProps,
    | 'id'
    | 'name'
    | 'modelValue'
    | 'label'
    | 'rules'
    | 'type'
    | 'lazy-rules'
    | 'autofocus'
    | ('label' & { style?: Partial<CSSStyleDeclaration> })
  >
  icons?: {
    visibility: string
    visibilityOff: string
  }
}
const props = withDefaults(defineProps<Props>(), {
  minimumPasswordLength: 8,
  extraFields: undefined,
  form: undefined,
  input: undefined,
  icons: () => ({
    visibility: 'visibility',
    visibilityOff: 'visibility_off'
  })
})
// const attrs = useAttrs();
const emit = defineEmits<{
  (
    e: 'submit',
    {
      email,
      password,
      username,
      extraFields,
      done
    }: {
      email?: string
      password: string
      username?: string
      extraFields?: Record<string, string>
      done: () => void
    }
  ): void
}>()
const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const email = ref('')
const password = ref('')
const repeatPassword = ref('')
const extraFieldValues = ref<Record<string, string>>({})
const username = ref('')
const showPassword = ref(false)
const header = computed(() => lang.value.register.register)
const forgotPassword = computed(() => lang.value.register.forgotPassword)
const accountCreated = computed(() => lang.value.register.accountCreated)
const unprocessableRequest = computed(() => lang.value.unprocessableRequest)
const alreadyRegistered = computed(() => lang.value.register.alreadyRegistered)

const minimumPasswordLength = toRef(props, 'minimumPasswordLength')
const formRef = ref<QForm>()
const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  email: [
    (val) => !!val || lang.value.register.validations.fieldRequired,
    (val) => isEmail(val) || lang.value.register.validations.invalidEmail
  ],
  username: [
    (val) => !!val || lang.value.register.validations.fieldRequired,
    (val) =>
      isAlphanumeric(val) || lang.value.register.validations.notAlphaNumeric
  ],
  password: [
    (val) => !!val || lang.value.password.validations.fieldRequired,
    (val) =>
      val.length >= minimumPasswordLength.value ||
      lang.value.password.validations.minimumPasswordLength(
        minimumPasswordLength.value
      )
  ],
  repeatPassword: [
    (val) => !!val || lang.value.password.validations.fieldRequired,
    (val) =>
      equals(val, password.value) ||
      lang.value.password.validations.passwordsDoNotMatch
  ]
}))

const submit: InstanceType<typeof QSubmitButton>['$props']['onSubmit'] = (
  evt
) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      emit('submit', {
        email: email.value.trim(),
        password: password.value,
        username: username.value.trim(),
        extraFields: extraFieldValues.value,
        done: evt.done
      })
    } else evt.done()
  })
}

const variables = ref({
  header,
  forgotPassword,
  accountCreated,
  unprocessableRequest,
  alreadyRegistered
})
const functions = ref({
  submit
})
defineExpose({
  variables,
  functions
})
</script>
