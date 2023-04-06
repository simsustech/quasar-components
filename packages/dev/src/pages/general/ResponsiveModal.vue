<template>
  <q-btn label="Toggle" @click="toggle" />
  {{ opened }}
  <responsive-modal v-model="opened"> </responsive-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ResponsiveModal } from "@simsustech/quasar-components";

const opened = ref(false);
const toggle = () => (opened.value = !opened.value);
</script>
