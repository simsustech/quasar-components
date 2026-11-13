<template>
  <q-select
    class="q-location-search"
    :model-value="modelValue"
    :options="results"
    :option-label="optionLabel"
    :label="resolvedLabel"
    :placeholder="placeholder"
    :aria-label="resolvedLabel"
    :loading="loading"
    :dense="dense"
    :outlined="outlined"
    :readonly="readonly"
    :new-value-mode="newValueMode"
    :rules="rules"
    :lazy-rules="lazyRules"
    reactive-rules
    use-input
    input-debounce="0"
    fill-input
    hide-selected
    clearable
    @filter="onFilter"
    @update:model-value="onModelValue"
  >
    <template #option="{ itemProps, opt, selected }">
      <q-item v-bind="itemProps" :active="selected">
        <q-item-section>
          <q-item-label>{{ optionLabel(opt) }}</q-item-label>
          <q-item-label caption>{{ optionCaption(opt) }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #no-option="{ inputValue }">
      <q-item v-if="error">
        <q-item-section>{{ lang.location.geocodeFailed }}</q-item-section>
      </q-item>
      <q-item v-else-if="showsNoResults(inputValue)">
        <q-item-section>{{ lang.location.noResults }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QItem, QItemLabel, QItemSection, QSelect, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'
import { useGeocoder, DEFAULT_MIN_LENGTH } from './useGeocoder'
import { createPhotonGeocoder } from './geocoder'
import type { GeocodeResult, Geocoder } from './types'

export interface Props {
  /** The selected result, or its formatted string. */
  modelValue?: GeocodeResult | string | null
  /** `null` disables the network; omitting it uses Photon in `language`. */
  geocoder?: Geocoder | null
  label?: string
  placeholder?: string
  language?: string
  dense?: boolean
  outlined?: boolean
  readonly?: boolean
  /** Forwarded to `QSelect`; `add-unique` lets the field accept free text. */
  newValueMode?: 'add' | 'add-unique' | 'toggle'
  /** Forwarded to `QSelect`, so a composed address panel can validate it. */
  rules?: ((value: unknown) => boolean | string)[]
  lazyRules?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  geocoder: undefined,
  label: undefined,
  placeholder: undefined,
  language: 'en',
  dense: false,
  outlined: false,
  readonly: false,
  newValueMode: undefined,
  rules: () => [],
  lazyRules: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: GeocodeResult | string | null): void
  (e: 'select', value: GeocodeResult): void
}>()

const $q = useQuasar()
const lang = useLang()
// The same activation `QStyledCard` uses: the store is module-wide, so every
// entry into the module keeps it in step with Quasar's own language.
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

// An explicit `null` means "no network"; an absent prop means "use the default
// provider", built with this component's `language` so the prop is not inert.
const effectiveGeocoder = computed<Geocoder | null>(() =>
  props.geocoder === undefined
    ? createPhotonGeocoder({ language: props.language })
    : props.geocoder
)

const { results, loading, error, search } = useGeocoder(effectiveGeocoder)

const query = ref('')
const searched = ref(false)

const resolvedLabel = computed(
  () => props.label ?? lang.value.location.searchPlaceholder
)

const optionLabel = (option: GeocodeResult | string) =>
  typeof option === 'string' ? option : (option.address?.formatted ?? '')
const optionCaption = (option: GeocodeResult) => {
  if (typeof option === 'string') return ''
  return [option.address?.city, option.address?.country]
    .filter(Boolean)
    .join(' · ')
}

const showsNoResults = (inputValue: string) =>
  !loading.value &&
  error.value === null &&
  searched.value &&
  inputValue.trim().length >= DEFAULT_MIN_LENGTH &&
  results.value.length === 0

const onFilter = async (value: string, update: (fn: () => void) => void) => {
  query.value = value
  await search(value)
  searched.value = true
  // Quasar keeps the menu closed and the inner spinner spinning until this
  // callback runs; the composable already owns the debounce and the abort.
  update(() => {})
}

const onModelValue = (value: GeocodeResult | string | null) => {
  emit('update:modelValue', value ?? null)
  if (value && typeof value !== 'string') emit('select', value)
}
</script>
