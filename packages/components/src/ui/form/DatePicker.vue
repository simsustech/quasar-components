<template>
  <q-date
    v-bind="attrs"
    :model-value="modelValue"
    @update:model-value="update"
    :options="dateOptions"
    :range="range"
  ></q-date>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { toRefs, useAttrs } from 'vue'
import { useLang } from './lang/index.js'

export interface Period {
  startDate: string
  endDate: string
  type: 'unavailable'
}

const props = defineProps<{
  modelValue: string | null | undefined | { from: string; to: string }
  periods?: Period[]
  range?: boolean
  options?: (date: string) => boolean
}>()
const attrs = useAttrs()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string | { from: string; to: string }): void
}>()

const $q = useQuasar()
const lang = useLang()

const { periods, range, options: parentOptions } = toRefs(props)

const update = (val: { from: string; to: string } | string) => {
  if (val && typeof val !== 'string') {
    const parsedFrom = val.from.replaceAll('/', '-')
    const parsedTo = val.to.replaceAll('/', '-')
    const unavailablePeriods = periods?.value?.filter(
      (period) => period.type === 'unavailable'
    )
    if (unavailablePeriods) {
      for (const period of unavailablePeriods) {
        if (parsedFrom <= period.startDate && parsedTo >= period.endDate) {
          return $q.notify({
            message: lang.value.datePicker.validations.unavailableRange,
            color: 'red'
          })
        }
      }
    }
  }
  emit('update:modelValue', val)
}

const dateOptions = function (date: string) {
  let parentResult: boolean = true
  if (parentOptions?.value) parentResult = parentOptions.value(date)
  const parsedDate = date.replaceAll('/', '-')
  const unavailablePeriods = periods?.value?.filter(
    (period) => period.type === 'unavailable'
  )
  if (unavailablePeriods) {
    for (const period of unavailablePeriods) {
      if (parsedDate >= period.startDate && parsedDate <= period.endDate) {
        return false
      }
    }
  }
  return parentResult
}
</script>
