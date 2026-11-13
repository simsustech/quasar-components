<template>
  <div class="q-location">
    <QLocationAddress
      v-if="address"
      class="q-location__address"
      data-testid="location-address"
      :model-value="localAddress"
      :location="modelValue"
      :geocoder="effectiveGeocoder"
      :language="language"
      :readonly="readonly"
      :required="required"
      @update:model-value="onAddressUpdate"
      @select="onSelect"
    />

    <q-expansion-item
      v-model="mapOpen"
      class="q-location__expand"
      data-testid="location-expand"
      :label="lang.location.map"
      dense
      dense-toggle
      @update:model-value="onMapToggle"
    >
      <div
        v-if="mapMounted"
        ref="container"
        class="q-location__map"
        :style="{ height }"
        data-testid="location-map"
      >
        <div
          v-if="!ready"
          class="q-location__canvas-placeholder"
          data-testid="location-canvas-placeholder"
        >
          <q-spinner v-if="!failed" color="primary" size="32px" />
          <span
            v-else
            role="alert"
            class="q-location__canvas-placeholder--error"
          >
            {{ lang.location.mapFailed }}
          </span>
        </div>

        <QLocationSearch
          v-if="search"
          class="q-location__search"
          data-testid="location-search"
          :geocoder="effectiveGeocoder"
          :language="language"
          :readonly="readonly"
          @select="onSelect"
        />

        <div
          v-if="bubble"
          class="q-location__bubble"
          data-testid="location-bubble"
          role="status"
          aria-live="polite"
          :style="pointStyle(bubblePoint)"
        >
          <span class="q-location__bubble-text">{{ bubble }}</span>
          <button
            type="button"
            class="q-location__bubble-close"
            data-testid="location-bubble-close"
            :aria-label="lang.location.closeAddress"
            @click.stop="closeBubble"
          >
            ×
          </button>
        </div>

        <div
          v-if="attribution !== false"
          class="q-location__attribution"
          data-testid="location-attribution"
          role="group"
          :aria-label="lang.location.attribution"
        >
          <template v-if="attributionText">{{ attributionText }}</template>
          <template v-else-if="pmtilesUrl">
            <a
              href="https://protomaps.com"
              target="_blank"
              rel="noopener noreferrer"
              >Protomaps</a
            >
            <span aria-hidden="true">·</span>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              >© OpenStreetMap contributors</a
            >
          </template>
          <template v-else>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              >© OpenStreetMap contributors</a
            >
            <span aria-hidden="true">·</span>
            <a
              href="https://openmaptiles.org"
              target="_blank"
              rel="noopener noreferrer"
              >OpenMapTiles</a
            >
            <span aria-hidden="true">·</span>
            <a
              href="https://openfreemap.org"
              target="_blank"
              rel="noopener noreferrer"
              >OpenFreeMap</a
            >
          </template>
        </div>

        <div class="q-location__anchor" :style="pointStyle(anchorPoint)">
          <q-menu
            v-model="menuOpen"
            anchor="top left"
            self="top left"
            :offset="[0, 0]"
          >
            <q-list dense class="q-location__menu">
              <q-item
                v-if="!readonly"
                clickable
                v-close-popup
                @click="whatsHere"
              >
                <q-item-section>{{ lang.location.whatsHere }}</q-item-section>
              </q-item>
              <q-item
                v-if="!readonly"
                clickable
                v-close-popup
                @click="movePinHere"
              >
                <q-item-section>{{ lang.location.movePinHere }}</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="centerHere">
                <q-item-section>{{ lang.location.centerHere }}</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="copyCoordinates">
                <q-item-section>{{
                  lang.location.copyCoordinates
                }}</q-item-section>
              </q-item>
              <q-item
                v-if="!readonly"
                clickable
                v-close-popup
                :disable="pin === null"
                @click="clearPin"
              >
                <q-item-section>{{ lang.location.clearPin }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  QExpansionItem,
  QItem,
  QItemSection,
  QList,
  QMenu,
  QSpinner,
  useQuasar
} from 'quasar'
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl
} from 'maplibre-gl'
import type { MapMouseEvent, StyleSpecification } from 'maplibre-gl'
import { useLang, loadLang } from './lang'
import QLocationAddress from './QLocationAddress.vue'
import QLocationSearch from './QLocationSearch.vue'
import { createPhotonGeocoder, roundLngLat } from './geocoder'
import { useGeocoder } from './useGeocoder'
import type {
  GeocodeResult,
  Geocoder,
  LngLat,
  LocationAddress,
  LocationValue
} from './types'

