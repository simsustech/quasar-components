<template>
  <q-field
    :model-value="modelValue"
    :rules="validations"
    :label="`${label}${required ? '*' : ''}`"
    stack-label
    borderless
  >
    <template #control>
      <div class="row">
        <q-select
          v-if="showHour"
          v-model="hour"
          class="col-auto"
          :options="hourOptions"
          :hint="lang.cron.hour"
          bottom-slots
          borderless
          :filled="false"
          :outlined="false"
          :standout="false"
          :rounded="false"
          :style="smallStyle"
          map-options
          emit-value
          multiple
        >
          <template #selected>
            {{ hour.length ? hour.join(',') : lang.cron.every.hour }}
          </template>
        </q-select>
        <q-select
          v-if="showMinute"
          v-model="minute"
          class="col-auto"
          :options="minuteOptions"
          :hint="lang.cron.minute"
          bottom-slots
          borderless
          :filled="false"
          :outlined="false"
          :standout="false"
          :rounded="false"
          :style="smallStyle"
          map-options
          emit-value
          multiple
        >
          <template #selected>
            {{ minute.length ? minute.join(',') : lang.cron.every.minute }}
          </template>
        </q-select>
        <q-select
          v-model="dayOfMonth"
          class="col-auto"
          :options="dayOfMonthOptions"
          :hint="lang.cron.dayOfMonth"
          bottom-slots
          borderless
          :filled="false"
          :outlined="false"
          :standout="false"
          :rounded="false"
          :style="smallStyle"
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
        </q-select>
        <q-select
          v-model="month"
          class="col-auto"
          :options="monthOptions"
          :hint="lang.cron.month"
          :placeholder="lang.cron.month"
          bottom-slots
          borderless
          :filled="false"
          :outlined="false"
          :standout="false"
          :rounded="false"
          :style="largeStyle"
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
        </q-select>
      </div>
      <div v-if="showDayOfWeek" class="row">
        <q-select
          v-if="showDayOfWeek"
          v-model="dayOfWeek"
          class="col-auto"
          :options="dayOfWeekOptions"
          :placeholder="lang.cron.dayOfWeek"
          :hint="lang.cron.dayOfWeek"
          :style="dayOfWeekStyle"
          bottom-slots
          borderless
          :filled="false"
          :outlined="false"
          :standout="false"
          :rounded="false"
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
        </q-select>
      </div>
    </template>
  </q-field>
</template>

<script setup lang="ts">
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

const minuteOptions = ref([...Array(59).keys()].map(String))
const hourOptions = ref([...Array(24).keys()].map(String))
const dayOfMonthOptions = ref(
  Array.from({ length: 31 }, (_, i) => i + 1).map((dayOfMonth) =>
    String(dayOfMonth)
  )
)
const monthOptions = ref([
  ...Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
    label: $q.lang.date.months[month - 1],
    value: String(month)
  }))
])
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

const smallStyle = {
  'margin-top': '-1.75em',
  'margin-bottom': '-0.5em',
  background: 'transparent',
  border: 0
}

const largeStyle = {
  'margin-bottom': '-0.5em',
  background: 'transparent',
  border: 0
}

const dayOfWeekStyle = {
  'margin-bottom': '-0.5em',
  background: 'transparent',
  border: 0
}

watch(modelValue, (newVal) => {
  if (newVal) setInternalCron(newVal)
  else if (newVal === null) {
    setInternalCron('0 0 1 * *')
  }
})
setInternalCron(modelValue.value)
</script>
