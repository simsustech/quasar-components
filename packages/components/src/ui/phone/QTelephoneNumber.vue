<template>
  <q-input
    v-bind="attrs"
    class="phone-input-field"
    :model-value="display"
    :label="`${lang.fields.telephoneNumber}${required ? '*' : ''}`"
    :rules="validations"
    lazy-rules
    reactive-rules
    @update:model-value="onInput"
    @blur="onBlur"
    @focus="(event: Event) => emit('focus', event)"
  >
    <template #prepend>
      <q-select
        class="phone-dial-select"
        :model-value="country"
        :options="countryOptions"
        :aria-label="lang.telephoneNumber.countryCode"
        emit-value
        map-options
        borderless
        hide-bottom-space
        options-dense
        use-input
        :input-debounce="0"
        ref="dialSelect"
        :input-style="searchStyle"
        @filter="onFilter"
        @popup-hide="onPopupHide"
        @update:model-value="onCountryChange"
      >
        <template #selected>
          <!--
            The chip yields to the query: an input-enabled select renders both,
            and `+31 +33` reads as two dial codes.
          -->
          <span v-if="!search.trim()" class="phone-dial-code">
            <q-icon
              v-if="selectedIcon"
              :name="selectedIcon"
              size="18px"
              class="q-mr-xs"
            />
            <img
              v-else-if="selectedFlag"
              :src="selectedFlag"
              class="phone-flag q-mr-xs"
              width="18"
              height="13"
              alt=""
              loading="lazy"
              decoding="async"
            />
            {{ dialCode }}
          </span>
        </template>
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section
              v-if="scope.opt.icon || flagUrl?.(scope.opt.value)"
              avatar
            >
              <q-icon v-if="scope.opt.icon" :name="scope.opt.icon" />
              <img
                v-else
                :src="flagUrl?.(scope.opt.value)"
                class="phone-flag"
                width="18"
                height="13"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label v-if="scope.opt.dialCode" caption>
                {{ scope.opt.dialCode }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'
import { QInput, QItem, QItemLabel, QItemSection, QIcon, QSelect } from 'quasar'
import { useLang } from '../form/lang/index.js'
import { countryCallingCode, defaultCountries } from './countries.js'
import type { PhoneCountry } from './countries.js'
import { formatNationalNumber, parsePhoneNumber } from './helpers.js'

export interface Props {
  /** The number in E.164 (`+31612345678`); national and spaced international input is re-parsed. */
  modelValue?: string
  /** ISO alpha-2 of the dial code shown, and the country a national number is read in. */
  country?: string
  /**
   * The dial-code list the popup opens with; defaults to every country with
   * metadata. A search still reaches every country, so a short list cannot make
   * a number unpickable.
   */
  countries?: PhoneCountry[]
  required?: boolean
  /**
   * Where to find a flag image for a country the list gives no `icon` for — a
   * URL per country, so the browser requests a flag only when it paints it.
   */
  flagUrl?: (iso3166: string) => string | undefined
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  country: 'NL',
  countries: () => [],
  required: false,
  flagUrl: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:country', value: string): void
  (e: 'blur', event: Event): void
  (e: 'focus', event: Event): void
}>()

const attrs = useAttrs()
const lang = useLang()

/** What the input shows: the national part, or whatever the user is typing. */
const display = ref('')
/** The dial code the visible number is read in. */
const country = ref((props.country || 'NL').toUpperCase())
/** The exact string we last emitted, so the prop coming back is not a change. */
const lastEmitted = ref('')
/** E.164 of that string, so re-typing the same number emits nothing. */
const emittedNumber = ref('')

/** What the user typed into the dial-code select; `''` while it is closed. */
const search = ref('')

const dialSelect = ref<QSelect | null>(null)

const toOption = (option: PhoneCountry) => {
  const code = countryCallingCode(option.iso3166)
  return {
    label: option.name,
    value: option.iso3166,
    icon: option.icon,
    dialCode: code ? `+${code}` : ''
  }
}

/** An entry of the popup, built from either source of countries. */
type DialOption = ReturnType<typeof toOption>

/** The consumer's list, in the order it gave. */
const listedOptions = computed<DialOption[]>(() =>
  props.countries.map(toOption)
)

/** Every country with metadata, named and sorted in the active language. */
const allOptions = computed<DialOption[]>(() =>
  defaultCountries(lang.value.isoName).map(toOption)
)

/** The popup while nothing is typed: the consumer's list, or every country. */
const openOptions = computed<DialOption[]>(() =>
  props.countries.length ? listedOptions.value : allOptions.value
)

/**
 * What a search may reach. A company that serves three countries still has to
 * be able to type `+33`, so the pool is the consumer's countries first and the
 * rest of the metadata after them: the list a user recognises, and no dead end.
 */
const searchPool = computed<DialOption[]>(() => {
  if (!props.countries.length) return allOptions.value
  const listed = new Set(listedOptions.value.map((option) => option.value))

  return [
    ...listedOptions.value,
    ...allOptions.value.filter((option) => !listed.has(option.value))
  ]
})

/**
 * A name, an ISO code or a dial code, so all three of "bel", "be" and "32"
 * (typed as `32` or `+32`) find Belgium.
 */
const matchesQuery = (option: DialOption, query: string) => {
  const text = query.trim().toLowerCase()
  if (!text) return true
  const digits = text.replace(/^\+/, '')
  const byCode =
    /^\d+$/.test(digits) && option.dialCode.startsWith(`+${digits}`)
  return (
    byCode ||
    option.label.toLowerCase().includes(text) ||
    option.value.toLowerCase().startsWith(text)
  )
}

/**
 * How many matches the popup shows at most. A broad query (`+3`) matches 36
 * countries and every rendered row asks for its flag, so the length of the list
 * is what bounds the requests — measured on a 245-row lazy list: 173 images in
 * Chromium and 46 in Firefox, against exactly 12 for a 12-row one. The
 * consumer's own countries lead the pool, so the cut cannot hide one of them.
 */
const MAX_MATCHES = 12

const countryOptions = computed<DialOption[]>(() => {
  const text = search.value.trim()
  if (!text) return openOptions.value
  return searchPool.value
    .filter((option) => matchesQuery(option, text))
    .slice(0, MAX_MATCHES)
})

/**
 * The search field is as wide as what has been typed, not the 20 characters a
 * bare input asks for: in a prepend the chip has to set the width, or the field
 * spends a third of its room on an empty box (measured 289px before, 126px
 * after). `min-width` is `!important` because Quasar pins a select's input at
 * 50px that way; at 2ch it keeps the box from collapsing to nothing when the
 * query is empty. `field-sizing` is what grows it while typing (Chromium 123+,
 * Firefox 136+), and `max-width` is the fallback for a browser without it: the
 * box stops at 14 characters instead of running the field's full width.
 *
 * `font: inherit` is the other half: a theme styles `.q-field__native`, but a
 * select's search box is `.q-field__input`, which no theme reaches — so it fell
 * back to the browser's 13.3px Arial while the chip beside it was 16px Roboto.
 */
const searchStyle =
  'min-width: 2ch !important; field-sizing: content; max-width: 14ch; font: inherit'

/** QSelect's custom filter: the options above already answer the query. */
const onFilter = (value: string, update: (fn: () => void) => void) => {
  update(() => {
    search.value = value ?? ''
  })
}

/**
 * A click outside closes the popup without clearing the query Quasar keeps in
 * its own input, so the chip came back beside the thing that was typed
 * (`+31 +33`). Clearing the mirror alone is not enough.
 */
const onPopupHide = () => {
  search.value = ''
  dialSelect.value?.updateInputValue('', true)
}

/**
 * Read from the whole pool, not from the filtered options: the flag must not
 * vanish because the popup happens to be holding a query.
 */
const selectedIcon = computed(
  () => searchPool.value.find((option) => option.value === country.value)?.icon
)

/** The chip's flag, when the country has no icon of its own. */
const selectedFlag = computed(() =>
  selectedIcon.value ? undefined : props.flagUrl?.(country.value)
)

const dialCode = computed(() => {
  const code = countryCallingCode(country.value)
  return code ? `+${code}` : ''
})

/**
 * `lazy-rules` supplies the timing: the message appears on blur and clears on
 * the first valid keystroke. The country and `required` are read here, in the
 * getter body, rather than inside the rule: that gives the array a reactive
 * dependency, so `reactive-rules` sees a new array when the country changes and
 * re-validates a visible error.
 */
const validations = computed(() => {
  const countryCode = country.value
  const isRequired = props.required
  return [
    (value: string) => {
      if (!(value ?? '').trim())
        return isRequired ? lang.value.validations.fieldRequired : true
      const parsed = parsePhoneNumber(value, countryCode)
      return parsed?.isValid()
        ? true
        : lang.value.telephoneNumber.validations.invalidPhoneNumber
    }
  ]
})

/** National significant number where the number has a country, international otherwise (`+800`). */
const displayText = (value: string): string =>
  formatNationalNumber(value, country.value) ?? value

const setCountry = (iso3166?: string) => {
  if (!iso3166 || iso3166 === country.value) return
  country.value = iso3166
  emit('update:country', iso3166)
}

const emitModel = (value: string) => {
  lastEmitted.value = value
  emittedNumber.value = value
  emit('update:modelValue', value)
}

const hydrate = (value: string) => {
  if (!value) {
    display.value = ''
    lastEmitted.value = ''
    emittedNumber.value = ''
    return
  }
  // The selected country is what makes a stored national number readable.
  const parsed = parsePhoneNumber(value, country.value)
  if (!parsed) {
    // Not a number: show the stored value untouched instead of swallowing it.
    display.value = value
    // Nothing was emitted for it, so nothing may be remembered as emitted
    // either: restoring the previously valid value has to read as a change.
    lastEmitted.value = ''
    emittedNumber.value = ''
    return
  }
  setCountry(parsed.country)
  display.value = displayText(parsed.number)
  lastEmitted.value = value
  emittedNumber.value = parsed.number
  // A stored national or spaced international value is re-emitted once in E.164,
  // so the model matches what the field documents. Emitting here is safe:
  // `lastEmitted` above absorbs the echo.
  // Only a valid number is normalised: a stored `123` parses but must not
  // become `+31123`, a number nobody ever entered.
  if (parsed.isValid() && parsed.number !== value) emitModel(parsed.number)
}

watch(
  () => props.modelValue,
  (value) => {
    const text = value ?? ''
    // The echo of our own emission: the visible text is the user's typing.
    if (text === lastEmitted.value) return
    hydrate(text)
  },
  { immediate: true }
)

watch(
  () => props.country,
  (value) => {
    if (value) country.value = value.toUpperCase()
  }
)

const onInput = (value: string | number | null) => {
  const text = value === null || value === undefined ? '' : String(value)
  display.value = text
  const parsed = parsePhoneNumber(text, country.value)
  if (!parsed) {
    if (emittedNumber.value !== '') emitModel('')
    return
  }
  setCountry(parsed.country)
  // Re-formatting mid-typing would move the caret; only the model is emitted.
  if (parsed.number !== emittedNumber.value) emitModel(parsed.number)
}

const onBlur = (event: Event) => {
  display.value = displayText(display.value)
  emit('blur', event)
}

const onCountryChange = (value: string) => {
  if (!value) return
  country.value = value.toUpperCase()
  emit('update:country', country.value)
  // The same digits mean a different number under another country, so the model
  // has to follow the dial code the user now sees.
  const parsed = parsePhoneNumber(display.value, country.value)
  if (parsed && parsed.number !== emittedNumber.value) emitModel(parsed.number)
}
</script>
