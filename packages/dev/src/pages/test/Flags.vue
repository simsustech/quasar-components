<template>
  <div class="q-gutter-md">
    <div>
      {{ nlCountry }}
      <nl ref="nlRef" />
      {{ nlLanguage }}
    </div>
    <en-us />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { nl, enUs } from "@simsustech/quasar-components/flags";

const nlRef = ref<typeof nl>();
const nlCountry = computed(() => nlRef.value?.variables.country);
const nlLanguage = computed(() => nlRef.value?.variables.language);
</script>
