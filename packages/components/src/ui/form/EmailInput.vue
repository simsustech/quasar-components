<template>
  <q-input
    outlined
    :placeholder="lang.email.subject"
    :model-value="subject"
    type="text"
    @update:model-value="($event) => emit('update:subject', $event)"
  />
  <q-editor
    :model-value="body"
    @update:model-value="($event) => emit('update:body', $event)"
  />
</template>

<script lang="ts">
export default {
  name: 'EmailInput'
}
</script>

<script setup lang="ts">
import { ref, useAttrs, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  subject: string
  body: string
}
const props = defineProps<Props>()
const attrs = useAttrs()
const emit = defineEmits<{
  (e: 'update:subject', value: string | number | null): void
  (e: 'update:body', value: string | null): void
}>()

const $q = useQuasar()
const lang = useLang()

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})
</script>
