<template>
  {{ lang.logout.confirmation }}
  <q-form
    ref="formRef"
    data-allow-mismatch="props"
    class="q-gutter-md"
    v-bind="form"
    method="post"
    :action="action"
  >
    <input type="hidden" name="xsrf" :value="xsrfSecret" />
    <slot name="default" />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'LoginForm'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar, QFormProps, QForm } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  form?: QFormProps & Partial<HTMLFormElement> & Partial<HTMLDivElement>
  action: string
  xsrfSecret: string
}
defineProps<Props>()

const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const formRef = ref<QForm>()

const variables = ref({})
const functions = ref({})
defineExpose({
  variables,
  functions
})
</script>
