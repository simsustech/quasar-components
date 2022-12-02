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
      :label="lang.login.fields.email"
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
      :label="lang.login.fields.username"
      bottom-slots
      :rules="validations['username']"
      lazy-rules
    />
    <q-input
      id="password"
      v-model="password"
      class="q-pt-none"
      v-bind="input"
      name="password"
      :type="showPassword ? 'text' : 'password'"
      :label="lang.login.fields.password"
      :rules="validations['password']"
      lazy-rules
      bottom-slots
    >
      <template #append>
        <q-icon
          :name="showPassword ? 'visibility' : 'visibility_off'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>
    <q-btn
      v-if="passwordForgotUrl"
      class="q-pt-none"
      :label="lang.login.forgotPassword"
      size="sm"
      flat
      :to="passwordForgotUrl"
    ></q-btn>
    <slot name="default" :submit="submit" />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'LoginForm'
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar, QFormProps, QForm, QInputProps } from 'quasar'
import { useLang, loadLang } from './lang'
import isEmail from 'validator/es/lib/isEmail'

import QSubmitButton from '../general/QSubmitButton.vue'

export interface Props {
  useUsername?: boolean
  passwordForgotUrl?: string
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
}
defineProps<Props>()
// const attrs = useAttrs();
const emit = defineEmits<{
  (
    e: 'submit',
    {
      email,
      password,
      username,
      done
    }: {
      email?: string
      password: string
      username?: string
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
const username = ref('')
const showPassword = ref(false)
const header = computed(() => lang.value.login.login)
const createAccount = computed(() => lang.value.login.createAccount)
const invalidCredentials = computed(() => lang.value.login.invalidCredentials)
const unprocessableRequest = computed(() => lang.value.unprocessableRequest)

const formRef = ref<QForm>()
const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  email: [
    (val) => !!val || lang.value.login.validations.fieldRequired,
    (val) => isEmail(val) || lang.value.login.validations.invalidEmail
  ],
  username: [(val) => !!val || lang.value.login.validations.fieldRequired],
  password: [(val) => !!val || lang.value.login.validations.fieldRequired]
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
        done: evt.done
      })
    } else evt.done()
  })
}

const variables = ref({
  header,
  createAccount,
  invalidCredentials,
  unprocessableRequest
})
const functions = ref({
  submit
})
defineExpose({
  variables,
  functions
})
</script>
