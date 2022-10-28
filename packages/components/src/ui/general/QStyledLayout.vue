<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ title }}
        </q-toolbar-title>
        <q-btn>
          <q-menu>
            <q-select
              v-model="$q.lang.isoName"
              filled
              :options="localeOptions"
              clearable
              options-selected-class="text-deep-orange"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <nl ref="nlRef" v-if="scope.opt === 'nl'" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-if="scope.opt === 'nl'" caption>
                      {{ nlRef.variables.language }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <slot name="leftDrawerItems" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
export default {
  name: 'QStyledLayout'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'
import { nl } from '../flags'
export interface Props {
  title: string
}
const props = defineProps<Props>()
// const attrs = useAttrs();
// const emit = defineEmits<{
//   (
//     e: "asyncEmit",
//     {
//       value,
//       done,
//     }: {
//       value: string;
//       done: () => void;
//     }
//   ): void;
// }>();
const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const localeOptions = ref(['nl', 'en-US'])
const nlRef = ref<typeof nl>()
const leftDrawerOpen = ref(false)
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})
</script>
