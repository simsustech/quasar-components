<template>
  <q-select
    ref="selectRef"
    v-bind="attrs"
    :model-value="modelValue"
    :options="options"
    :label="`${label}${required ? '*' : ''}`"
    :hint="multiple ? lang.selectMultiple : undefined"
    emit-value
    map-options
    :fill-input="!multiple"
    :use-input="!!onFilter"
    :hide-selected="(!multiple && !!onFilter) || Number.isNaN(modelValue)"
    :multiple="multiple"
    :bottom-slots="!!hint"
    input-debounce="500"
    :rules="required ? [requiredValidation] : []"
    @filter="filterFn"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #hint> {{ hint }} </template>
    <template
      v-for="(slot, index) of Object.keys($slots)"
      :key="index"
      #[slot]="scope"
    >
      <slot :scope="scope" :name="slot"></slot>
    </template>
  </q-select>
</template>

<script lang="ts">
export default {
  name: 'FilteredModelSelect'
}
</script>

<script
  setup
  lang="ts"
  generic="T extends { id: number; [key: string]: unknown }"
>
import { QSelect } from 'quasar'
import { computed, ref, toRefs, useAttrs, watch } from 'vue'
import { useLang } from './lang/index.js'

interface Props {
  modelValue?: number | number[] | null
  labelKey: string
  valueKey?: string
  filteredOptions: T[]
  required?: boolean
  onFilter?: unknown
  multiple?: boolean
  label?: string
  hint?: string
}
const props = defineProps<Props>()
const attrs = useAttrs()

const emit = defineEmits<{
  (e: 'update:model-value', id: number): void
  (
    e: 'filter',
    {
      ids,
      searchPhrase,
      done
    }: {
      ids: number[]
      searchPhrase: string
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()

const { modelValue, onFilter, filteredOptions, labelKey, valueKey } =
  toRefs(props)
const options = computed(() => {
  if (filteredOptions.value.length) {
    return filteredOptions.value?.map((option) => ({
      label: option[labelKey.value],
      value: option[valueKey.value || 'id']
    }))
  }
  return []
})

const requiredValidation = ref(
  (val: unknown) =>
    (Array.isArray(val) ? !!val.length : !!val) ||
    lang.value.validations.fieldRequired
)

const selectedIds = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return [...modelValue.value]
  } else if (modelValue.value) {
    return [modelValue.value]
  }
  return []
})

const filterFn: QSelect['$props']['onFilter'] = (val, update, abort) => {
  if (!onFilter.value) update(() => {})
  emit('filter', {
    ids: selectedIds.value,
    searchPhrase: val.toLowerCase(),
    done: () => update(() => {})
  })
}

const selectRef = ref<QSelect>()

watch(modelValue, () => {
  if (!options.value.length)
    emit('filter', {
      ids: selectedIds.value,
      searchPhrase: '',
      done: () => {}
    })
})
</script>
