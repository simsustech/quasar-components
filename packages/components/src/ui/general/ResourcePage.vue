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
        <div v-if="topBarFab">
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
        </div>
        <q-toolbar-title :shrink="topBarShrink">
          <slot name="header" />
        </q-toolbar-title>
        <div v-if="!topBarFab">
          <slot name="top-bar-buttons" />
          <q-btn
            v-if="type === 'create'"
            :disable="disabled"
            :label="lang.add"
            icon="add"
            outline
            @click="create"
          />
          <q-btn
            v-else-if="type === 'update'"
            :disable="disabled"
            :label="lang.edit"
            icon="edit"
            outline
            @click="update"
          />
        </div>
        <q-space horizontal />
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
import { toRefs, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'

export interface Props {
  type?: 'create' | 'update'
  disabled?: boolean
  topBarFab?: boolean
  topBarShrink?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  type: undefined,
  disabled: false,
  topBarFab: false,
  topBarShrink: true
})

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
const create = (evt: unknown) => emit('create', { done })
const update = (evt: unknown) => emit('update', { done })
</script>
