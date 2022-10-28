<template>
  <q-styled-card :actions="actionsProps">
    <template #title>
      {{ header }}
    </template>
    <login-form
      ref="loginFormRef"
      password-forgot-url="/passwordchange"
      @submit="login"
    />
    <template #actions>
      <q-btn
        v-if="registerUrl"
        :label="createAccount"
        size="sm"
        flat
        :to="registerUrl"
      ></q-btn>
      <q-submit-button @submit="loginFormRef?.functions.submit" />
    </template>
  </q-styled-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { LoginForm } from "@simsustech/quasar-components/authentication";
import { QStyledCard, QSubmitButton } from "@simsustech/quasar-components";
import { QCardActionsProps } from "quasar";

const actionsProps = ref<QCardActionsProps>({
  align: "between",
});
const registerUrl = ref("register");
const loginFormRef = ref<typeof LoginForm>();
const header = computed(() => loginFormRef.value?.variables.header);
const createAccount = computed(
  () => loginFormRef.value?.variables.createAccount
);

const login: InstanceType<typeof LoginForm>["$props"]["onSubmit"] = ({
  email,
  password,
  done,
}) => {
  setTimeout(() => {
    console.log(`Email: ${email}, password: ${password}`);
    done();
  }, 3000);
};
</script>
