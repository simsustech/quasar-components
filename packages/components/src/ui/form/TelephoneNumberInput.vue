<template>
  <q-input
    v-bind="attrs"
    :rules="validations"
    :model-value="modelValue"
    :label="`${lang.fields.telephoneNumber}${required ? '*' : ''}`"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
/**
 * To do: add mask and country prefix
 */
import { ref, useAttrs } from 'vue'
import { QInput } from 'quasar'
import { useLang } from './lang'

export interface Props {
  modelValue: string
  required?: boolean
}
const props = defineProps<Props>()
const lang = useLang()
const attrs = useAttrs()

defineEmits(['update:modelValue'])

const validations = ref<((val: string) => boolean | string)[]>([])

if (props.required)
  validations.value.push(
    (val: string) => !!val || lang.value.validations.fieldRequired
  )
</script>
