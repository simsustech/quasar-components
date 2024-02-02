<template>
  <q-item v-bind="attrs">
    <q-item-section>
      <q-item-label overline>
        {{ label }}
      </q-item-label>
      <q-item-label>
        {{ modelValue === null ? '-' : modelValue ? lang.yes : lang.no }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { watch, useAttrs } from 'vue'
import { QItem, QItemLabel, QItemSection, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  modelValue: boolean | null
  label: string
}
defineProps<Props>()

const attrs = useAttrs()

const lang = useLang()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})
</script>
