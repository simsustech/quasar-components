<template>
  <q-select
    v-bind="attrs"
    :options="languageOptions"
    :model-value="modelValue"
    emit-value
    map-options
  >
    <template #selected>
      <div v-if="modelValue === 'en-US'">
        <en-us /> {{ flagsLang.languages['en-US'] }}
      </div>
      <div v-if="modelValue === 'nl'"><nl /> {{ flagsLang.languages.nl }}</div>
    </template>
    <template #option="scope">
      <q-item v-if="scope.opt.value === 'en-US'" v-bind="scope.itemProps">
        <q-item-section avatar>
          <en-us />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ flagsLang.languages['en-US'] }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="scope.opt.value === 'nl'" v-bind="scope.itemProps">
        <q-item-section avatar>
          <nl />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ flagsLang.languages.nl }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { useAttrs, toRefs } from 'vue'
import { QSelect } from 'quasar'
import { nl, enUs } from '../flags/index.js'
import { useLang as useFlagsLang } from '../flags/lang/index.js'
export interface Props {
  modelValue?: string | null
}
const props = defineProps<Props>()
const { modelValue } = toRefs(props)
const attrs = useAttrs()

const flagsLang = useFlagsLang()
const languageOptions = [
  {
    label: flagsLang.value.languages['en-US'],
    value: 'en-US'
  },
  {
    label: flagsLang.value.languages.nl,
    value: 'nl'
  }
]
</script>
