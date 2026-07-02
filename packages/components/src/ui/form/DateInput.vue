<template>
  <q-field
    :model-value="modelValue"
    bottom-slots
    :rules="validations"
    :label="`${label}${required ? '*' : ''}`"
    stack-label
    lazy-rules
    class="date-input-field"
  >
    <template #control>
      <div class="row items-center date-input-row no-wrap" style="height: 100%">
        <div
          v-for="(part, index) in parts"
          :key="part.key"
          class="row no-wrap items-center"
          style="gap: 0"
        >
          <input
            :value="part.value"
            :placeholder="part.placeholder"
            class="q-field__native text-center"
            :class="part.inputClass"
            :style="part.style"
            inputmode="numeric"
            :maxlength="part.maxLength"
            @input="onInput($event, part.key)"
            @keydown="onKeydown($event, index)"
          />
          <span
            v-if="index < parts.length - 1"
            class="q-field__marginal"
            style="flex: initial; width: 1ch; padding: 0; margin: 0"
            >-</span
          >
        </div>
      </div>
    </template>

    <template #append>
      <q-icon
        v-if="clearable"
        :name="icons.clear"
        class="cursor-pointer"
        @click="emit('update:modelValue', null)"
      />
      <q-icon :name="icons.event" class="cursor-pointer">
        <q-tooltip v-if="formattedDate">
          {{ formattedDate }}
        </q-tooltip>
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-bind="date"
            :model-value="modelValue?.replaceAll('-', '/')"
            @update:model-value="setDate"
          >
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                :label="lang.buttons.close"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>

    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </q-field>
</template>

<script setup lang="ts">
import { ref, watch, toRefs, computed } from 'vue'
import { QDate, QDateProps, QuasarLanguageCodes } from 'quasar'
import { useLang } from './lang'

export interface Props {
  modelValue: string | null
  format?: 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'MM-DD-YYYY'
  locale?: QuasarLanguageCodes[number]
  label?: string
  required?: boolean
  clearable?: boolean
  date?: Partial<QDateProps>
  icons?: {
    event: string
    clear: string
  }
}
const props = withDefaults(defineProps<Props>(), {
  format: 'YYYY-MM-DD',
  locale: 'en-US',
  label: '',
  date: () => ({}),
  icons: () => ({
    event: 'event',
    clear: 'clear'
  })
})
const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void
}>()

const lang = useLang()

const { modelValue, format, locale } = toRefs(props)

const year = ref('')
const month = ref('')
const day = ref('')

interface PartInfo {
  value: string
  placeholder: string
  style: Record<string, string>
  inputClass: string
  maxLength: number
}

const parts = computed(() => {
  const keys = format.value.split('-')
  const map: Record<string, PartInfo> = {
    YYYY: {
      value: year.value,
      placeholder: lang.value.datePicker.YYYY,
      style: { 'max-width': format.value === 'YYYY-MM-DD' ? '8ch' : '7ch' },
      inputClass: 'text-center',
      maxLength: 4
    },
    MM: {
      value: month.value,
      placeholder: lang.value.datePicker.MM,
      style: { 'max-width': '7ch' },
      inputClass: 'text-center',
      maxLength: 2
    },
    DD: {
      value: day.value,
      placeholder: lang.value.datePicker.DD,
      style: { 'max-width': format.value === 'DD-MM-YYYY' ? '7ch' : '4ch' },
      inputClass: 'text-center',
      maxLength: 2
    }
  }
  return keys.map((k) => ({ key: k, ...map[k] }))
})

const onInput = (e: Event, key: string) => {
  const raw = (e.target as HTMLInputElement).value
  if (key === 'YYYY') year.value = clamp(raw, 4)
  else if (key === 'MM') month.value = clamp(raw, 2, 12)
  else if (key === 'DD') day.value = clamp(raw, 2, 31)
}

const onKeydown = (e: KeyboardEvent, _index: number) => {
  if (['Minus', 'Slash'].includes(e.code)) {
    e.preventDefault()
    const parent = (e.currentTarget as HTMLElement).parentElement
    const all = parent?.querySelectorAll('.q-field__native')
    const currentIdx = Array.from(all || []).indexOf(
      e.currentTarget as HTMLElement
    )
    const next = all?.[currentIdx + 1] as HTMLElement | undefined
    next?.focus()
  }
}

const clamp = (val: string, maxLen: number, maxVal?: number): string => {
  const digits = val.replace(/\D/g, '').slice(0, maxLen)
  if (maxVal !== undefined && digits.length === maxLen) {
    const n = parseInt(digits, 10)
    if (n > maxVal) return String(maxVal)
  }
  return digits
}

watch(year, () => emitDate())
watch(month, () => emitDate())
watch(day, () => emitDate())

function emitDate() {
  const y = year.value
  const m = month.value
  const d = day.value
  if (y.length === 4 && m.length === 2 && d.length === 2) {
    const date = `${y}-${m}-${d}`
    if (!isNaN(Date.parse(date))) {
      emit('update:modelValue', date)
      return
    }
  }
  if (modelValue.value !== null) {
    emit('update:modelValue', null)
  }
}

const formattedDate = computed(() => {
  if (modelValue.value)
    return new Date(Date.parse(modelValue.value)).toLocaleDateString(
      locale.value,
      {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    )
  return ''
})

function setInternalDate(
  dateString?: string | null,
  separator: '-' | '/' = '-'
) {
  if (dateString) {
    const [yearPart, monthPart, dayPart] = dateString.split(separator)
    if (yearPart && monthPart && dayPart) {
      year.value = String(yearPart)
      month.value = String(monthPart).padStart(2, '0')
      day.value = String(dayPart).padStart(2, '0')
    }
  }
}

const setDate: InstanceType<typeof QDate>['$props']['onUpdate:modelValue'] = (
  value
) => {
  setInternalDate(value, '/')
}

watch(modelValue, (newVal) => {
  if (newVal) setInternalDate(newVal)
  else if (newVal === null) {
    year.value = ''
    month.value = ''
    day.value = ''
  }
})
setInternalDate(modelValue.value)

const validations = ref<((val: string) => boolean | string)[]>([
  (v) => {
    if (v !== null)
      return /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(v)
    return true
  }
])

if (props.required)
  validations.value.push(
    (val: string) => !!val || lang.value.validations.fieldRequired
  )
</script>

<style>
/* The outer QField gets q-field--labeled which leaks padding into
   descendant .q-field__native elements. The auto-height override
   fixes padding-top but not padding-bottom. */
.date-input-field.q-field--auto-height.q-field--labeled .q-field__native {
  padding-bottom: 0 !important;
  box-sizing: border-box;
}

/* Remove the standard underline (creates whitespace beneath) */
.date-input-field.q-field--standard
  > .q-field__inner
  > .q-field__control::before {
  border-bottom: none !important;
}
.date-input-field.q-field--standard
  > .q-field__inner
  > .q-field__control::after {
  display: none !important;
}
</style>