export interface Props {
  modelValue?: LocationValue | null
  height?: string
  /** The view when there is no pin; `zoom` applies to it. */
  center?: LngLat
  zoom?: number
  styleUrl?: string
  /** A PMTiles archive URL; when set it wins over `styleUrl`. */
  pmtilesUrl?: string
  flavor?: string
  /** A ready-made style; overrides both `styleUrl` and `pmtilesUrl`. */
  style?: StyleSpecification
  /** `null` tears the map off the network entirely. */
  geocoder?: Geocoder | null
  workerUrl?: string
  search?: boolean
  address?: boolean
  contextMenu?: boolean
  /**
   * `undefined` draws the credit each source's licence requires, `false` hides
   * it (which makes the consumer responsible for the credit), and a string is
   * rendered as the visible credit instead of the per-source default.
   */
  attribution?: string | false
  readonly?: boolean
  language?: string
  /** Marks the address panel's street, house number, postal code and city required. */
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  height: '400px',
  center: undefined,
  zoom: 13,
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  pmtilesUrl: '',
  flavor: 'light',
  style: undefined,
  geocoder: undefined,
  workerUrl: '',
  search: true,
  address: true,
  contextMenu: true,
  attribution: undefined,
  readonly: false,
  language: 'en',
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: LocationValue | null): void
  (e: 'update:address', value: LocationAddress): void
  (e: 'ready', map: MapLibreMap): void
  (e: 'moveend', value: LocationValue): void
  (e: 'select', value: GeocodeResult): void
  (e: 'reverse', value: LocationAddress): void
  (e: 'error', value: Error): void
}>()

const $q = useQuasar()
const lang = useLang()
// The language store is module-wide, so every entry into the module keeps it in
// step with Quasar's own language — the same activation `QStyledCard` uses.
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

const container = ref<HTMLElement | null>(null)
/** Collapsed by default: the address card is the question, the map confirms it. */
const mapOpen = ref(false)
/** Set on the first open and never cleared, so collapsing keeps the tiles. */
const mapMounted = ref(false)
const ready = ref(false)
const failed = ref(false)
const pin = ref<LngLat | null>(
  props.modelValue
    ? { lng: props.modelValue.lng, lat: props.modelValue.lat }
    : null
)
const localAddress = ref<LocationAddress | undefined>(props.modelValue?.address)

const menuOpen = ref(false)
const anchorPoint = ref({ x: 0, y: 0 })

/**
 * The address as one line, the way the parts are read aloud: `Dorpsstraat 12,
 * 5504 Veldhoven`. It is both the text of the bubble and the query the card's
 * echo is compared against, so the two can never drift.
 */
const composeAddress = (address: LocationAddress) => {
  const kept = (parts: (string | undefined)[]) =>
    parts.filter((part) => part?.trim()).join(' ')
  return [
    kept([address.street, address.houseNumber]),
    kept([address.postalCode, address.city])
  ]
    .filter(Boolean)
    .join(', ')
}

/**
 * What the bubble says: `formatted` is already a sentence when the geocoder
 * supplied one, and the parts joined are the fallback for one that did not.
 */
const bubbleText = computed(() => {
  const found = localAddress.value
  if (!found) return ''
  return found.formatted?.trim() || composeAddress(found)
})

