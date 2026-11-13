// MapLibre draws its controls, popups and attribution with this sheet; it is
// not expressible as utilities, and `vite.config.ts` keeps it external so the
// import survives into `dist/location.js`.
import 'maplibre-gl/dist/maplibre-gl.css'

export { default as QLocation } from './QLocation.vue'
export { default as QLocationSearch } from './QLocationSearch.vue'
export { default as QLocationAddress } from './QLocationAddress.vue'

export { createPhotonGeocoder, roundLngLat } from './geocoder'
export { useGeocoder } from './useGeocoder'
export { useLang, loadLang } from './lang'
export { DEFAULT_PMTILES_URL } from './defaults'

/**
 * `pmtiles` and `@protomaps/basemaps` are a dynamic chunk (plan §3): importing
 * this subpath must not download them. `QLocation` loads it itself when
 * `pmtilesUrl` is set; this is the escape hatch for a consumer that wants the
 * protocol or a hand-built `protomapsStyle`.
 */
export const loadPmtiles = () => import('./pmtiles')

export type {
  GeocodeResult,
  Geocoder,
  LngLat,
  LocationAddress,
  LocationValue
} from './types'
export type { LocationLanguage } from './lang'
export type { PhotonGeocoderOptions } from './geocoder'
export type { UseGeocoderOptions, UseGeocoderReturn } from './useGeocoder'
export type { ProtomapsStyleOptions } from './pmtiles'
