<template>
  {{ lang.verification.slider }}
  <q-slider v-model="sliderValue" :color="sliderColor" :readonly="completed" />
</template>

<script lang="ts">
export default {
  name: 'VerificationSlider'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  useVerificationSlider?: boolean
}
const props = defineProps<Props>()
// const attrs = useAttrs();
const emit = defineEmits<{
  (e: 'verified'): void
}>()
const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const sliderValue = ref(0)
const sliderColor = ref('red')
const completed = ref(false)

watch(sliderValue, (newVal, oldVal) => {
  if (newVal > 80) {
    sliderColor.value = 'green'
    setTimeout(() => {
      sliderValue.value = 100
      completed.value = true
    }, 500)
    emit('verified')
  }
})

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
