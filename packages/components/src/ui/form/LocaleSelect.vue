<template>
  <q-select
    v-bind="attrs"
    :options="languageOptions"
    :model-value="modelValue"
    :filled="false"
    borderless
    emit-value
    map-options
  >
    <template #selected-item="scope">
      <div v-if="scope.opt">
        <q-item>
          <q-item-section avatar>
            <q-icon :name="scope.opt.icon" />
          </q-item-section>
          <q-item-section label>
            {{ scope.opt.label }}
          </q-item-section>
        </q-item>
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
import { useAttrs, computed, toRefs } from 'vue'
import { QSelect } from 'quasar'
import { Language, useLang } from './lang/index.js'

export interface Props {
  modelValue: keyof Language['countries']
  locales: {
    icon: string
    isoName: keyof Language['languages']
  }[]
}
const props = defineProps<Props>()
const { modelValue, locales } = toRefs(props)

const lang = useLang()
const attrs = useAttrs()

const languageOptions = computed(() => {
  const options = locales.value.map((locale) => ({
    label: lang.value.languages[locale.isoName],
    value: locale.isoName,
    icon: locale.icon
  }))

  return options
})
</script>
