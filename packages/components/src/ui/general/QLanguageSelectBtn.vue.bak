<template>
  <q-btn flat>
    <div v-if="modelValue">
      <component
        :is="flags[modelValue.slice(-2).toLowerCase() as keyof typeof flags]"
      />
    </div>

    <q-menu>
      <q-list>
        <q-item
          v-for="option in languageOptions"
          :key="option.value"
          v-close-popup
          clickable
          @click="$emit('update:model-value', option.value)"
        >
          <q-item-section avatar>
            <component
              :is="
                flags[
                  option.value.slice(-2).toLowerCase() as keyof typeof flags
                ]
              "
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ option.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useQuasar, QuasarLanguage } from 'quasar'
import * as flags from '../flags/index.js'
import { useLang as useFlagsLang } from '../flags/lang/index.js'

export interface Props {
  modelValue: string
  languageImports: Record<string, () => Promise<{ default: QuasarLanguage }>>
  allowedCodes?: [keyof ReturnType<typeof useFlagsLang>['value']['languages']]
}
const {
  modelValue,
  allowedCodes = ['en-US', 'nl'],
  languageImports
} = defineProps<Props>()
const $q = useQuasar()

const flagsLang = useFlagsLang()

const languageOptions = computed(() => {
  const options = []
  for (let lang of Object.keys(flagsLang.value.languages) as Array<
    keyof (typeof flagsLang.value)['languages']
  >) {
    if (!allowedCodes.length || allowedCodes.includes(lang)) {
      options.push({
        label: flagsLang.value.languages[lang],
        value: lang
      })
    }
  }
  return options
})

// const languageOptions = [
//   {
//     label: enUsLanguage.value,
//     value: 'en-US'
//   },
//   {
//     label: nlLanguage.value,
//     value: 'nl'
//   }
// ]

watch(
  () => modelValue,
  (langIso: string) => {
    try {
      languageImports[langIso]().then(
        // langList[`../../../node_modules/quasar/lang/${langIso}.mjs`]().then(
        (lang) => {
          $q.lang.set(lang.default)
        }
      )
    } catch (e) {
      console.error(e)
    }
  }
)
</script>