// A dismissal is about one position, so a new address or a moved pin reopens it.
const bubbleClosed = ref(false)
/**
 * The position `localAddress` was resolved for. The pin moves before its address
 * arrives, so without this the previous address would hang over the new pin for
 * the length of a network round trip.
 */
const addressAt = ref<LngLat | null>(
  props.modelValue?.address && pin.value ? { ...pin.value } : null
)

const bubble = computed(() => {
  const current = pin.value
  const resolvedAt = addressAt.value
  if (!props.address || current === null || resolvedAt === null) return ''
  if (resolvedAt.lng !== current.lng || resolvedAt.lat !== current.lat)
    return ''
  return bubbleClosed.value ? '' : bubbleText.value
})

const bubblePoint = ref({ x: 0, y: 0 })

/** A projected point as the inline position both overlays are placed with. */
const pointStyle = (point: { x: number; y: number }) => ({
  left: `${point.x}px`,
  top: `${point.y}px`
})

const closeBubble = () => {
  bubbleClosed.value = true
}

const contextPoint = ref<LngLat | null>(null)

let map: MapLibreMap | null = null
let marker: Marker | null = null
let observer: ResizeObserver | null = null

/**
 * Projects the pin into container pixels. Driven by MapLibre's `render`, which
 * fires for pan, zoom and easing — a ResizeObserver does not see any of them.
 */
const projectBubble = () => {
  if (!map || pin.value === null) return
  const point = map.project([pin.value.lng, pin.value.lat])
  // The marker is anchored at its tip, so the pin's head is its own height above
  // the projected point: lift the bubble over it instead of onto it.
  const lift = (marker?.getElement().offsetHeight ?? 0) + 8
  bubblePoint.value = { x: point.x, y: point.y - lift }
}

watch([pin, bubbleText], () => {
  bubbleClosed.value = false
  void nextTick(projectBubble)
})

// An "absent prop" means "use Photon in this component's language"; `null` is
// the explicit opt-out. Building it here (rather than as a prop default) is what
// makes the `language` prop reach the geocoder at all.
const effectiveGeocoder = computed<Geocoder | null>(() =>
  props.geocoder === undefined
    ? createPhotonGeocoder({ language: props.language })
    : props.geocoder
)

// `search` is also a prop name, so the forward lookup keeps its own name.
const { reverse, search: searchAddress } = useGeocoder(effectiveGeocoder)

const attributionText = computed(() =>
  typeof props.attribution === 'string' ? props.attribution : ''
)

const reportError = (value: unknown) => {
  emit('error', value instanceof Error ? value : new Error(String(value)))
}

/**
 * The archive reader and the basemap layers are their own chunk (plan §3), so a
 * consumer that never sets `pmtilesUrl` does not download them at all.
 */
const pmtilesStyle = async (): Promise<StyleSpecification> => {
  const { registerPmtilesProtocol, protomapsStyle } = await import('./pmtiles')
  // The protocol has to be registered before the style asks for a tile, not
  // when the first tile arrives.
  registerPmtilesProtocol()
  return protomapsStyle({
    pmtilesUrl: props.pmtilesUrl,
    flavor: props.flavor,
    lang: props.language
  })
}

const resolveStyle = async (): Promise<StyleSpecification | string> => {
  if (props.style) return props.style
  if (props.pmtilesUrl) return pmtilesStyle()
  return props.styleUrl
}

/**
 * The zoom this component last knew, so a value emitted from a *card* edit does
 * not carry the stale zoom from the prop it is about to replace: the echo of an
 * address that arrived with `zoom: 16` used to put the parent back to 13.
 */
const viewZoom = ref<number>(props.modelValue?.zoom ?? props.zoom)

const toValue = (
  at: LngLat,
  address?: LocationAddress,
  zoom = viewZoom.value
): LocationValue => ({ lng: at.lng, lat: at.lat, zoom, address })

