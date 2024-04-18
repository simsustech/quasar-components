<template>
  {{ date }}
  <date-input v-model="date" style="max-width: 250px" />
  <date-input
    ref="dateInputRef"
    v-model="date"
    clearable
    format="DD-MM-YYYY"
    locale="nl"
    style="max-width: 250px"
    required
  />
</template>

<script setup lang="ts">
import { DateInput } from "@simsustech/quasar-components/form";
import { ref } from "vue";

const date = ref("");
const dateInputRef = ref();
</script>
