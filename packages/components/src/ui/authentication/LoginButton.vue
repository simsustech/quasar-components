<template>
  <q-submit-button>
    <slot name="icon" />
    <div v-if="withNetwork">{{ lang.login.loginWith }} {{ withNetwork }}</div>
    <div v-else>{{ lang.login.login }}</div>
  </q-submit-button>
</template>

<script lang="ts">
export default {
  name: 'LoginButton'
}
</script>

<script setup lang="ts">
import { watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang/index.js'
import QSubmitButton from '../general/QSubmitButton.vue'

export interface Props {
  withNetwork?: string
}
defineProps<Props>()

const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})
</script>
