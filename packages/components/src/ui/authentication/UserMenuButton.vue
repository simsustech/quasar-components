<template>
  <q-btn :icon="personIcon">
    <q-menu>
      <q-list>
        <q-item :to="userRoute">
          <q-item-section>{{ lang.myAccount }}</q-item-section>
        </q-item>
        <slot name="default" />
        <q-item clickable @click="emit('signOut')">
          <q-item-section>{{ lang.signOut }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
export default {
  name: 'UserMenuButton'
}
</script>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'
import type { RouteLocationRaw } from 'vue-router'

export interface Props {
  userRoute: RouteLocationRaw
  icons?: {
    person: string
  }
}
const props = defineProps<Props>()
const { icons } = toRefs(props)
// const attrs = useAttrs();
const emit = defineEmits<{
  (e: 'signOut'): void
}>()
const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const personIcon = icons.value?.person ?? 'person'

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
