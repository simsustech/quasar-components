<template>
  <q-layout view="lHh Lpr lFf">
    <div v-show="ready">
      <q-header>
        <q-toolbar>
          <q-btn
            v-if="!miniState"
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
        show-if-above
        bordered
        @hide="onDrawerHide"
        @update:model-value="toggleLeftDrawer"
        @mouseleave="debouncedToggleMiniState(true)"
      >
        <template #mini>
          <div
            :class="{
              column: true,
              'items-center': miniState,
              'pr-0': true
            }"
          >
            <q-btn
              flat
              dense
              round
              aria-label="Menu"
              icon="i-mdi-menu"
              class="q-mb-md"
              @click="toggleLeftDrawer()"
            >
            </q-btn>
            <div id="fabs" class="q-mb-md min-h-56px">
              <slot name="fabs" :show-sticky="false" />
            </div>

            <slot name="drawer-mini-navigation" />
          </div>
        </template>
        <slot name="drawer" />
      </q-drawer>

      <q-footer class="h-80px lt-md">
        <slot name="footer" />
      </q-footer>

      <q-page-container>
        <router-view />
        <slot name="fabs" :show-sticky="true" />
      </q-page-container>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { debounce, useQuasar } from 'quasar'

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
  leftDrawerOpen.value = val ?? $q.screen.gt.sm
  if (!import.meta.env.SSR && $q.screen.gt.sm) {
    leftDrawerOpen.value = val ?? $q.screen.gt.sm
    miniState.value = !miniState.value
  } else {
    leftDrawerOpen.value = val ?? !leftDrawerOpen.value
    miniState.value = false
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
const debouncedToggleMiniState = debounce(toggleMiniState, 500)

onClickOutside(drawerRef, () => toggleMiniState(true))

onMounted(() => {
  if ($q.screen.gt.sm) {
    toggleMiniState(true)
  }
})
</script>
