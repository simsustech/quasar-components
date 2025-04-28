<template>
  <div v-if="!showSticky">
    <q-btn
      v-if="busEmits.add && type === 'add'"
      id="fabAdd"
      class="gt-sm"
      fab
      :icon="addIcon"
      @click="bus.emit(busEmits.add)"
    />
    <q-btn
      v-if="busEmits.edit && type === 'edit'"
      id="fabEdit"
      class="gt-sm"
      fab
      :icon="editIcon"
      @click="bus.emit(busEmits.edit)"
    />
  </div>
  <q-page-sticky v-if="showSticky" position="bottom-right" :offset="[18, 18]">
    <q-btn
      v-if="busEmits.add && type === 'add'"
      class="lt-md"
      fab
      :icon="addIcon"
      @click="bus.emit(busEmits.add)"
    />
    <q-btn
      v-if="busEmits.edit && type === 'edit'"
      class="lt-md"
      fab
      :icon="editIcon"
      @click="bus.emit(busEmits.edit)"
    />
  </q-page-sticky>
</template>

<script lang="ts" setup>
import { EventBus } from 'quasar'
import { inject, toRefs } from 'vue'

interface Props {
  type?: 'add' | 'edit'
  showSticky?: boolean
  busEmits: {
    add?: string
    edit?: string
  }
  icons?: {
    add: string
    edit: string
  }
}
const props = defineProps<Props>()

const { type, icons } = toRefs(props)

if (!type.value) type.value = 'add'

const bus = inject<EventBus>('bus')
if (!bus)
  throw new Error(
    'Event bus not initialized (https://quasar.dev/quasar-utils/event-bus-util)'
  )

const addIcon = icons.value?.add ?? 'add'
const editIcon = icons.value?.edit ?? 'edit'
</script>
