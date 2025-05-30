<template>
  <q-form
    ref="formRef"
    class="q-gutter-md"
    v-bind="form"
    @submit="(e) => submit"
  >
    <otp-input v-bind="input" v-model="otp" />
    <q-input
      v-bind="input"
      id="newPassword"
      v-model="newPassword"
      name="newPassword"
      :type="showPassword ? 'text' : 'password'"
      :label="lang.password.fields.password"
      bottom-slots
      :rules="validations['newPassword']"
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
    <q-input
      v-bind="input"
      id="repeatNewPassword"
      v-model="repeatNewPassword"
      name="repeatNewPassword"
      :type="showRepeatPassword ? 'text' : 'password'"
      :label="lang.password.fields.repeatPassword"
      bottom-slots
      :rules="validations['repeatNewPassword']"
      lazy-rules
    >
      <template #append>
        <q-icon
          :name="showRepeatPassword ? icons.visibility : icons.visibilityOff"
          class="cursor-pointer"
          @click="showRepeatPassword = !showRepeatPassword"
        />
      </template>
    </q-input>
    <slot name="default" :submit="submit" />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'PasswordChangeForm'
}
</script>

<script setup lang="ts">
import { ref, computed, watch, toRef, withDefaults } from 'vue'
import { useQuasar, QFormProps, QForm, QInputProps } from 'quasar'
import { useLang, loadLang } from './lang'
import equals from 'validator/es/lib/equals.js'

import QSubmitButton from '../general/QSubmitButton.vue'
import OtpInput from './OtpInput.vue'

export interface Props {
  email: string
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
      newPassword,
      otp,
      done
    }: {
      email: string
      newPassword: string
      otp: string
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

const email = toRef(props, 'email')
const minimumPasswordLength = toRef(props, 'minimumPasswordLength')
const otp = ref('')
const newPassword = ref('')
const repeatNewPassword = ref('')
const showPassword = ref(false)
const showRepeatPassword = ref(false)

const formRef = ref<QForm>()
const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
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
      equals(val, newPassword.value) ||
      lang.value.password.validations.passwordsDoNotMatch
  ]
}))

const submit: InstanceType<typeof QSubmitButton>['$props']['onSubmit'] = (
  evt
) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      emit('submit', {
        email: email.value,
        newPassword: newPassword.value,
        otp: otp.value,
        done: evt.done
      })
    } else evt.done()
  })
}

const variables = ref({})
const functions = ref({
  submit
})
defineExpose({
  variables,
  functions
})
</script>