const syncMarker = () => {
  if (!map) return
  if (pin.value === null) {
    marker?.remove()
    marker = null
    return
  }
  if (marker === null) {
    marker = new Marker({ draggable: !props.readonly, color: '#000' })
      .setLngLat([pin.value.lng, pin.value.lat])
      .addTo(map)
    marker.on('dragend', onDragEnd)
    return
  }
  marker.setLngLat([pin.value.lng, pin.value.lat])
}

/** The last address this component resolved, so its echo is not read as typing. */
const resolvedQuery = ref('')

const applyAddress = (at: LngLat, address: LocationAddress) => {
  localAddress.value = address
  resolvedQuery.value = composeAddress(address)
  addressAt.value = { ...at }
  emit('update:address', address)
  emit('update:modelValue', toValue(at, address))
  emit('reverse', address)
}

/**
 * Moves the pin. The position goes out first and the address second: the
 * reverse geocode is a network round trip, and a consumer that waits for it
 * before showing the pin makes a drag feel broken.
 *
 * Only the newest move may report an outcome. `useGeocoder.reverse` aborts the
 * request before it, and an abort resolves `null` exactly like a lookup that
 * found nothing — so without this sequence number a second drag paints
 * "address lookup failed" for work that was superseded on purpose.
 */
let reverseSeq = 0

const placePin = async (at: LngLat, geocode: boolean) => {
  const rounded = roundLngLat(at)
  // Every move takes a new sequence number, including the ones that ask for no
  // lookup: a `movePinHere` or a cleared pin must also invalidate a reverse
  // geocode that is still in flight for the position it just left.
  const seq = ++reverseSeq
  pin.value = rounded
  // The old address belongs to the old position, whatever happens next.
  addressAt.value = null
  syncMarker()
  emit('update:modelValue', toValue(rounded))

  if (!geocode) return
  const found = await reverse(rounded)
  if (seq !== reverseSeq) return
  if (!found) {
    // The pin has already moved, so returning silently would leave a stale
    // address beside it: say the lookup failed instead of showing an old one.
    const message = lang.value.location.geocodeFailed
    reportError(new Error(message))
    $q.notify({ type: 'negative', message })
    return
  }
  applyAddress(rounded, found.address)
}

const onDragEnd = () => {
  if (!marker) return
  const { lng, lat } = marker.getLngLat()
  void placePin({ lng, lat }, true)
}

/**
 * Puts the pin on a position that is already known, without a reverse geocode:
 * the address came *with* the coordinates, so asking for it again would only
 * cost a round trip and could land a slightly different address on the card.
 */
const placeAt = (at: LngLat, address?: LocationAddress, zoom?: number) => {
  const rounded = roundLngLat(at)
  // A reverse geocode in flight belongs to the position the pin just left.
  reverseSeq += 1
  pin.value = rounded
  addressAt.value = { ...rounded }
  syncMarker()
  if (zoom !== undefined) viewZoom.value = zoom
  if (map)
    map.flyTo({
      center: [rounded.lng, rounded.lat],
      zoom: zoom ?? map.getZoom()
    })
  if (address) {
    localAddress.value = address
    resolvedQuery.value = composeAddress(address)
    emit('update:address', address)
  }
  // `viewZoom` above took the requested zoom, so the value below carries it.
  emit('update:modelValue', toValue(rounded, address ?? localAddress.value))
}

/**
 * A suggestion picked in the card or in the map's search: the pin follows it.
 * The card resolves a street to coordinates, so entering an address and pointing
 * at the map are the same act — without this the card filled in and the pin
 * stayed where it was (or never appeared at all).
 */
const onSelect = (result: GeocodeResult) => {
  if (props.readonly) return
  placeAt(
    { lng: result.lng, lat: result.lat },
    result.address,
    Math.max(props.zoom, 16)
  )
  emit('select', result)
}

/**
 * Photon answers `Dorpsstraat 99, 5504 Veldhoven` with the street's centroid
 * first and the house numbers after it, so taking `found[0]` put the pin on the
 * street for every number in it: editing the number moved nothing and the
 * distance stayed put. Prefer the first result that carries the number asked
 * for, and fall back to the first answer when none does.
 */
