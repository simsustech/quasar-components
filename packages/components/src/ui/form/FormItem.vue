<template>
  <q-item v-bind="attrs">
    <q-item-section v-if="slots.avatar" avatar>
      <slot name="avatar" />
    </q-item-section>
    <q-item-section>
      <q-item-label overline>
        {{ label ? label : field ? lang.fields[field] : '' }}
      </q-item-label>
      <q-item-label>
        {{ modelValue || '-' }}
      </q-item-label>
    </q-item-section>
    <q-item-section v-if="slots.side" side>
      <slot name="side" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { watch, useAttrs, useSlots } from 'vue'
import { QItem, QItemLabel, QItemSection, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export type FormItems =
  | 'name'
  | 'firstName'
  | 'surname'
  | 'address'
  | 'city'
  | 'postalCode'

export interface Props {
  modelValue?: string
  label?: string
  field?: FormItems
}
defineProps<Props>()

const attrs = useAttrs()
const slots = useSlots()

const lang = useLang()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})
</script>
