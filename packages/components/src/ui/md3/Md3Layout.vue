<template>
  <q-layout v-if="ready" view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-btn
          v-if="!miniState && !$q.screen.gt.sm"
          flat
          dense
          round
          aria-label="Menu"
          icon="i-mdi-menu"
          @click="toggleLeftDrawer()"
        >
        </q-btn>
        <slot name="header-toolbar" />
      </q-toolbar>
    </q-header>

    <q-drawer
      ref="drawerRef"
      :model-value="leftDrawerOpen"
      :width="drawerWidth"
      :mini-width="80"
      :mini="miniState"
      mini-to-overlay
      show-if-above
      :bordered="miniState"
      @hide="onDrawerHide"
      @update:model-value="toggleLeftDrawer"
    >
      <template #mini>
        <div
          :class="{
            column: true,
            'items-center': miniState,
            'pr-0': true
          }"
        >
          <div class="h-50px flex items-center justify-center">
            <q-btn
              flat
              dense
              round
              aria-label="Menu"
              icon="i-mdi-menu"
              @click="toggleLeftDrawer()"
            />
          </div>
          <div id="fabs" class="q-mb-md min-h-56px">
            <slot name="fabs" :show-sticky="false" />
          </div>

          <slot name="drawer-mini-navigation" />
        </div>
      </template>
      <div class="column fit no-wrap">
        <div
          class="row items-center no-wrap flex-none overflow-hidden min-w-0 q-px-sm min-h-48px"
        >
          <q-btn
            flat
            dense
            round
            size="sm"
            aria-label="Close"
            icon="i-mdi-menu-close"
            @click="toggleLeftDrawer(false)"
          />
          <slot name="drawer-header" />
        </div>
        <div class="col overflow-hidden min-h-0">
          <slot name="drawer" />
        </div>
      </div>
    </q-drawer>

    <!--
      Drawer scrim. QDrawer renders its own backdrop only when
      `belowBreakpoint` (see `ui/src/components/drawer/QDrawer.js` — the backdrop
      is pushed inside `if (belowBreakpoint.value)`), and its `overlay` prop only
      feeds `offset`, not the backdrop branch. Above the breakpoint, with the
      drawer expanded over the content, Quasar renders nothing to dim or dismiss
      behind it — that gap is this element.

      It wears Quasar's own `q-drawer__backdrop` class rather than restating a
      z-index: that class carries the drawer's backdrop tier (the preset emits it
      at 1499 !important inside ADR 0007's scale: floating content 1400, then side
      panel 1500 with its backdrop 1499, then marginals 2000, then menus and dialogs
      6000), so the scrim stands exactly where the backdrop it replaces would and
      follows the scale if the scale moves. The previous hardcoded 2500 sat above
      the drawer's own 1500, so the expanded drawer was *under* its own scrim and
      none of its items took clicks.

      Position and background stay inline: the scrim has to cover the viewport and
      dim regardless of which style entry is active.
    -->
    <div
      v-if="showScrim"
      class="fullscreen q-drawer__backdrop"
      aria-hidden="true"
      style="position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.32)"
      @click="toggleLeftDrawer(false)"
    />

    <q-footer class="h-80px lt-md">
      <slot name="footer" />
    </q-footer>

    <q-page-container>
      <!-- One h1 per routed page: the app fills this with the mapped route
           title (visually hidden unless a page renders its own). -->
      <slot name="heading" />
      <router-view />
      <slot name="fabs" :show-sticky="true" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'

import { QDrawer } from 'quasar'
import { onClickOutside } from '@vueuse/core'

interface Props {
  ready?: boolean
}

withDefaults(defineProps<Props>(), {
  ready: true
})

const $q = useQuasar()
const drawerRef = ref<QDrawer>()
const leftDrawerOpen = ref(false)
const miniState = ref(false)

const drawerWidth = computed(() => {
  return $q.screen.lt.sm ? 300 : 360
})

// MD3: when the rail is expanded on desktop, the drawer is a modal overlay
// covering the content — show a scrim behind it (Quasar only renders its own
// backdrop below the breakpoint)
const showScrim = computed(() => $q.screen.gt.sm && !miniState.value)

// Small screen: toggle leftDrawerOpen, large screen: toggle miniState
// Prevent unresponsiveness with screen changes and drawer opened
watch(
  () => $q.screen.height,
  () => {
    toggleLeftDrawer(false)
    if (!import.meta.env.SSR && $q.screen.gt.sm) {
      miniState.value = true
    } else {
      miniState.value = false
    }
  }
)

const toggleLeftDrawer = (val?: boolean) => {
  if (!$q.screen.gt.sm) {
    // Mobile: the drawer is a modal overlay; toggle it open/closed
    leftDrawerOpen.value = val ?? !leftDrawerOpen.value
    miniState.value = false
    return
  }
  // Desktop: the rail is always shown; the menu/close button toggles
  // between the collapsed rail and the expanded modal drawer
  leftDrawerOpen.value = true
  if (val === true) {
    miniState.value = false
  } else if (val === false) {
    miniState.value = true
  } else {
    miniState.value = !miniState.value
  }
}

const toggleMiniState = (val?: boolean) => {
  if ($q.screen.gt.sm) {
    leftDrawerOpen.value = true
    miniState.value = val ?? !miniState.value
  }
}

const onDrawerHide = () => {
  if (!import.meta.env.SSR && $q.screen.gt.sm) {
    miniState.value = true
    leftDrawerOpen.value = true
  }
}
onClickOutside(drawerRef, () => toggleMiniState(true))

onMounted(() => {
  if ($q.screen.gt.sm) {
    toggleMiniState(true)
  }
})
</script>
<style>
/* Quasar adds q-drawer--top-padding when a QHeader exists, but in overlay
   mode the drawer floats on top of the header — the padding pushes the close
   icon down ~188px. Override to keep the close icon at the very top. */
.q-drawer--on-top.q-drawer--top-padding .q-drawer__content {
  padding-top: 0 !important;
}
</style>
