<template>
  <q-field
    :model-value="modelValue"
    :rules="validations"
    :label="`${label}${required ? '*' : ''}`"
    stack-label
    class="cron-input-field"
  >
    <template #control>
      <div class="row items-center cron-input-row">
        <q-select
          v-if="showHour"
          v-model="hour"
          class="col-auto cron-input-part"
          :options="hourOptions"
          :aria-label="lang.cron.hour"
          dense
          borderless
          hide-bottom-space
          map-options
          emit-value
          multiple
        >
          <template #selected>
            {{ hour.length ? hour.join(',') : lang.cron.every.hour }}
          </template>
          <q-tooltip>{{ lang.cron.hour }}</q-tooltip>
        </q-select>
        <q-select
          v-if="showMinute"
          v-model="minute"
          class="col-auto cron-input-part"
          :options="minuteOptions"
          :aria-label="lang.cron.minute"
          dense
          borderless
          hide-bottom-space
          map-options
          emit-value
          multiple
        >
          <template #selected>
            {{ minute.length ? minute.join(',') : lang.cron.every.minute }}
          </template>
          <q-tooltip>{{ lang.cron.minute }}</q-tooltip>
        </q-select>
        <q-select
          v-model="dayOfMonth"
          class="col-auto cron-input-part"
          :options="dayOfMonthOptions"
          :aria-label="lang.cron.dayOfMonth"
          dense
          borderless
          hide-bottom-space
          map-options
          emit-value
          multiple
        >
          <template #selected>
            {{
              dayOfMonth.length
                ? dayOfMonth.join(',')
                : lang.cron.every.dayOfMonth
            }}
          </template>
          <q-tooltip>{{ lang.cron.dayOfMonth }}</q-tooltip>
        </q-select>
        <q-select
          v-model="month"
          class="col-auto cron-input-part"
          :options="monthOptions"
          :aria-label="lang.cron.month"
          dense
          borderless
          hide-bottom-space
          map-options
          emit-value
          multiple
        >
          <template #selected>
            {{
              month.length
                ? month
                    .map((val) => $q.lang.date.months[Number(val) - 1])
                    .join(',')
                : lang.cron.every.month
            }}
          </template>
          <q-tooltip>{{ lang.cron.month }}</q-tooltip>
        </q-select>
        <q-select
          v-if="showDayOfWeek"
          v-model="dayOfWeek"
          class="col-auto cron-input-part"
          :options="dayOfWeekOptions"
          :aria-label="lang.cron.dayOfWeek"
          dense
          borderless
          hide-bottom-space
          map-options
          emit-value
          multiple
        >
          <template #selected>
            {{
              dayOfWeek.length
                ? dayOfWeek
                    .map((val) => $q.lang.date.days[Number(val)])
                    .join(',')
                : lang.cron.every.dayOfWeek
            }}
          </template>
          <q-tooltip>{{ lang.cron.dayOfWeek }}</q-tooltip>
        </q-select>
      </div>
    </template>
  </q-field>
</template>

<script setup lang="ts">
// Each part is a QSelect, so the field chrome inside `cron-input-row` belongs to
// Quasar: those selectors are rules in the preset, keyed on this class.
import { ref, toRefs, watch } from 'vue'
import { useLang } from './lang/index.js'
import { useQuasar } from 'quasar'
export interface Props {
  modelValue: string
  required?: boolean
  showMinute?: boolean
  showHour?: boolean
  showDayOfWeek?: boolean
}

// A part is a value, not a field: its control takes the field's value band
// (`--q-comp-lg` minus the label band), draws no frame and no underline of its
// own, and its container drops the label band the outer field already reserves.
// `.q-field` is in each chain so these keep the depth of the stylesheet they
// replaced — Quasar's dense, auto-height control sets a three-class min-height.
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const { modelValue } = toRefs(props)

const $q = useQuasar()
const lang = useLang()
const cronregex = new RegExp(
  /(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/
)
const label = lang.value.cron.name
const minute = ref<string[]>(['0'])
const hour = ref<string[]>(['0'])
const dayOfMonth = ref<string[]>(['1'])
const month = ref<string[]>([])
const dayOfWeek = ref<string[]>([])

const minuteOptions = ref([...Array(60).keys()].map(String))
const hourOptions = ref([...Array(24).keys()].map(String))
const dayOfMonthOptions = ref(
  Array.from({ length: 31 }, (_, i) => i + 1).map((dayOfMonth) =>
    String(dayOfMonth)
  )
)
const monthOptions = ref(
  Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
    label: $q.lang.date.months[month - 1],
    value: String(month)
  }))
)
const dayOfWeekOptions = ref(
  [...Array(7).keys()].map((day) => ({
    label: $q.lang.date.days[day],
    value: String(day)
  }))
)

const validations = ref([
  (val: string) =>
    cronregex.test(val) || lang.value.cron.validations.invalidCron
])

watch([minute, hour, dayOfMonth, month, dayOfWeek], () => {
  const cron = `${minute.value.join(',') || '*'} ${hour.value.join(',') || '*'} ${dayOfMonth.value.join(',') || '*'} ${month.value.join(',') || '*'} ${dayOfWeek.value.join(',') || '*'}`
  if (cronregex.test(cron)) {
    emit('update:modelValue', cron)
  } else {
    emit('update:modelValue', '0 0 1 * *')
  }
})

function setInternalCron(cronString: string) {
  if (cronregex.test(cronString)) {
    const [newMinute, newHour, newDayOfMonth, newMonth, newDayOfWeek] =
      cronString.split(' ')
    minute.value = newMinute.split(',').filter((val) => val !== '*')
    hour.value = newHour.split(',').filter((val) => val !== '*')
    dayOfMonth.value = newDayOfMonth.split(',').filter((val) => val !== '*')
    month.value = newMonth.split(',').filter((val) => val !== '*')
    dayOfWeek.value = newDayOfWeek.split(',').filter((val) => val !== '*')
  }
}

watch(modelValue, (newVal) => {
  if (newVal) setInternalCron(newVal)
  else if (newVal === null) {
    setInternalCron('0 0 1 * *')
  }
})
setInternalCron(modelValue.value)
</script>
