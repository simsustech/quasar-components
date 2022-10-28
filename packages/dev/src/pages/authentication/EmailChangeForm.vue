<template>
  <q-card style="max-width: 400px">
    <q-card-section class="text-h6" v-if="form">
      {{ form.header }}
    </q-card-section>
    <q-card-section>
      <email-change-form
        ref="form"
        email="old@acme.com"
        @submit="submit"
        v-slot="slotProps"
      >
        <q-card-actions align="right">
          <q-submit-button @submit="slotProps.submit"></q-submit-button>
        </q-card-actions>
      </email-change-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { EmailChangeForm } from "@simsustech/quasar-components/authentication";
import { QSubmitButton } from "@simsustech/quasar-components";

const form = ref<typeof EmailChangeForm>();
const submit: InstanceType<typeof EmailChangeForm>["$props"]["onSubmit"] = (
  evt
) => {
  console.log(evt);
  setTimeout(() => evt.done(), 3000);
};

onMounted(() => {
  console.log(form.value);
});
</script>
