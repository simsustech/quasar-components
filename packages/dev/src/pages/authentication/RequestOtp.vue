<template>
  <q-page>
    <q-card>
      <q-card-section class="text-h6" v-if="form">
        {{ form.header }}
      </q-card-section>
      <q-card-section>
        <request-otp-form
          ref="form"
          :card="cardProps"
          @submit="submit"
          v-slot="slotProps"
        >
          <q-submit-button @submit="slotProps.submit"></q-submit-button>
        </request-otp-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QSubmitButton } from "@simsustech/quasar-components";
import { RequestOtpForm } from "@simsustech/quasar-components/authentication";

const cardProps: InstanceType<typeof RequestOtpForm>["$props"]["card"] = {
  style: "max-width: 400px",
};

const form = ref<typeof RequestOtpForm>();
const submit: InstanceType<typeof RequestOtpForm>["$props"]["onSubmit"] = ({
  email,
  done,
}) => {
  setTimeout(() => {
    console.log(email);
    done();
  }, 3000);
};
</script>
