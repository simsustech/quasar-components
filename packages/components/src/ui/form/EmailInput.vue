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
import { QInput, QEditor } from 'quasar'

export default {
  name: 'EmailInput'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useLang } from './lang'

export interface Props {
  subject: string
  body: string
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:subject', value: string | number | null): void
  (e: 'update:body', value: string | null): void
}>()

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
