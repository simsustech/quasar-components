<template>
  <q-select
    v-bind="attrs"
    :options="languageOptions"
    :model-value="modelValue"
    :filled="false"
    borderless
    emit-value
    map-options
  >
    <template #selected-item="scope">
      <div v-if="scope.opt">
        <q-item>
          <q-item-section avatar>
            <component
              :is="
                flags[
                  scope.opt.value.slice(-2).toLowerCase() as keyof typeof flags
                ]
              "
            />
          </q-item-section>
          <q-item-section label>
            {{ scope.opt.label }}
          </q-item-section>
        </q-item>
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
      <!-- <q-item v-if="scope.opt.value === 'en-US'" v-bind="scope.itemProps">
        <q-item-section avatar>
          <en-us ref="enUsRef" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ enUsLanguage }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="scope.opt.value === 'nl'" v-bind="scope.itemProps">
        <q-item-section avatar>
          <nl ref="nlRef" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ nlLanguage }}
          </q-item-label>
        </q-item-section>
      </q-item> -->
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { useAttrs, computed, watch } from 'vue'
import { useQuasar, QSelect, QuasarLanguage } from 'quasar'
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
const attrs = useAttrs()
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
