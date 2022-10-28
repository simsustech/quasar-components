<template>
  <q-btn
    v-bind="attrs"
    :label="isNextButton ? lang.next : lang.submit"
    color="primary"
    :loading="loading || loadingInternal"
    :type="useForm ? 'submit' : undefined"
    @click="submit"
  />
</template>

<script lang="ts">
export default {
  name: 'QSubmitButton',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { ref, watch, useAttrs } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'
export interface Props {
  loading?: boolean
  useForm?: boolean
  isNextButton?: boolean
}
const props = defineProps({
  loading: {
    type: Boolean,
    default: undefined
  },
  useForm: {
    type: Boolean
  },
  isNextButton: {
    type: Boolean
  }
})
const attrs = useAttrs()
const emit = defineEmits<{
  (
    e: 'submit',
    {
      value,
      done
    }: {
      value?: string
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

let loadingInternal = ref(false)

const submit = () => {
  if (props.loading === void 0) loadingInternal.value = true
  const p = new Promise((resolve, reject) => {
    emit('submit', { done: () => resolve(true) })
  }).finally(() => {
    if (props.loading === void 0) loadingInternal.value = false
  })
}
</script>
