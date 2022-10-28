<template>
  <q-styled-card :actions="actionsProps">
    <template #title>
      {{ header }}
    </template>
    <register-form
      ref="registerFormRef"
      :extra-fields="extraFields"
      @submit="register"
    />
    <verification-slider @verified="verify" />
    <template #actions>
      <q-btn
        v-if="passwordForgotUrl"
        :label="forgotPassword"
        size="sm"
        flat
        :to="passwordForgotUrl"
      ></q-btn>
      <q-submit-button
        @submit="registerFormRef?.functions.submit"
        :disabled="!verified"
      />
    </template>
  </q-styled-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { QStyledCard, QSubmitButton } from "@simsustech/quasar-components";
import {
  RegisterForm,
  VerificationSlider,
} from "@simsustech/quasar-components/authentication";
import { QCardActionsProps } from "quasar";

const actionsProps = ref<QCardActionsProps>({
  align: "between",
});
const extraFields: InstanceType<typeof RegisterForm>["$props"]["extraFields"] =
  [
    {
      label: "Phone number",
      name: "telephone",
    },
  ];
const passwordForgotUrl = ref("/passwordchange");
const registerFormRef = ref<typeof RegisterForm>();
const header = computed(() => registerFormRef.value?.variables.header);
const forgotPassword = computed(
  () => registerFormRef.value?.variables.forgotPassword
);
const verified = ref(false);
const verify = () => (verified.value = true);

const register: InstanceType<typeof RegisterForm>["$props"]["onSubmit"] = ({
  email,
  password,
  username,
  extraFields,
  done,
}) => {
  setTimeout(() => {
    console.log(`Email: ${email}, password: ${password}`);
    if (extraFields) console.log(extraFields["telephone"]);
    console.log(username);
    done();
  }, 3000);
};
</script>