const pickResult = (found: GeocodeResult[], address: LocationAddress) => {
  const wanted = address.houseNumber?.trim()
  if (wanted) {
    const exact = found.find(
      (result) => result.address?.houseNumber?.trim() === wanted
    )
    if (exact) return exact
  }
  return found[0]
}

/**
 * An address typed into the card is a location, not just text: once it names a
 * street and a postcode or city, it is forward geocoded and the pin moves.
 *
 * `search` is debounced and cancels the query before it, so typing a postcode
 * sends one request, not four. An address this component resolved itself comes
 * back through here unchanged, and is skipped — otherwise every pin move would
 * geocode the address it had just reverse geocoded, and nudge the pin.
 */
const onAddressUpdate = (address: LocationAddress) => {
  localAddress.value = address
  addressAt.value = pin.value ? { ...pin.value } : null
  emit('update:address', address)
  if (pin.value !== null) emit('update:modelValue', toValue(pin.value, address))

  const query = composeAddress(address)
  if (query === '' || query === resolvedQuery.value) return
  if (!address.street?.trim()) return
  if (!address.postalCode?.trim() && !address.city?.trim()) return

  void searchAddress(query).then((found) => {
    const first = pickResult(found, address)
    if (!first || props.readonly) return
    if (composeAddress(localAddress.value ?? {}) !== query) return
    placeAt(
      { lng: first.lng, lat: first.lat },
      address,
      Math.max(props.zoom, 16)
    )
  })
}

// Any click that dismisses the menu also lands on the canvas and would move the
// pin. MapLibre does not report the click as a dismissal, so a short window
// after a menu close swallows exactly that click. Item clicks do not need it:
// they never reach the canvas, and their handlers disarm the window again.
let ignoreClickUntil = 0
let menuActionTaken = false

// QMenu closes on the document's `mousedown` (Quasar's click-outside listener),
// which is before MapLibre's `click` on mouseup, and the model update lands
// synchronously — so the window is armed before the click that caused it.
watch(menuOpen, (open) => {
  if (open) {
    menuActionTaken = false
    return
  }
  if (menuActionTaken) return
  ignoreClickUntil = Date.now() + 300
})

const menuActed = () => {
  menuActionTaken = true
  ignoreClickUntil = 0
}

const openMenu = async (event: MapMouseEvent) => {
  // `contextMenu: false` leaves the browser its own menu, so neither the event
  // nor the native menu is touched.
  if (!props.contextMenu) return
  // Right-click on a touch device is a long press; either way the native
  // context menu must not cover ours.
  event.preventDefault()
  contextPoint.value = {
    lng: event.lngLat.lng,
    lat: event.lngLat.lat
  }
  anchorPoint.value = { x: event.point.x, y: event.point.y }
  menuActionTaken = false
  // The anchor div is positioned by the patch above; QMenu measures it on show.
  await nextTick()
  menuOpen.value = true
}

const whatsHere = () => {
  menuActed()
  if (!contextPoint.value) return
  void placePin(contextPoint.value, true)
}

const movePinHere = () => {
  menuActed()
  if (!contextPoint.value) return
  void placePin(contextPoint.value, false)
}

const centerHere = () => {
  menuActed()
  if (!contextPoint.value || !map) return
  map.panTo([contextPoint.value.lng, contextPoint.value.lat])
}

const copyCoordinates = async () => {
  menuActed()
  if (!contextPoint.value) return
  const label = `${contextPoint.value.lat}, ${contextPoint.value.lng}`
  try {
    await navigator.clipboard.writeText(label)
    $q.notify(lang.value.location.coordinatesCopied)
  } catch (caught) {
    // Denied permission, or a non-secure context where the API is missing.
    reportError(caught)
    $q.notify({ type: 'negative', message: lang.value.location.copyFailed })
  }
}

