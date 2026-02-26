<template>
  <q-select
    v-bind="attrs"
    :options="countryOptions"
    :model-value="modelValue"
    :filled="false"
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
import { ISO3166, useLang } from './lang/index.js'

export interface Props {
  modelValue: ISO3166
  countries: {
    icon: string
    iso3166: ISO3166
  }[]
  isItem?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const { modelValue, countries } = toRefs(props)

const lang = useLang()
const attrs = useAttrs()

const countryOptions = computed(() => {
  const options = countries.value.map((country) => ({
    label: lang.value.countries[country.iso3166],
    value: country.iso3166,
    icon: country.icon
  }))

  return options
})

const variables = ref({
  //
})
const functions = ref({
  //
})

defineExpose({
  variables,
  functions
})
</script>
