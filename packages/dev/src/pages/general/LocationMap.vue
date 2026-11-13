<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-md q-mb-md">
      <q-btn-toggle
        v-model="basemap"
        data-testid="location-basemap"
        no-caps
        unelevated
        toggle-color="primary"
        :options="basemapOptions"
      />
      <span class="text-caption">{{ basemapCaption }}</span>
    </div>

    <QLocation
      v-model="value"
      :center="center"
      :pmtiles-url="basemap === 'pmtiles' ? DEFAULT_PMTILES_URL : ''"
      :worker-url="workerUrl"
      height="60vh"
      @ready="onReady"
      @error="onError"
    />

    <h6 class="q-mt-md q-mb-xs">Model</h6>
    <pre data-testid="location-model">{{ JSON.stringify(value, null, 2) }}</pre>
    <div class="text-caption" data-testid="location-view">{{ view }}</div>
    <div v-if="error" class="text-negative" data-testid="location-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { QBtnToggle } from 'quasar'
import {
  QLocation,
  DEFAULT_PMTILES_URL
} from '@simsustech/quasar-components/location'
import type { LocationValue } from '@simsustech/quasar-components/location'
// MapLibre 6 resolves its worker from `import.meta.url`, which a bundled chunk
// cannot point at, so the URL is handed to it through `workerUrl` (D11). The
// import is by package name: this app declares `maplibre-gl` itself, where it
// used to reach into the kit's copy through node_modules.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

interface MapHandle {
  jumpTo: (options: { center: [number, number]; zoom: number }) => void
  getCenter: () => { lng: number; lat: number }
  getZoom: () => number
  on: (event: string, handler: () => void) => void
}

const AMSTERDAM = { lng: 4.8952, lat: 52.3702 }
const FLORENCE = { lng: 11.2558, lat: 43.7696 }
/** The kit's consumers work in NL/BE, which is what `?nopin` is measured on. */
const SERVICE_AREA = { lng: 5.2, lat: 51.6 }

const route = useRoute()

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const lng = toNumber(route.query.lng)
const lat = toNumber(route.query.lat)
/** `?nopin` mounts the component with nothing pinned, so it draws `center`. */
const noPin = 'nopin' in route.query

const value = ref<LocationValue | null>(
  noPin
    ? null
    : lng !== null && lat !== null
      ? { lng, lat, zoom: 15 }
      : { ...AMSTERDAM, zoom: 13 }
)

const center = noPin ? SERVICE_AREA : undefined

const basemap = ref<'openfreemap' | 'pmtiles'>('openfreemap')
const basemapCaption = computed(() =>
  basemap.value === 'pmtiles'
    ? 'Protomaps over a PMTiles archive'
    : 'OpenFreeMap style'
)

const basemapOptions = [
  { label: 'OpenFreeMap', value: 'openfreemap' },
  { label: 'PMTiles (Florence)', value: 'pmtiles' }
]

const error = ref('')
const view = ref('')
let map: MapHandle | null = null

const recordView = () => {
  if (!map) return
  const at = map.getCenter()
  view.value = `${at.lng.toFixed(4)}, ${at.lat.toFixed(4)} @ ${map.getZoom().toFixed(2)}`
}

const onReady = (instance: MapHandle) => {
  map = instance
  recordView()
  instance.on('moveend', recordView)
}

const onError = (caught: Error) => {
  error.value = caught.message
}

// The PMTiles sample only covers Florence, so switching to it also moves the
// view: the same component instance, a different basemap and centre.
watch(basemap, (next) => {
  const at = next === 'pmtiles' ? FLORENCE : AMSTERDAM
  value.value = { ...at, zoom: 13 }
  map?.jumpTo({ center: [at.lng, at.lat], zoom: 13 })
})
</script>
