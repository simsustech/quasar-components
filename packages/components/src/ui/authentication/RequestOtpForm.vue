<template>
  <q-form ref="formRef" v-bind="form">
    <q-input
      v-bind="input"
      id="email"
      v-model.trim="email"
      name="email"
      type="text"
      :label="lang.otp.fields.email"
      :rules="validations['email']"
      lazy-rules
      autofocus
    />
    <slot name="default" :submit="submit" />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'RequestOtpForm'
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar, QFormProps, QForm, QInputProps } from 'quasar'
import { useLang, loadLang } from './lang'
import isEmail from 'validator/es/lib/isEmail.js'
import QSubmitButton from '../general/QSubmitButton.vue'

export interface Props {
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
defineProps<Props>()
// const attrs = useAttrs();
const emit = defineEmits<{
  (
    e: 'submit',
    {
      email,
      done
    }: {
      email: string
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
const header = computed(() => lang.value.otp.request)

const formRef = ref<QForm>()
const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  email: [
    (val) => !!val || lang.value.otp.validations.fieldRequired,
    (val) => isEmail(val) || lang.value.otp.validations.invalidEmail
  ]
}))

const submit: InstanceType<typeof QSubmitButton>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      emit('submit', {
        email: email.value,
        done: done
      })
    } else done()
  })
}

const variables = ref({ header })
const functions = ref({ submit })
defineExpose({
  variables,
  functions
})
</script>
