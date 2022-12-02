<template>
  <q-stepper v-model="step">
    <q-step name="requestOtp" :title="requestOtpHeader">
      <request-otp-form
        ref="requestOtpFormRef"
        :form="{ id: 'requestOtpForm' }"
        :input="input"
        @submit="requestOtp"
      ></request-otp-form>
    </q-step>

    <q-step name="changeEmail" :title="emailChangeHeader">
      <email-change-form
        ref="emailChangeFormRef"
        :form="{ id: 'emailChangeForm' }"
        :email="email"
        :input="input"
        @submit="changeEmail"
      >
      </email-change-form>
    </q-step>
    <template #navigation>
      <q-stepper-navigation class="text-right">
        <q-submit-button
          v-if="step === 'requestOtp'"
          is-next-button
          form="requestOtpForm"
          @submit="requestOtpFormRef?.functions.submit"
        ></q-submit-button>
        <q-submit-button
          v-if="step === 'changeEmail'"
          form="emailChangeForm"
          @submit="emailChangeFormRef?.functions.submit"
        ></q-submit-button>
      </q-stepper-navigation>
    </template>
  </q-stepper>
</template>

<script lang="ts">
export default {
  name: 'EmailChangeStepper'
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar, QInputProps } from 'quasar'
import { useLang, loadLang } from './lang'
import QSubmitButton from '../general/QSubmitButton.vue'
import RequestOtpForm from './RequestOtpForm.vue'
import EmailChangeForm from './EmailChangeForm.vue'
export interface Props {
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
    e: 'requestOtp',
    {
      email,
      done
    }: {
      email: string
      done: () => void
    }
  ): void
  (
    e: 'changeEmail',
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

const steps = ['requestOtp', 'changeEmail'] as const
const step = ref<typeof steps[number]>('requestOtp')
const email = ref('')
const header = computed(() => lang.value.email.changeEmail)
const emailChanged = computed(() => lang.value.email.emailChanged)
const unprocessableRequest = computed(() => lang.value.unprocessableRequest)
const checkEmail = computed(() => lang.value.otp.checkEmail)

const requestOtpFormRef = ref<typeof RequestOtpForm>()
const emailChangeFormRef = ref<typeof EmailChangeForm>()

const requestOtpHeader = computed(
  () => requestOtpFormRef.value?.variables.header || ''
)
const emailChangeHeader = computed(
  () => emailChangeFormRef.value?.variables.header || ''
)
const requestOtp: InstanceType<typeof RequestOtpForm>['$props']['onSubmit'] = ({
  email: emittedEmail,
  done
}) => {
  emit('requestOtp', {
    email: emittedEmail,
    done: () => {
      email.value = emittedEmail
      done()
    }
  })
}

const changeEmail: InstanceType<
  typeof EmailChangeForm
>['$props']['onSubmit'] = ({ email, newEmail, otp, done }) => {
  emit('changeEmail', {
    email,
    newEmail,
    otp,
    done
  })
}

const variables = ref({
  header,
  emailChanged,
  unprocessableRequest,
  checkEmail,
  steps
})
const functions = ref({
  goToStep: (newStep: typeof steps[number]) => (step.value = newStep)
})
defineExpose({
  variables,
  functions
})
</script>
