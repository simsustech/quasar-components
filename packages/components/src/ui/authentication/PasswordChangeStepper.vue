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

    <q-step name="changePassword" :title="passwordChangeHeader">
      <password-change-form
        ref="passwordChangeFormRef"
        :form="{ id: 'passwordChangeForm' }"
        :email="email"
        :input="input"
        @submit="changePassword"
      >
      </password-change-form>
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
          v-if="step === 'changePassword'"
          form="passwordChangeForm"
          @submit="passwordChangeFormRef?.functions.submit"
        ></q-submit-button>
      </q-stepper-navigation>
    </template>
  </q-stepper>
</template>

<script lang="ts">
import { useLang, loadLang } from './lang'

export default {
  name: 'PasswordChangeStepper',
  useLang: useLang
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar, QInputProps } from 'quasar'
import QSubmitButton from '../general/QSubmitButton.vue'
import RequestOtpForm from './RequestOtpForm.vue'
import PasswordChangeForm from './PasswordChangeForm.vue'
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
    e: 'changePassword',
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

const steps = ['requestOtp', 'changePassword'] as const
const step = ref<(typeof steps)[number]>('requestOtp')
const email = ref('')

const requestOtpFormRef = ref<typeof RequestOtpForm>()
const passwordChangeFormRef = ref<typeof PasswordChangeForm>()

const requestOtpHeader = computed(() => lang.value.otp.request)

const passwordChangeHeader = computed(() => lang.value.password.changePassword)

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

const changePassword: InstanceType<
  typeof PasswordChangeForm
>['$props']['onSubmit'] = ({ email, newPassword, otp, done }) => {
  emit('changePassword', {
    email,
    newPassword,
    otp,
    done
  })
}

const variables = ref({
  steps
})
const functions = ref({
  goToStep: (newStep: (typeof steps)[number]) => (step.value = newStep)
})
defineExpose({
  variables,
  functions
})
</script>
