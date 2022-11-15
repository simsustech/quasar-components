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

        <q-btn>
          <nl v-if="locale === 'nl'" />
          <en-us v-if="locale === 'en-US'" />
          <q-menu auto-close>
            <q-list>
              <q-item clickable @click="locale = 'nl'">
                <q-item-section avatar>
                  <nl ref="nlRef" />
                </q-item-section>
                <q-item-section>
                  {{ nlRef?.variables.language }}
                </q-item-section>
              </q-item>
              <q-item clickable @click="locale = 'en-US'">
                <q-item-section avatar>
                  <en-us ref="enUsRef" />
                </q-item-section>
                <q-item-section>
                  {{ enUsRef?.variables.language }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
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
import { authenticationRoutes } from "../router/routes.js";
const title = "Demo";

const $q = useQuasar();
const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const nlRef = ref<typeof nl>();
const enUsRef = ref<typeof enUs>();

const locale = ref($q.lang.isoName);

const langList = import.meta.glob("../../node_modules/quasar/lang/*.mjs");
watch(locale, (val) => {
  try {
    langList[`../../node_modules/quasar/lang/${val}.mjs`]().then((lang) => {
      $q.lang.set(lang.default);
    });
  } catch (err) {
    // Requested Quasar Language Pack does not exist,
    // let's not break the app, so catching error
  }
});
</script>
