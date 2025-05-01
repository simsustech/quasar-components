<template>
  <locale-select
    :model-value="modelValue"
    :locales="locales"
    @update:model-value="(val) => $emit('update:model-value', val)"
  />
</template>

<script setup lang="ts">
import { watch, toRefs } from 'vue'
import { useQuasar, QuasarLanguage } from 'quasar'
import LocaleSelect from '../form/LocaleSelect.vue'
import type { Language as FormLanguage } from '../form/lang/index.js'

export interface Props {
  modelValue: keyof FormLanguage['countries']
  languageImports: Record<
    keyof FormLanguage['countries'],
    () => Promise<{ default: QuasarLanguage }>
  >
  locales: {
    icon: string
    isoName: keyof FormLanguage['languages']
  }[]
}
const props = defineProps<Props>()
const { modelValue, languageImports, locales } = toRefs(props)

const $q = useQuasar()

watch(modelValue, (langIso) => {
  try {
    languageImports.value[langIso]().then(
      // langList[`../../../node_modules/quasar/lang/${langIso}.mjs`]().then(
      (lang) => {
        $q.lang.set(lang.default)
      }
    )
  } catch (e) {
    console.error(e)
  }
})
</script>
