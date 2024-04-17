<template>
  <q-list class="q-drawer-list">
    <slot name="default" />
  </q-list>
</template>

<script setup lang="ts">
import { QList } from 'quasar'
</script>

<style lang="sass">
/* https://github.com/quasarframework/quasar/blob/dev/docs/src/layouts/doc-layout/DocPageMenu.sass */
.q-drawer-list
  .q-item__section--avatar
    color: var(--q-primary)
    min-width: 28px
    padding-right: 12px

  .q-expansion-item__content
    margin-left: 18px
    padding-left: 4px
    border-left: 1px solid rgba(0, 0, 0, .50)

    .q-expansion-item__content
      margin-left: 26px
      padding-left: 2px !important
      .q-item
        padding-left: 16px !important
        margin-left: 2px

  .q-expansion-item__toggle-icon
    color: #bdbdbd

  .q-expansion-item--expanded > div > .q-item
    > .q-item__section--main
      color: var(--q-primary)
    > .q-item__section--side .q-expansion-item__toggle-icon
      color: var(--q-primary)

  &__deep-expansion > .q-expansion-item__container > .q-item
    .q-item__section--avatar
      min-width: 16px
      padding-left: 8px
      padding-right: 0
</style>
