<template>
  <q-input
    id="otp"
    name="otp"
    :model-value="modelValue"
    bottom-slots
    lazy-rules
    :label="lang.otp.verificationCode"
    :rules="validations['otp']"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { QInput } from 'quasar'
import { computed } from 'vue'
import { useLang } from './lang'

defineProps<{
  modelValue: string
}>()
defineEmits(['update:modelValue'])

const lang = useLang()
const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  otp: [(val) => !!val || lang.value.otp.validations.fieldRequired]
}))
</script>
