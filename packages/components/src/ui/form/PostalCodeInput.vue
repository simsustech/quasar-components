<template>
  <q-input
    v-bind="attrs"
    :mask="computedMask"
    :rules="computedValidations"
    :model-value="modelValue"
    :label="`${lang.postalCode.postalCode}${required ? '*' : ''}`"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref, toRefs, useAttrs } from 'vue'
import { QInput } from 'quasar'
import { useLang } from './lang'

export type PostalCodeCountries = 'NL'

export interface Props {
  modelValue?: string
  country?: PostalCodeCountries
  required?: boolean
}
const props = defineProps<Props>()
const lang = useLang()
const attrs = useAttrs()

const { country } = toRefs(props)

const masks = ref({
  NL: '#### AA'
})
defineEmits(['update:modelValue'])

const validations = ref({
  NL: [
    (val: string) =>
      !val || // Do not check an empty string
      /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(val) ||
      lang.value.postalCode.validations.invalidPostalCode
  ]
})

const computedMask = computed(() => {
  if (country.value && masks.value[country.value])
    return masks.value[country.value]
  return undefined
})

const computedValidations = computed(() => {
  const val = []
  if (country.value && validations.value[country.value])
    val.push(...validations.value[country.value])
  if (props.required)
    val.push((val: string) => !!val || lang.value.validations.fieldRequired)
  return val
})
</script>
