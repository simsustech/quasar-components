<template>
  <q-field
    :model-value="modelValue"
    bottom-slots
    :rules="validations"
    :label="`${label}${required ? '*' : ''}`"
    stack-label
  >
    <template #control>
      <div class="row">
        <component
          :is="QInput"
          v-for="(part, index) in format.split('-')"
          :key="part"
          class="col-auto"
          borderless
          :filled="false"
          :outlined="false"
          :standout="false"
          :rounded="false"
          v-bind="dateProps[part]"
          inputmode="numeric"
          dense
        >
          <template #after>
            <a v-if="index < 2" style="margin-top: 1em; width: 1ch">-</a>
          </template>
        </component>
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
  </q-field>
</template>

<script setup lang="ts">
import { ref, watch, toRefs, computed } from 'vue'
import {
  QDate,
  QDateProps,
  QInput,
  QInputProps,
  QuasarLanguageCodes
} from 'quasar'
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
// const attrs = useAttrs()

const lang = useLang()

const { modelValue, format, locale } = toRefs(props)

const year = ref<number>()
const month = ref<number>()
const day = ref<number>()

const setYear: InstanceType<typeof QInput>['$props']['onUpdate:modelValue'] = (
  val
) => {
  const nr = Number(val)
  if (nr && nr > 1e3 && nr < 1e4) year.value = nr
  else year.value = undefined
}

const setMonth: InstanceType<typeof QInput>['$props']['onUpdate:modelValue'] = (
  val
) => {
  const nr = Number(val)
  if (nr && nr > 0 && nr < 13) month.value = nr
  else month.value = undefined
}

const setDay: InstanceType<typeof QInput>['$props']['onUpdate:modelValue'] = (
  val
) => {
  const nr = Number(val)
  if (nr && nr > 0 && nr < 32) day.value = nr
  else day.value = undefined
}

const setInternalDate = (
  dateString?: string | null,
  separator: '-' | '/' = '-'
) => {
  if (dateString) {
    const [yearPart, monthPart, dayPart] = dateString.split(separator)
    if (yearPart && monthPart && dayPart) {
      year.value = Number(yearPart)
      month.value = Number(monthPart)
      day.value = Number(dayPart)
    }
  }
}

const setDate: InstanceType<typeof QDate>['$props']['onUpdate:modelValue'] = (
  value
) => {
  setInternalDate(value, '/')
}

watch([year, month, day], () => {
  const date = `${year.value}-${String(month.value).padStart(2, '0')}-${String(day.value).padStart(2, '0')}`
  if (year.value && month.value && day.value && !isNaN(Date.parse(date))) {
    emit('update:modelValue', date)
  } else {
    emit('update:modelValue', '')
  }
})

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

watch(modelValue, (newVal) => {
  if (newVal) setInternalDate(newVal)
  else if (newVal === null) {
    year.value = undefined
    month.value = undefined
    day.value = undefined
  }
})
setInternalDate(modelValue.value)

const goToNextElement = (e: KeyboardEvent) => {
  if (['Minus', 'Slash'].includes(e.code)) {
    e.preventDefault()
    const next = (e.currentTarget as HTMLElement).parentElement?.parentElement
      ?.parentElement?.parentElement?.nextElementSibling
    if (next) {
      ;(next as HTMLElement).focus()
    }
  }
}

const dateProps = computed<Record<string, QInputProps>>(() => ({
  YYYY: {
    modelValue: year.value,
    placeholder: lang.value.datePicker.YYYY,
    style: {
      'max-width': format.value === 'YYYY-MM-DD' ? '8ch' : '7ch',
      'margin-top': '-1.75em',
      'margin-bottom': '-0.5em',
      background: 'transparent',
      border: 0
    },
    // suffix: format.value === 'YYYY-MM-DD' ? '-' : undefined,
    class: format.value !== 'YYYY-MM-DD' ? 'q-mb-none q-ml-none' : undefined,
    inputClass: 'text-center',
    'onUpdate:modelValue': setYear,
    onKeydown: goToNextElement
  },
  MM: {
    modelValue: month.value ? String(month.value).padStart(2, '0') : '',
    placeholder: lang.value.datePicker.MM,
    style: {
      'max-width': '7ch',
      'margin-top': '-1.75em',
      'margin-bottom': '-0.5em',
      background: 'transparent',
      border: 0
    },
    // suffix: '-',
    class: 'q-ml-none',
    inputClass: 'text-center',
    'onUpdate:modelValue': setMonth,
    onKeydown: goToNextElement
  },
  DD: {
    modelValue: day.value ? String(day.value).padStart(2, '0') : '',
    placeholder: lang.value.datePicker.DD,
    style: {
      'max-width': format.value === 'DD-MM-YYYY' ? '7ch' : '4ch',
      'margin-top': '-1.75em',
      'margin-bottom': '-0.5em',
      background: 'transparent',
      border: 0
    },
    // suffix: format.value === 'DD-MM-YYYY' ? '-' : undefined,
    class: format.value === 'YYYY-MM-DD' ? 'q-ml-none' : undefined,
    inputClass: 'text-center',
    'onUpdate:modelValue': setDay,
    onKeydown: goToNextElement
  }
}))

const validations = ref<((val: string) => boolean | string)[]>([
  (v) => {
    if (v !== null)
      // return /^\d{4}\/(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])$/.test(v)
      return /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(v)
    return true
  }
])

if (props.required)
  validations.value.push(
    (val: string) => !!val || lang.value.validations.fieldRequired
  )
</script>

<style></style>
