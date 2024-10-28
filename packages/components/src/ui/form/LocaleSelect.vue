<template>
  <q-select
    v-bind="attrs"
    :options="languageOptions"
    :model-value="modelValue"
    :label="`${lang.locale.locale}${required ? '*' : ''}`"
    emit-value
    map-options
  >
    <template #selected>
      <div v-if="modelValue">
        <component
          :is="flags[modelValue.slice(-2).toLowerCase() as keyof typeof flags]"
        />
        {{
          flagsLang.languages[
            modelValue as keyof (typeof flagsLang)['languages']
          ]
        }}
      </div>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <component
            :is="
              flags[
                scope.opt.value.slice(-2).toLowerCase() as keyof typeof flags
              ]
            "
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ scope.opt.label }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { useAttrs, computed } from 'vue'
import { QSelect } from 'quasar'
import * as flags from '../flags/index.js'
import { useLang as useFlagsLang } from '../flags/lang/index.js'
import { useLang } from './lang/index.js'

export interface Props {
  modelValue?: string | null
  required?: boolean
  allowedCodes?: [keyof ReturnType<typeof useFlagsLang>['value']['languages']]
}
const {
  modelValue,
  required,
  allowedCodes = ['en-US', 'nl']
} = defineProps<Props>()
const attrs = useAttrs()

const lang = useLang()
const flagsLang = useFlagsLang()

const languageOptions = computed(() => {
  const options = []
  for (let lang of Object.keys(flagsLang.value.languages) as Array<
    keyof (typeof flagsLang.value)['languages']
  >) {
    if (!allowedCodes?.length || allowedCodes.includes(lang)) {
      options.push({
        label: flagsLang.value.languages[lang],
        value: lang
      })
    }
  }
  return options
})
</script>
