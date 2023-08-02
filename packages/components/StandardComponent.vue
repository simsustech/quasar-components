<template>
  <!-- -->
</template>

<script lang="ts">
export default {
  name: 'StandardComponent'
}
</script>

<script setup lang="ts">
import { ref, useAttrs, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {}
const props = defineProps<Props>()
const attrs = useAttrs()
const emit = defineEmits<{
  (
    e: 'asyncEmit',
    {
      data,
      done
    }: {
      data: string
      done: () => void
    }
  ): void
}>()

const $q = useQuasar()
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
