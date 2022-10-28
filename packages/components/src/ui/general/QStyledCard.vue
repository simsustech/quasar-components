<template>
  <q-card ref="qCardRef" class="card">
    <slot name="image" />

    <q-card-section>
      <div class="text-h6">
        <slot name="title" />
      </div>
      <div class="text-subtitle2">
        <slot name="subtitle" />
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <slot name="default" />
    </q-card-section>

    <q-card-actions v-bind="actions">
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
export default {
  name: 'QStyledCard'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { QCard, useQuasar, QCardActionsProps } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  actions?: QCardActionsProps
}
defineProps<Props>()
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

<style lang="sass" scoped>
.card
  width: 100%
  max-width: 400px
</style>
