<template>
  <q-select
    v-bind="attrs"
    :rules="validations"
    :model-value="modelValue"
    :options="genderOptions"
    :label="`${lang.gender.gender}${required ? '*' : ''}`"
    emit-value
    map-options
    @update:model-value="$emit('update:modelValue', $event)"
  ></q-select>
</template>

<script setup lang="ts">
import { watch, useAttrs, ref } from 'vue'
import { QSelect, useQuasar, ValidationRule } from 'quasar'
import { useLang, loadLang } from './lang'

export type Gender = 'male' | 'female' | 'other' | null
export interface Props {
  modelValue: Gender | null
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

const genderOptions = ref([
  {
    label: lang.value.gender.male,
    value: 'male'
  },
  {
    label: lang.value.gender.female,
    value: 'female'
  },
  {
    label: lang.value.gender.other,
    value: 'other'
  }
])

const validations = ref<ValidationRule[]>([])

if (props.required)
  validations.value.push(
    (val: { label: string; value: string }) =>
      !!val || lang.value.validations.fieldRequired
  )
defineEmits(['update:modelValue'])
</script>
