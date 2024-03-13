<template>
  <q-input
    v-bind="attrs"
    :mask="masks[locale]"
    :rules="computedValidations"
    :model-value="modelValue"
    :label="`${lang.postalCode.postalCode}${required ? '*' : ''}`"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import { QInput } from 'quasar'
import { useLang } from './lang'

export type PostalCodeLocales = 'nl'

export interface Props {
  modelValue?: string
  locale: PostalCodeLocales
  required?: boolean
}
const props = defineProps<Props>()
const lang = useLang()
const attrs = useAttrs()
const masks = ref({
  nl: '#### AA'
})
defineEmits(['update:modelValue'])

const validations = ref({
  nl: [
    (val: string) =>
      !val || // Do not check an empty string
      /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(val) ||
      lang.value.postalCode.validations.invalidPostalCode
  ]
})

const computedValidations = computed(() => {
  const val = validations.value[props.locale]
  if (props.required)
    val.push((val: string) => !!val || lang.value.validations.fieldRequired)
  return val
})
</script>
