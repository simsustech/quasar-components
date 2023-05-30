<template>
  <q-select
    v-bind="attrs"
    :rules="validations"
    :model-value="modelValue"
    :options="booleanOptions"
    :label="`${label}${required ? '*' : ''}`"
    emit-value
    map-options
    @update:model-value="$emit('update:modelValue', $event)"
  ></q-select>
</template>

<script setup lang="ts">
import { watch, useAttrs, ref } from 'vue'
import { QSelect, useQuasar, ValidationRule } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  modelValue: boolean
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

const booleanOptions = [
  {
    label: lang.value.yes,
    value: true
  },
  {
    label: lang.value.no,
    value: false
  }
]

const validations = ref<ValidationRule[]>([])

if (props.required)
  validations.value.push(
    (val: { label: string; value: string }) =>
      val !== void 0 || lang.value.validations.fieldRequired
  )
defineEmits(['update:modelValue'])
</script>
