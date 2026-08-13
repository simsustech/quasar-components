<template>
  {{ date }}
  <div data-testid="date-input-plain">
    <date-input v-model="date" style="max-width: 250px" />
  </div>
  <div data-testid="date-input-required">
    <date-input
      ref="dateInputRef"
      v-model="date"
      clearable
      format="DD-MM-YYYY"
      locale="nl"
      style="max-width: 250px"
      required
    />
  </div>
  <div data-testid="date-input-clearable">
    <date-input
      v-model="date2"
      clearable
      format="DD-MM-YYYY"
      label="clearable-not-required"
      style="max-width: 250px"
    />
  </div>
  <div id="date2-value">{{ date2 }}</div>
</template>

<script setup lang="ts">
import { DateInput } from '@simsustech/quasar-components/form'
import { ref } from 'vue'

const date = ref('')
const date2 = ref<null | string>(null)
const dateInputRef = ref()
</script>
