<template>
  <q-input
    v-bind="attrs"
    :rules="validations"
    :model-value="modelValue"
    :label="`${field ? lang.fields[field] : label ? label : ''}${
      required ? '*' : ''
    }`"
    @update:model-value="$emit('update:modelValue', $event)"
  ></q-input>
</template>

<script setup lang="ts">
import { ref, watch, useAttrs } from 'vue'
import { QInput, useQuasar, ValidationRule } from 'quasar'
import { useLang, loadLang } from './lang'

export type FormItems = 'name' | 'firstName' | 'surname' | 'address' | 'city'

export interface Props {
  modelValue?: string | null
  field?: FormItems
  label?: string
  required?: boolean
}
const props = defineProps<Props>()

const attrs = useAttrs()

const lang = useLang()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const validations = ref<ValidationRule[]>([])

if (props.required)
  validations.value.push(
    (val: string) => !!val || lang.value.validations.fieldRequired
  )
</script>
