<template>
  <email-change-stepper
    ref="emailChangeStepperRef"
    @requestOtp="requestOtp"
    @changeEmail="changeEmail"
    :input="inputProps"
  >
  </email-change-stepper>
</template>

<script setup lang="ts">
import { EmailChangeStepper } from "@simsustech/quasar-components/authentication";
import { ref } from "vue";
import { useQuasar } from "quasar";

const inputProps = ref({
  filled: true,
});

const $q = useQuasar();
if (!$q.dialog) throw new Error(`Please enable Quasar's Dialog plugin`);
const emailChangeStepperRef = ref<typeof EmailChangeStepper>();

const requestOtp: InstanceType<
  typeof EmailChangeStepper
>["$props"]["onRequestOtp"] = ({ email, done }) => {
  setTimeout(() => {
    console.log(email);
    done();
    emailChangeStepperRef.value?.functions.goToStep("changeEmail");
  }, 3000);
};

const changeEmail: InstanceType<
  typeof EmailChangeStepper
>["$props"]["onChangeEmail"] = ({ newEmail, done }) => {
  setTimeout(() => {
    console.log(`New email: ${newEmail}`);
    done();
    $q.dialog({
      message: emailChangeStepperRef.value?.variables.emailChanged,
    });
  }, 3000);
};
</script>
