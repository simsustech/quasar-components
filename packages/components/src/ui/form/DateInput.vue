<template>
  <q-field :model-value="modelValue" bottom-slots :rules="validations">
    <template #control>
      <component
        :is="QInput"
        v-for="part in format.split('-')"
        :key="part"
        borderless
        v-bind="dateProps[part]"
      />
    </template>

    <template #append>
      <q-icon
        v-if="clearable"
        name="clear"
        class="cursor-pointer"
        @click="emit('update:modelValue', null)"
      />
      <q-icon name="event" class="cursor-pointer">
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
  locale?: QuasarLanguageCodes
  label?: string
  required?: boolean
  clearable?: boolean
  date?: Partial<QDateProps>
}
const props = withDefaults(defineProps<Props>(), {
  format: 'YYYY-MM-DD',
  locale: 'en-US',
  label: '',
  date: () => ({})
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
  if (Date.parse(date)) {
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
    style: 'max-width: 6ch',
    suffix: format.value === 'YYYY-MM-DD' ? '-' : undefined,
    class: format.value !== 'YYYY-MM-DD' ? 'q-mb-none q-ml-xs' : undefined,
    'onUpdate:modelValue': setYear,
    onKeydown: goToNextElement
  },
  MM: {
    modelValue: month.value ? String(month.value).padStart(2, '0') : '',
    placeholder: lang.value.datePicker.MM,
    style: 'max-width: 4ch',
    suffix: '-',
    class: 'q-ml-xs',
    'onUpdate:modelValue': setMonth,
    onKeydown: goToNextElement
  },
  DD: {
    modelValue: day.value ? String(day.value).padStart(2, '0') : '',
    placeholder: lang.value.datePicker.DD,
    style: 'max-width: 4ch',
    suffix: format.value === 'DD-MM-YYYY' ? '-' : undefined,
    class: format.value === 'YYYY-MM-DD' ? 'q-ml-xs' : undefined,
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

<style>
.q-field--auto-height .q-field__control,
.q-field--auto-height .q-field__native {
  min-height: 1em;
}
.q-field--borderless .q-field__bottom,
.q-field--borderless.q-field--dense .q-field__control,
.q-field--standard .q-field__bottom,
.q-field--standard.q-field--dense .q-field__control {
  padding-top: 0;
}
</style>
