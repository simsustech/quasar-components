<template>
  <div class="q-gutter-md">
    <login-button
      @click="loginWithMicrosoft"
      :withNetwork="microsoftRef?.variables.name"
    >
      <template #icon>
        <microsoft size="xl" ref="microsoftRef" />
      </template>
    </login-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { microsoft } from "@simsustech/quasar-components/icons";
import { LoginButton } from "@simsustech/quasar-components/authentication";
const microsoftRef = ref<typeof microsoft>();
const loginWithMicrosoft = () => console.log("Login with Microsoft");
</script>
