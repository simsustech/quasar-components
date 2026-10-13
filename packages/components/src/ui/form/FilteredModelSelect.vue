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
    @input-value="onInputValue"
    @update:model-value="onModelValue"
  >
    <template #hint> {{ hint }} </template>
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
    <template #no-option>
      <q-item>
        <q-item-section class="text-italic text-grey">
          {{ lang.noResultsAvailable }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script
  setup
  lang="ts"
  generic="T extends { id: number; [key: string]: unknown }"
>
import { QSelect } from 'quasar'
import { computed, ref, toRefs, useAttrs, watch } from 'vue'
import { useLang } from './lang/index.js'

const props = defineProps<{
  modelValue?: number | number[] | null
  labelKey: string
  labelFunction?: (option: unknown) => string
  valueKey?: string
  extraFields?: string[]
  filteredOptions: T[]
  required?: boolean
  onFilter?: unknown
  multiple?: boolean
  label?: string
  hint?: string
}>()
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

const {
  modelValue,
  onFilter,
  filteredOptions,
  labelKey,
  valueKey,
  labelFunction,
  extraFields
} = toRefs(props)

const options = computed(() => {
  if (filteredOptions.value.length) {
    return filteredOptions.value?.map((option) => ({
      label: labelFunction.value
        ? labelFunction.value(option)
        : option[labelKey.value],
      value: option[valueKey.value || 'id'],
      extraFields: extraFields.value?.reduce(
        (result, key) => {
          if (option.hasOwnProperty(key)) {
            result[key] = option[key]
          }
          return result
        },
        {} as Record<string, unknown>
      )
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

// The QSelect input's own text. Quasar fires `filter('')` whenever the
// options array identity changes while the menu is open and no option is
// selected (its `watch(innerValue)`); the input still holds whatever the
// user typed, so that synthetic event is not a clear. Forwarding it would
// discard the typed phrase and, because the parent refetches, loop forever.
const inputValue = ref('')

const onInputValue = (val: string | number | null) => {
  inputValue.value = val == null ? '' : String(val)
}

// A made selection means the input holds that option's label, which is not a
// search phrase. Forget it, so a later empty filter (the options-changed
// re-filter, or QSelect's prefetch of an unmapped value) asks for the full
// list again instead of searching for the label.
const onModelValue = (value: number) => {
  inputValue.value = ''
  emit('update:model-value', value)
}

const filterFn: QSelect['$props']['onFilter'] = (val, update) => {
  update(() => {})
  emit('filter', {
    ids: selectedIds.value,
    searchPhrase: (val === '' ? inputValue.value : val || '').toLowerCase(),
    done: () => {}
  })
}

const selectRef = ref<QSelect>()

watch(modelValue, () => {
  if (!options.value?.find((val) => val.value === modelValue.value))
    emit('filter', {
      ids: selectedIds.value,
      searchPhrase: '',
      done: () => {}
    })
})

// onMounted(() => {
//   if (!options.value?.find((val) => val.value === modelValue.value))
//     emit('filter', {
//       ids: selectedIds.value,
//       searchPhrase: '',
//       done: () => {}
//     })
// })
</script>
