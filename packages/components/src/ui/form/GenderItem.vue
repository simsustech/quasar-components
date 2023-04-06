<template>
  <q-item v-bind="attrs">
    <q-item-section>
      <q-item-label overline>
        {{ lang.gender.gender }}
      </q-item-label>
      <q-item-label>
        {{ modelValue ? lang.gender[modelValue] : '' }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { watch, useAttrs } from 'vue'
import { QItem, QItemLabel, QItemSection, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

import type { Gender } from './GenderSelect.vue'

export interface Props {
  modelValue: Gender
}
defineProps<Props>()

const attrs = useAttrs()

const lang = useLang()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})
</script>
