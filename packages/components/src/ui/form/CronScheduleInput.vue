<template>
  <!--
    One field, not a field inside a field. The outer QField owns the frame,
    label, hint and validation; the parts inside are dense borderless selects,
    so a value reads as this field's content instead of as a bunch of fields
    nested in another field.

    That is also why the outer field is NOT `borderless`: it used to be, which
    meant the one field on a form drawn without a surface, padding or radius —
    next to a normal input it read as loose text under a floating label. Any
    field-appearance attribute a consumer passes (`filled`, `outlined`,
    `standout`, `dense`, `square`) lands on the outer QField through Vue's
    attribute inheritance, so the input can match the rest of its form.
  -->
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

<style>
/*
 * Quasar's `--labeled` and `--auto-height` rules are descendant selectors, so
 * the outer field's 24px label band cascaded into every part as well: each
 * inner QSelect reserved a label band of its own and the composite grew to two
 * field heights. Zero it for the parts only — the outer control keeps the band
 * it needs for its own label.
 */
.cron-input-field .cron-input-row .q-field__control-container {
  padding-top: 0 !important;
}

/*
 * A part sits in the field's value band — the control's 56px minus the label
 * band — so it is shorter than a standalone dense select and draws no
 * horizontal padding of its own: the outer control already carries that, and
 * the value then lines up with the label above it. Both inputs are tokens, so
 * the band follows the active style (md3: 56 − 24, md2: 56 − 28).
 */
.cron-input-field .cron-input-row .cron-input-part .q-field__control {
  height: max(
    24px,
    calc(var(--q-comp-lg, 56px) - var(--q-field-labeled-padding-top, 24px))
  );
  min-height: 0;
  padding-inline: 0;
  background: transparent;
}

/*
 * A part is a value, not a field: no frame, no bottom border and no focus
 * underline of its own. Quasar paints both pseudo-elements on every field
 * control, which drew a stray rule across the row of values.
 */
.cron-input-field .cron-input-row .cron-input-part .q-field__control::before,
.cron-input-field .cron-input-row .cron-input-part .q-field__control::after {
  content: none;
}

/*
 * `--labeled` reserves 8px under a native input for its underline; this field's
 * value is a row of selects, so that reservation only added a strip of dead
 * surface and made the composite taller than the inputs beside it (64px
 * against a plain field's 56px).
 */
.cron-input-field .q-field__native {
  padding-bottom: 0;
}
</style>
