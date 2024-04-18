<template>
  <q-select
    v-bind="attrs"
    :rules="validations"
    :model-value="modelValue"
    :options="currencyOptions"
    :label="`${lang.currency.currency}${required ? '*' : ''}`"
    emit-value
    map-options
    @update:model-value="$emit('update:modelValue', $event)"
  ></q-select>
</template>

<script setup lang="ts">
import { useAttrs, ref } from 'vue'
import { QSelect, ValidationRule } from 'quasar'
import { useLang } from './lang'

export type Currency = 'EUR' | 'USD'
export interface Props {
  modelValue: Currency | null
  required?: boolean
}
const props = defineProps<Props>()

const attrs = useAttrs()

const lang = useLang()

const currencyOptions = ref([
  {
    label: lang.value.currency.EUR,
    value: 'EUR'
  },
  {
    label: lang.value.currency.USD,
    value: 'USD'
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
