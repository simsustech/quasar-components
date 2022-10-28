<template>
  <password-change-stepper
    ref="passwordChangeStepperRef"
    @requestOtp="requestOtp"
    @changePassword="changePassword"
    :input="inputProps"
  >
  </password-change-stepper>
</template>

<script setup lang="ts">
import { PasswordChangeStepper } from "@simsustech/quasar-components/authentication";
import { ref } from "vue";
import { useQuasar } from "quasar";

const inputProps = ref({
  filled: true,
});

const $q = useQuasar();
if (!$q.dialog) throw new Error(`Please enable Quasar's Dialog plugin`);
const passwordChangeStepperRef = ref<typeof PasswordChangeStepper>();

const requestOtp: InstanceType<
  typeof PasswordChangeStepper
>["$props"]["onRequestOtp"] = ({ email, done }) => {
  setTimeout(() => {
    console.log(email);
    done();
    passwordChangeStepperRef.value?.functions.goToStep("changePassword");
  }, 3000);
};

const changePassword: InstanceType<
  typeof PasswordChangeStepper
>["$props"]["onChangePassword"] = ({ email, newPassword, done }) => {
  setTimeout(() => {
    console.log(`New password: ${newPassword}`);
    done();
    $q.dialog({
      message: passwordChangeStepperRef.value?.variables.passwordChanged,
    });
  }, 3000);
};
</script>
