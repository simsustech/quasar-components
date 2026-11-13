import type { GeocodeResult, Geocoder, LngLat, LocationAddress } from './types'

export interface PhotonGeocoderOptions {
  /** Base URL of a Photon instance; `/api` and `/reverse` are appended. */
  endpoint?: string
  language?: string
  /** Default result count when a `search` call does not pass one. */
  limit?: number
}

const DEFAULT_ENDPOINT = 'https://photon.komoot.io'
const DEFAULT_LIMIT = 8

/**
 * The `lang` values Photon actually serves. Anything else is a `400 Bad
 * Request` for the whole query — `lang=nl` (measured 2026-11-09 on
 * photon.komoot.io, with and without `limit`) returns no results at all, so a
 * Dutch UI silently lost its street autocomplete. An unsupported language is
 * therefore left off the request rather than forwarded: the UI language is the
 * consumer's business, the query is Photon's.
 */
const PHOTON_LANGUAGES = new Set(['de', 'en', 'fr', 'it'])

/** The `lang` parameter to send, or `null` when Photon would reject it. */
const photonLanguage = (language?: string): string | null => {
  if (!language) return null
  const base = language.toLowerCase().split(/[-_]/)[0]
  return PHOTON_LANGUAGES.has(base) ? base : null
}

interface PhotonFeature {
  geometry?: { coordinates?: number[] }
  properties?: Record<string, unknown>
  bbox?: number[]
}

interface PhotonResponse {
  features?: PhotonFeature[]
}

const text = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * Photon returns flat OSM tags in `properties`. `name` is what a POI or a
 * street carries when `street` is absent, so it is used as the street fallback
 * instead of being dropped: without it a search for a shop would show only its
 * city.
 */
const toAddress = (
  properties: Record<string, unknown> = {}
): LocationAddress => {
  const street = text(properties.street) ?? text(properties.name)
  const houseNumber = text(properties.housenumber)
  const postalCode = text(properties.postcode)
  const city = text(properties.city)
  const region = text(properties.state)
  const country = text(properties.country)
  const countryCode = text(properties.countrycode)

  const line1 = [street, houseNumber].filter(Boolean).join(' ')
  const line2 = [postalCode, city].filter(Boolean).join(' ')
  const formatted = [line1, line2, country].filter(Boolean).join(', ')

  return {
    street,
    houseNumber,
    postalCode,
    city,
    region,
    country,
    countryCode,
    formatted: formatted === '' ? undefined : formatted
  }
}

const toResult = (feature: PhotonFeature): GeocodeResult | null => {
  const coordinates = feature.geometry?.coordinates
  if (!coordinates || coordinates.length < 2) return null

  const lng = Number(coordinates[0])
  const lat = Number(coordinates[1])
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  const bbox =
    feature.bbox?.length === 4
      ? (feature.bbox.map(Number) as [number, number, number, number])
      : undefined

  const id = text(feature.properties?.osm_id)

  return {
    lng,
    lat,
    address: toAddress(feature.properties),
    bbox,
    id
  }
}

async function readFeatures(
  response: Response,
  what: string
): Promise<PhotonFeature[]> {
  if (!response.ok) {
    throw new Error(
      `Photon ${what} failed: ${response.status} ${response.statusText}`
    )
  }
  const body = (await response.json()) as PhotonResponse
  return body.features ?? []
}

/**
 * Photon (photon.komoot.io) is keyless, has prefix matching that suits an
 * autocomplete, and exposes `/reverse` on the same host — so one adapter and
 * one prop covers both directions. A consumer with its own instance only has
 * to change `endpoint`.
 */
export const createPhotonGeocoder = (
  options: PhotonGeocoderOptions = {}
): Geocoder => {
  const endpoint = (options.endpoint ?? DEFAULT_ENDPOINT).replace(/\/+$/, '')
  const defaultLimit = options.limit ?? DEFAULT_LIMIT
  const defaultLanguage = options.language

  const build = (path: string) => new URL(endpoint + path)

  return {
    async search(query, opts = {}) {
      const url = build('/api')
      url.searchParams.set('q', query)
      url.searchParams.set('limit', String(opts.limit ?? defaultLimit))
      const language = photonLanguage(opts.language ?? defaultLanguage)
      if (language) url.searchParams.set('lang', language)
      // Photon biases towards a point with `lat`/`lon`; it is a hint, not a
      // filter, so results outside the area still come back.
      if (opts.near) {
        url.searchParams.set('lat', String(opts.near.lat))
        url.searchParams.set('lon', String(opts.near.lng))
      }

      const response = await fetch(url.toString(), { signal: opts.signal })
      const features = await readFeatures(response, 'search')
      return features
        .map(toResult)
        .filter((result): result is GeocodeResult => result !== null)
    },

    async reverse(at, opts = {}) {
      const url = build('/reverse')
      url.searchParams.set('lon', String(at.lng))
      url.searchParams.set('lat', String(at.lat))
      const language = photonLanguage(opts.language ?? defaultLanguage)
      if (language) url.searchParams.set('lang', language)

      const response = await fetch(url.toString(), { signal: opts.signal })
      const features = await readFeatures(response, 'reverse')
      return toResult(features[0] ?? {})
    }
  }
}

/**
 * Rounding helper shared by the map and the address card: six decimals is
 * about 11 cm, well past what a pin can express, and keeps a stored value free
 * of floating point noise.
 */
export const roundLngLat = (at: LngLat): LngLat => ({
  lng: Math.round(at.lng * 1e6) / 1e6,
  lat: Math.round(at.lat * 1e6) / 1e6
})
