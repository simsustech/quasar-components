<template>
  <q-btn>
    <slot name="icon" />
    <div v-if="withNetwork">{{ lang.login.loginWith }} {{ withNetwork }}</div>
    <div v-else>
      {{ lang.login.login }}
    </div>
  </q-btn>
</template>

<script lang="ts">
export default {
  name: 'LoginButton'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { QCard, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  withNetwork?: string
}
const props = defineProps<Props>()
// const attrs = useAttrs();
// const emit = defineEmits<{
//   (
//     e: "asyncEmit",
//     {
//       value,
//       done,
//     }: {
//       value: string;
//       done: () => void;
//     }
//   ): void;
// }>();
const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
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
