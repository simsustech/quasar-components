<template>
  <!--
    No inline size or padding: the card fills whatever container it lands in —
    grid classes (col-12 col-md-4) decide the width, sections keep Quasar's own
    padding. The `style="max-width: 300px; padding: 2px"` this carried capped
    every card at 300px inside a 445px column at 1440, so grid cards hugged
    their content and the columns/gutters never filled (petboarding's pets,
    contact-people and account grids, measured 2026-10-06).
  -->
  <q-card ref="qCardRef">
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

<style scoped></style>
