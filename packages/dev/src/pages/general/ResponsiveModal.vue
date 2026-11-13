<template>
  <q-btn label="Toggle" @click="toggle" />
  {{ opened }}
  <responsive-dialog v-model="opened"> </responsive-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'

const opened = ref(false)
const toggle = () => (opened.value = !opened.value)
</script>