const clearPin = () => {
  menuActed()
  // A lookup in flight would otherwise land its address on a pin that is gone.
  reverseSeq += 1
  pin.value = null
  addressAt.value = null
  localAddress.value = {}
  syncMarker()
  emit('update:address', {})
  emit('update:modelValue', null)
}

const onMapClick = (event: MapMouseEvent) => {
  if (props.readonly) return
  if (Date.now() < ignoreClickUntil) {
    ignoreClickUntil = 0
    return
  }
  void placePin({ lng: event.lngLat.lng, lat: event.lngLat.lat }, true)
}

const onMoveEnd = () => {
  if (!map) return
  const center = map.getCenter()
  viewZoom.value = map.getZoom()
  emit('moveend', {
    lng: center.lng,
    lat: center.lat,
    zoom: map.getZoom()
  })
}

const onMapError = (event: { error?: unknown }) => {
  reportError(event?.error)
  // Tile and sprite failures are transient; a style that never loaded leaves an
  // empty grey box, which has to be said out loud instead.
  if (map && !map.isStyleLoaded()) failed.value = true
}

const mount = async () => {
  const element = container.value
  if (!element) return

  try {
    if (props.workerUrl) setWorkerUrl(props.workerUrl)

    const style = await resolveStyle()
    // Unmounted while the PMTiles chunk was in flight.
    if (container.value !== element) return

    // Without a pin the view is the caller's `center`, or the world: a
    // zoomed-in view over nothing shows ocean.
    const center: [number, number] = pin.value
      ? [pin.value.lng, pin.value.lat]
      : props.center
        ? [props.center.lng, props.center.lat]
        : [0, 20]

    map = new MapLibreMap({
      container: element,
      style,
      center,
      zoom: pin.value
        ? (props.modelValue?.zoom ?? props.zoom)
        : props.center
          ? props.zoom
          : 1,
      // Our own credit control (D12): MapLibre's cannot carry the links the
      // basemap licences require, and it also renders for an empty source.
      // Ours is visible text for the same reason, not an icon behind a tooltip.
      attributionControl: false
    })

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.on('load', () => {
      ready.value = true
      failed.value = false
      emit('ready', map as MapLibreMap)
    })
    map.on('error', onMapError)
    map.on('moveend', onMoveEnd)
    map.on('render', projectBubble)
    map.on('click', onMapClick)
    map.on('contextmenu', openMenu)

    observer = new ResizeObserver(() => map?.resize())
    observer.observe(element)
    syncMarker()
  } catch (caught) {
    failed.value = true
    reportError(caught)
  }
}

/**
 * The map is only mounted when the disclosure is opened, and mounting has to
 * happen after the render that puts the container in the document.
 */
const onMapToggle = async (open: boolean) => {
  if (!open) return

  mapMounted.value = true
  await nextTick()

  if (map === null) await mount()
  else map?.resize()
}

watch(
  () => props.modelValue,
  (value) => {
    const next = value ? { lng: value.lng, lat: value.lat } : null
    if (next === null && pin.value === null) return
    if (
      next !== null &&
      pin.value !== null &&
      next.lng === pin.value.lng &&
      next.lat === pin.value.lat
    ) {
      if (value?.address) {
        localAddress.value = value.address
        addressAt.value = next ? { ...next } : null
      }
      if (value?.zoom !== undefined) viewZoom.value = value.zoom
      return
    }
    pin.value = next
    addressAt.value = value?.address && next ? { ...next } : null
    localAddress.value = value?.address
    syncMarker()
  }
)

watch(
  () => [
    props.styleUrl,
    props.pmtilesUrl,
    props.style,
    props.flavor,
    props.language
  ],
  async () => {
    if (!map) return
    try {
      map.setStyle(await resolveStyle())
    } catch (caught) {
      reportError(caught)
      failed.value = true
    }
  }
)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  marker?.remove()
  marker = null
  map?.remove()
  map = null
})
</script>
