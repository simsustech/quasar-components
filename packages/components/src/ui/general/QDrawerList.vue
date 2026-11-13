<template>
  <q-list class="q-drawer-list">
    <slot name="default" />
  </q-list>
</template>

<script setup lang="ts">
import { QList } from 'quasar'

// The doc-layout menu: primary-coloured section, indented bordered submenu,
// quieter toggle icons, and a tighter avatar in a `__deep-expansion` child.
// Every rule reaches Quasar's internals, and the items arrive through a slot, so
// they live in the preset's preflights keyed on this class — `--` cannot appear
// in an arbitrary variant without wind4 mangling it.
</script>
