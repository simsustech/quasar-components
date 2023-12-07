<template>
  <q-input
    v-bind="attrs"
    :rules="validations"
    :model-value="modelValue"
    :label="`${label}${required ? '*' : ''}`"
    :placeholder="lang.datePicker.placeholder"
    mask="date"
    class="q-pr-md"
    @update:model-value="update"
  >
    <template v-slot:append>
      <q-icon
        v-if="clearable"
        name="clear"
        class="cursor-pointer"
        @click="$emit('update:modelValue', null)"
      />
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-bind="date"
            :model-value="modelValue"
            @update:model-value="$emit('update:modelValue', $event)"
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
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch, useAttrs, toRefs } from 'vue'
import { QDateProps, QInput, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  modelValue?: string | null
  label?: string
  required?: boolean
  clearable?: boolean
  date?: Partial<QDateProps>
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void
}>()
const attrs = useAttrs()

const lang = useLang()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

const { modelValue } = toRefs(props)

const update = (val: string | number | null) => {
  if (typeof val === 'string') emit('update:modelValue', val)
}
watch(
  () => modelValue?.value,
  (newVal) => {
    if (newVal === '') emit('update:modelValue', null)
  }
)

const validations = ref<((val: string) => boolean | string)[]>([
  (v) => {
    if (v !== null)
      return /^\d{4}\/(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])$/.test(v)
    return true
  }
])

if (props.required)
  validations.value.push(
    (val: string) => !!val || lang.value.validations.fieldRequired
  )
</script>
