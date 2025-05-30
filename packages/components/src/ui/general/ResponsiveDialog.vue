<template>
  <q-dialog ref="dialogRef" :maximized="$q.screen.lt.md">
    <q-layout
      view="LHh lpR fff"
      container
      class="bg-light-surface dark:bg-dark-surface"
      style="min-width: 85vw"
    >
      <q-header
        class="bg-light-surface-container-high dark:bg-dark-surface-container-high"
      >
        <q-toolbar>
          <q-btn
            :icon="icons.close"
            class="text-light-on-surface dark:text-dark-on-surface"
            flat
            round
            dense
            @click="close"
          />
          <q-toolbar-title>
            <slot name="title" />
          </q-toolbar-title>
          <q-submit-button
            v-if="!display"
            flat
            class="text-light-primary dark:text-dark-primary"
            :type="buttonType"
            @submit="submit"
          ></q-submit-button>
        </q-toolbar>
      </q-header>

      <q-page-container style="margin-bottom: 50px">
        <q-page :padding="padding" class="q-pb-xl">
          <slot></slot>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script lang="ts">
export default {
  name: 'ResponsiveDialog'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { QDialog, useQuasar } from 'quasar'
import { useLang, loadLang } from './lang'
import QSubmitButton from './QSubmitButton.vue'

export interface Props {
  display?: boolean
  buttonType?: 'submit' | 'send'
  padding?: boolean
  icons?: {
    close: string
  }
}
withDefaults(defineProps<Props>(), {
  buttonType: 'submit',
  icons: () => ({
    close: 'close'
  })
})
// const attrs = useAttrs();
const emit = defineEmits<{
  (
    e: 'submit',
    {
      done
    }: {
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

const submit: InstanceType<typeof QSubmitButton>['$props']['onSubmit'] = (
  evt
) => {
  emit('submit', {
    done: (success = true) => {
      evt.done()
      if (success) dialogRef.value?.hide()
    }
  })
}
const dialogRef = ref<QDialog>()
const open = () => dialogRef.value?.show()
const close = () => dialogRef.value?.hide()
const toggle = () => dialogRef.value?.toggle()

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  open,
  close,
  toggle
})
defineExpose({
  variables,
  functions
})
</script>
