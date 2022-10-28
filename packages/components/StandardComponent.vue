<template>
  <q-card ref="qCardRef"> </q-card>
</template>

<script lang="ts">
export default {
  name: 'StandardComponent'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { QCard, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

// export interface Props {}
// const props = defineProps<Props>();
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

const qCardRef = ref<QCard>()

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
