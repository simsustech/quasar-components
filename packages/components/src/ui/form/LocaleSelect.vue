<template>
  <q-select
    v-bind="attrs"
    :options="localeOptions"
    :model-value="modelValue"
    emit-value
    map-options
    @update:model-value="(val: string) => emit('update:modelValue', val)"
  >
    <template #selected-item="scope">
      <q-item v-if="scope.opt && isItem">
        <q-item-section avatar>
          <q-icon :name="scope.opt.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ scope.opt.label }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <div v-else-if="scope.opt">
        <q-icon :name="scope.opt.icon" />
        {{ scope.opt.label }}
      </div>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <q-icon :name="scope.opt.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ scope.opt.label }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { useAttrs, computed, toRefs, ref } from 'vue'
import { QSelect } from 'quasar'
import { type Language, type Locales, useLang } from './lang/index.js'

export interface Props {
  modelValue: Locales
  locales: {
    icon: string
    bcp47: Locales
  }[]
  isItem?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const { modelValue, locales } = toRefs(props)

const lang = useLang()
const attrs = useAttrs()

const localeOptions = computed(() => {
  const options = locales.value.map((locale) => ({
    label: getLanguageLabel(locale.bcp47),
    value: locale.bcp47,
    icon: locale.icon
  }))

  return options
})

const getCountryLabel = (v: keyof Language['bcp47']) =>
  lang.value.bcp47[v]?.country

const getLanguageLabel = (v: keyof Language['bcp47']) =>
  lang.value.bcp47[v]?.language

const variables = ref({
  //

})
const functions = ref({
  getCountryLabel,
  getLanguageLabel
})

defineExpose({
  variables,
  functions
})
</script>
