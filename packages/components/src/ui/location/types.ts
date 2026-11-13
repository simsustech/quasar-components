/**
 * A position in WGS84 degrees, the same pair MapLibre's `LngLat` carries.
 * Kept as a plain object so a stored `v-model` value is serialisable and does
 * not depend on MapLibre's class instance.
 */
export interface LngLat {
  lng: number
  lat: number
}

/**
 * A postal address in the parts an address form edits. Every field is
 * optional because no geocoder fills all of them for every result.
 */
export interface LocationAddress {
  street?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  region?: string
  country?: string
  countryCode?: string
  /** Single-line rendering of the parts, when the geocoder provides one. */
  formatted?: string
}

/** What `QLocation`'s `v-model` holds: a position, optionally with its address. */
export interface LocationValue extends LngLat {
  zoom?: number
  address?: LocationAddress
}

/** One geocoder hit, normalised away from any single provider's GeoJSON. */
export interface GeocodeResult {
  lng: number
  lat: number
  address: LocationAddress
  /** `[west, south, east, north]` when the provider knows the extent. */
  bbox?: [number, number, number, number]
  id?: string
}

/**
 * The provider seam. Photon is the default implementation
 * (`createPhotonGeocoder`), but every component accepts any object with this
 * shape, and `null` switches the map off the network entirely.
 */
export interface Geocoder {
  search(
    query: string,
    opts?: {
      signal?: AbortSignal
      limit?: number
      language?: string
      near?: LngLat
    }
  ): Promise<GeocodeResult[]>
  reverse(
    at: LngLat,
    opts?: { signal?: AbortSignal; language?: string }
  ): Promise<GeocodeResult | null>
}
