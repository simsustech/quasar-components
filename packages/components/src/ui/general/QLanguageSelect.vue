<template>
  <locale-select
    :model-value="modelValue"
    :locales="locales"
    @update:model-value="(val) => updateModelValue(val)"
  />
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { useQuasar, QuasarLanguage } from 'quasar'
import LocaleSelect from '../form/LocaleSelect.vue'
import type { ISO639, Locales } from '../form/lang/index.js'

export interface Props {
  modelValue: Locales
  languageImports: Record<
    ISO639 | Locales,
    () => Promise<{ default: QuasarLanguage }>
  >
  locales: {
    icon: string
    bcp47: Locales
  }[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { modelValue, languageImports, locales } = toRefs(props)

const $q = useQuasar()

const updateModelValue: InstanceType<
  typeof LocaleSelect
>['$props']['onUpdate:modelValue'] = (v: Locales) => {
  const iso639 = v.split('-').at(0) as ISO639
  for (const i of [iso639, v]) {
    try {
      languageImports.value[i]().then((lang) => {
        $q.lang.set(lang.default)
      })
    } catch {
      //
    }
  }
  emit('update:modelValue', v)
}
</script>
