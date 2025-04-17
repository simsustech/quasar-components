<template>
  <q-list>
    <q-item v-for="scope in scopes" :key="scope.name">
      <q-item-section avatar>
        <q-icon color="green" :name="checkIcon" />
      </q-item-section>
      <q-item-section>
        {{ scope.name }}
      </q-item-section>
    </q-item>
    <q-item v-for="claim in claims" :key="claim.name">
      <q-item-section avatar>
        <q-icon color="green" :name="checkIcon" />
      </q-item-section>
      <q-item-section>
        {{ claim.name }}
      </q-item-section>
    </q-item>
    <q-item v-for="resourceScope in resourceScopes" :key="resourceScope.name">
      <q-item-section avatar>
        <q-icon color="green" :name="checkIcon" />
      </q-item-section>
      <q-item-section>
        {{ resourceScope.name }}
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'ConsentList'
}
</script>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  scopes: {
    name: string
  }[]
  claims?: {
    name: string
  }[]
  resourceScopes?: {
    name: string
  }[]
  icons?: {
    check: string
  }
}
const props = defineProps<Props>()

const { icons } = toRefs(props)

const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const message = computed(() => lang.value.consent.message)
const allow = computed(() => lang.value.consent.allow)
const deny = computed(() => lang.value.consent.deny)

const checkIcon = icons.value?.check ?? 'check'

const variables = ref({
  message,
  allow,
  deny
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})
</script>
