<template>
  {{ date }}
  <date-input v-model="date" style="max-width: 200px" />
  <date-input
    v-model="date"
    clearable
    format="DD-MM-YYYY"
    locale="nl"
    style="max-width: 200px"
  />
</template>

<script setup lang="ts">
import { DateInput } from "@simsustech/quasar-components/form";
import { ref } from "vue";

const date = ref(null);
</script>
