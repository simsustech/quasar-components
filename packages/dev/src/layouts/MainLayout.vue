<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>{{ title }}</q-toolbar-title>

        <q-language-select
          v-model="locale"
          :language-imports="languageImports"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>General</q-item-label>
        <q-item
          v-for="route in generalRoutes"
          clickable
          :to="'/general/' + route.path"
        >
          <q-item-label>
            {{ route.name }}
          </q-item-label>
        </q-item>
        <q-item-label header>Authentication</q-item-label>
        <q-item
          v-for="route in authenticationRoutes"
          clickable
          :to="'/authentication/' + route.path"
        >
          <q-item-label>
            {{ route.name }}
          </q-item-label>
        </q-item>
        <q-item-label header>Form</q-item-label>
        <q-item
          v-for="route in formRoutes"
          clickable
          :to="'/form/' + route.path"
        >
          <q-item-label>
            {{ route.name }}
          </q-item-label>
        </q-item>
      </q-list>
      <q-item-label header>Flags</q-item-label>
      <q-item clickable to="/flags">
        <q-item-label>Flags</q-item-label>
      </q-item>
      <q-item-label header>Icons</q-item-label>
      <q-item clickable to="/icons">
        <q-item-label>Icons</q-item-label>
      </q-item>
    </q-drawer>

    <q-page-container>
      <!-- <q-select
        v-model="locale"
        show-value
        :options="langOptions"
        label="Language"
      />
      <q-list>
        <q-item clickable @click="locale = 'nl'">
          <q-item-section avatar>
            <nl ref="nlRef" />
          </q-item-section>
          <q-item-section v-if="nlRef">
            {{ nlRef.variables.language }}
          </q-item-section>
        </q-item>
        <q-item clickable @click="locale = 'en-US'">
          <q-item-section avatar>
            <en-us ref="enUsRef" />
          </q-item-section>
          <q-item-section v-if="enUsRef">
            {{ enUsRef.variables.language }}
          </q-item-section>
        </q-item>
      </q-list> -->
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, Ref, watch, inject } from "vue";
import { useQuasar } from "quasar";
import { nl, enUs } from "@simsustech/quasar-components/flags";
import { QLanguageSelect } from "@simsustech/quasar-components";
import {
  authenticationRoutes,
  generalRoutes,
  formRoutes,
} from "../router/routes.js";
const title = "Demo";

const $q = useQuasar();
const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const nlRef = ref<typeof nl>();
const enUsRef = ref<typeof enUs>();

const locale = ref($q.lang.isoName);

const quasarLang = import.meta.glob("../../node_modules/quasar/lang/*.mjs");
const languageImports = ref(
  Object.entries(quasarLang).reduce(
    (acc, [key, value]) => {
      const langKey = key.split("/").at(-1)?.split(".").at(0);
      if (langKey) acc[langKey] = value;
      return acc;
    },
    {} as Record<string, () => Promise<any>>
  )
);
</script>
