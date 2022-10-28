<template>
  <q-form ref="formRef" class="q-gutter-md" v-bind="form">
    <otp-input v-bind="input" v-model="otp" />
    <q-input
      v-bind="input"
      id="newEmail"
      v-model="newEmail"
      name="newEmail"
      :label="lang.email.fields.newEmail"
      bottom-slots
      :rules="validations['newEmail']"
      lazy-rules
    />
    <q-input
      v-bind="input"
      id="repeatNewEmail"
      v-model="repeatNewEmail"
      name="repeatNewEmail"
      :label="lang.email.fields.repeatNewEmail"
      bottom-slots
      :rules="validations['repeatNewEmail']"
      lazy-rules
    />
    <slot name="default" :submit="submit" />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'EmailChangeForm'
}
</script>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { useQuasar, QFormProps, QForm, QInputProps } from 'quasar'
import { useLang, loadLang } from './lang'
import isEmail from 'validator/es/lib/isEmail.js'
import QSubmitButton from '../general/QSubmitButton.vue'
import OtpInput from './OtpInput.vue'

export interface Props {
  email: string
  form?: QFormProps & HTMLFormElement
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
}
const props = defineProps<Props>()
// const attrs = useAttrs();
const emit = defineEmits<{
  (
    e: 'submit',
    {
      email,
      newEmail,
      otp,
      done
    }: {
      email: string
      newEmail: string
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
const otp = ref('')
const newEmail = ref('')
const repeatNewEmail = ref('')
const header = computed(() => lang.value.email.changeEmail)

const formRef = ref<QForm>()
const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  newEmail: [
    (val) => !!val || lang.value.email.validations.fieldRequired,
    (val) => isEmail(val) || lang.value.email.validations.invalidEmail
  ],
  repeatNewEmail: [
    (val) => !!val || lang.value.email.validations.fieldRequired,
    (val) => isEmail(val) || lang.value.email.validations.emailsDoNotMatch
  ]
}))

const submit: InstanceType<typeof QSubmitButton>['$props']['onSubmit'] = (
  evt
) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      emit('submit', {
        email: email.value,
        newEmail: newEmail.value,
        otp: otp.value,
        done: evt.done
      })
    } else evt.done()
  })
}

const variables = ref({
  header
})
const functions = ref({
  submit
})
defineExpose({
  variables,
  functions
})
</script>
