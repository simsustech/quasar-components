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
          :locales="languageLocales"
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
      <q-item-label header>Icons</q-item-label>
      <q-item clickable to="/icons">
        <q-item-label>Icons</q-item-label>
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, Ref, watch, inject } from 'vue'
import { useQuasar } from 'quasar'
import { QLanguageSelect } from '@simsustech/quasar-components'
import {
  authenticationRoutes,
  generalRoutes,
  formRoutes
} from '../router/routes.js'
const title = 'Demo'

const $q = useQuasar()
const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const locale = ref($q.lang.isoName)

const languageLocales = ref([
  {
    icon: 'i-flagpack-nl',
    bcp47: 'nl'
  },
  {
    icon: 'i-flagpack-us',
    bcp47: 'en-US'
  }
])

const quasarLang = import.meta.glob('../../node_modules/quasar/lang/*.js')
const languageImports = ref(
  Object.entries(quasarLang).reduce(
    (acc, [key, value]) => {
      const langKey = key.split('/').at(-1)?.split('.').at(0)
      if (langKey) acc[langKey] = value
      return acc
    },
    {} as Record<string, () => Promise<any>>
  )
)
</script>
