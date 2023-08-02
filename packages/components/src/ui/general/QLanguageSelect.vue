<template>
  <q-select
    v-bind="attrs"
    :options="languageOptions"
    :model-value="modelValue"
    emit-value
    map-options
  >
    <template #selected>
      <en-us v-if="modelValue === 'en-US'" />
      <nl v-if="modelValue === 'nl'" />
    </template>
    <template #option="scope">
      <q-item v-if="scope.opt.value === 'en-US'" v-bind="scope.itemProps">
        <q-item-section avatar>
          <en-us ref="enUsRef" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ enUsLanguage }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="scope.opt.value === 'nl'" v-bind="scope.itemProps">
        <q-item-section avatar>
          <nl ref="nlRef" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ nlLanguage }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, useAttrs, computed, toRefs, watch } from 'vue'
import { useQuasar, QSelect, QuasarLanguage } from 'quasar'
import { nl, enUs } from '../flags/index.js'

export interface Props {
  modelValue: string
  languageImports: Record<string, () => Promise<QuasarLanguage>>
}
const props = defineProps<Props>()
const $q = useQuasar()
const { modelValue } = toRefs(props)
const attrs = useAttrs()

// const langList = import.meta.glob('../../../node_modules/quasar/lang/*.mjs')

const nlRef = ref<typeof nl>()
// const nlCountry = computed(() => nlRef.value?.variables.country)
const nlLanguage = computed(() => nlRef.value?.variables.language)

const enUsRef = ref<typeof enUs>()
// const enUsCountry = computed(() => enUsRef.value?.variables.country)
const enUsLanguage = computed(() => enUsRef.value?.variables.language)

const languageOptions = [
  {
    label: enUsLanguage.value,
    value: 'en-US'
  },
  {
    label: nlLanguage.value,
    value: 'nl'
  }
]

watch(modelValue, (langIso: string) => {
  try {
    props.languageImports[langIso]().then(
      // langList[`../../../node_modules/quasar/lang/${langIso}.mjs`]().then(
      (lang) => {
        // @ts-ignore
        $q.lang.set(lang.default)
      }
    )
  } catch (e) {
    console.error(e)
  }
})
</script>
