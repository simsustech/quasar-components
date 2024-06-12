<template>
  <q-page class="q-ma-md">
    <div style="margin-top: 80px">
      <slot name="default" />
    </div>
    <q-page-sticky expand position="top">
      <q-toolbar
        class="shadow-2"
        :class="{ 'bg-dark': $q.dark.isActive, 'bg-white': !$q.dark.isActive }"
      >
        <slot name="fab" />
        <q-btn
          v-if="type === 'create'"
          :disable="disabled"
          flat
          style="margin-bottom: -50px; z-index: 5"
          round
          size="lg"
          dense
          icon="add"
          class="q-mr-sm bg-primary text-white"
          @click="create"
        />
        <q-btn
          v-else-if="type === 'update'"
          :disable="disabled"
          flat
          style="margin-bottom: -50px; z-index: 5"
          round
          size="lg"
          dense
          icon="edit"
          class="q-mr-sm bg-primary text-white"
          @click="update"
        />
        <q-toolbar-title>
          <slot name="header" />
        </q-toolbar-title>
        <slot name="header-side" />
      </q-toolbar>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'ResourcePage'
}
</script>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  type?: 'create' | 'update'
  disabled?: boolean
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'create',
    {
      data,
      done
    }: {
      data?: unknown
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'update',
    {
      data,
      done
    }: {
      data?: unknown
      done: (success?: boolean) => void
    }
  ): void
}>()
const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const { type, disabled } = toRefs(props)

const done = () => ''
const create = (evt: unknown) =>
  disabled.value
    ? () => {
        //
      }
    : emit('create', { done })
const update = (evt: unknown) =>
  disabled.value
    ? () => {
        //
      }
    : emit('update', { done })

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
