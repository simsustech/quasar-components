<template>
  <div class="q-location-address">
    <QLocationSearch
      class="q-location-address__street"
      :model-value="fields.street ?? null"
      :geocoder="effectiveGeocoder"
      :language="language"
      :readonly="readonly"
      :label="`${lang.location.street}${required ? '*' : ''}`"
      :rules="validations"
      :lazy-rules="required"
      new-value-mode="add-unique"
      outlined
      @update:model-value="onStreet"
    />
    <div class="q-location-address__row">
      <q-input
        class="q-location-address__house-number"
        outlined
        :model-value="fields.houseNumber ?? ''"
        :label="`${lang.location.houseNumber}${required ? '*' : ''}`"
        :rules="validations"
        :lazy-rules="required"
        :readonly="readonly"
        @update:model-value="setField('houseNumber', $event)"
      />
      <q-input
        outlined
        :model-value="fields.postalCode ?? ''"
        :label="`${lang.fields.postalCode}${required ? '*' : ''}`"
        :rules="validations"
        :lazy-rules="required"
        :readonly="readonly"
        @update:model-value="setField('postalCode', $event)"
      />
      <q-input
        outlined
        :model-value="fields.city ?? ''"
        :label="`${lang.fields.city}${required ? '*' : ''}`"
        :rules="validations"
        :lazy-rules="required"
        :readonly="readonly"
        @update:model-value="setField('city', $event)"
      />
      <q-input
        outlined
        :model-value="fields.country ?? ''"
        :label="lang.location.country"
        :readonly="readonly"
        @update:model-value="setField('country', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { QInput, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'
import QLocationSearch from './QLocationSearch.vue'
import { createPhotonGeocoder } from './geocoder'
import type {
  GeocodeResult,
  Geocoder,
  LocationAddress,
  LocationValue
} from './types'

export interface Props {
  modelValue?: LocationAddress
  /** The pin's value; its address fills empty fields. */
  location?: LocationValue | null
  geocoder?: Geocoder | null
  readonly?: boolean
  language?: string
  /** Marks street, house number, postal code and city as required. */
  required?: boolean
  /** Overwrite fields that already have a value when `location` changes. */
  replace?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  location: null,
  geocoder: undefined,
  readonly: false,
  language: 'en',
  required: false,
  replace: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: LocationAddress): void
  /** A picked suggestion, with the coordinates the address alone cannot carry. */
  (e: 'select', value: GeocodeResult): void
}>()

const $q = useQuasar()
const lang = useLang()

/**
 * `lazy-rules` supplies the timing: the message appears on blur, not while the
 * user is still typing the first character. The rule reads `required` and the
 * message from the lang ref inside a computed, so `reactive-rules` re-validates
 * a visible error when either changes.
 */
const validations = computed(() =>
  props.required
    ? [
        (value: unknown) =>
          !!(value == null ? '' : String(value)).trim() ||
          lang.value.validations.fieldRequired
      ]
    : []
)
// The same activation `QStyledCard` uses: the store is module-wide, so every
// entry into the module keeps it in step with Quasar's own language.
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

const effectiveGeocoder = computed<Geocoder | null>(() =>
  props.geocoder === undefined
    ? createPhotonGeocoder({ language: props.language })
    : props.geocoder
)

const KEYS = [
  'street',
  'houseNumber',
  'postalCode',
  'city',
  'region',
  'country',
  'countryCode',
  'formatted'
] as const

const fields = reactive<LocationAddress>({ ...props.modelValue })

/**
 * The last address this component emitted. The watcher below used to compare
 * the incoming `v-model` against `fields` with `JSON.stringify`, which is
 * key-order sensitive: a consumer echoing the same address with its keys in a
 * different order looked like an external change and was re-applied with
 * `replace`, overwriting what the user had typed. Remembering what we handed out
 * is what tells our own echo apart from a real change.
 */
let lastEmitted: LocationAddress | null = null

/** Same address by key, not by serialisation order. */
const sameAddress = (left: LocationAddress, right: LocationAddress) =>
  KEYS.every((key) => (left[key] ?? '') === (right[key] ?? ''))

const emitAddress = () => {
  const value = { ...fields }
  lastEmitted = value
  emit('update:modelValue', value)
}

const setField = (
  key: (typeof KEYS)[number],
  value: string | number | null | undefined
) => {
  fields[key] = value === null || value === undefined ? '' : String(value)
  // `formatted` is a snapshot of the parts it was geocoded from, so a changed
  // part makes it stale: the map's bubble kept showing the old house number.
  if (key !== 'formatted') fields.formatted = ''
  emitAddress()
}

/**
 * Writes an address the component did not type — a picked suggestion, or the
 * pin's own reverse geocode. A blank field counts as "fill me", so assigning
 * unconditionally reported a change on every echo of the same address, and the
 * consumer's echo came straight back: an endless emit loop that starved the
 * page (measured as `V8 javascript OOM` in a renderer). Only a value that
 * actually differs is a change.
 */
const applyAddress = (address: LocationAddress, replace: boolean) => {
  let changed = false
  for (const key of KEYS) {
    const value = address[key]
    if (value === undefined) continue
    if ((replace || !fields[key]) && fields[key] !== value) {
      fields[key] = value
      changed = true
    }
  }
  if (changed) emitAddress()
}

const onStreet = (value: GeocodeResult | string | null) => {
  if (value === null) {
    setField('street', '')
    return
  }
  if (typeof value === 'string') {
    setField('street', value)
    return
  }
  // Picking a suggestion means "this address", so it replaces every part of it,
  // unlike a pin move which only fills blanks. The coordinates go out with it:
  // they are the only thing the parts do not have, and without them the address
  // was entered but the pin never moved.
  emit('select', value)
  applyAddress(value.address, true)
}

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return
    // Our own edits come back through `v-model` unchanged, so only a real
    // external change gets past this.
    if (lastEmitted !== null && sameAddress(value, lastEmitted)) return
    applyAddress(value, true)
  }
)

watch(
  () => props.location?.address,
  (address) => {
    if (!address) return
    applyAddress(address, props.replace)
  }
)
</script>
