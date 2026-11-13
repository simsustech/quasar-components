import { computed, getCurrentInstance, isRef, onBeforeUnmount, ref } from 'vue'
import type { Ref } from 'vue'
import type { GeocodeResult, Geocoder, LngLat } from './types'

const DEFAULT_DEBOUNCE = 250
export const DEFAULT_MIN_LENGTH = 3

export interface UseGeocoderOptions {
  /** Idle time before a typed query is sent. */
  debounce?: number
  /** Shorter queries are not sent at all. */
  minLength?: number
  /** Result count passed to `Geocoder.search`. */
  limit?: number
}

export interface UseGeocoderReturn {
  results: Ref<GeocodeResult[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  search: (query: string) => Promise<GeocodeResult[]>
  reverse: (at: LngLat) => Promise<GeocodeResult | null>
}

interface PendingSearch {
  request: AbortController | null
  resolve: (found: GeocodeResult[]) => void
  settled: boolean
}

const isAbort = (value: unknown) =>
  (value as { name?: string } | null | undefined)?.name === 'AbortError'

const toError = (value: unknown) =>
  value instanceof Error ? value : new Error(String(value))

/**
 * Debounced search plus a one-shot reverse, both on top of an injected
 * `Geocoder`.
 *
 * Two independent abort controllers on purpose: a reverse geocode (a pin drag)
 * must not cancel the search a `QSelect` is waiting on, because Quasar only
 * reopens the menu from that search's `filter` callback. A search superseding
 * a search is the only cancellation that matters, and the newest query wins.
 */
export const useGeocoder = (
  geocoder: Geocoder | null | Ref<Geocoder | null>,
  options: UseGeocoderOptions = {}
): UseGeocoderReturn => {
  const wait = options.debounce ?? DEFAULT_DEBOUNCE
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH
  const limit = options.limit

  const results = ref<GeocodeResult[]>([])
  const error = ref<Error | null>(null)
  const searching = ref(false)
  const reversing = ref(false)
  const loading = computed(() => searching.value || reversing.value)

  let pending: PendingSearch | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  let reverseRequest: AbortController | null = null

  const provider = () => (isRef(geocoder) ? geocoder.value : geocoder)

  /**
   * Ends a search: the promise resolves, and the loading flag goes down with
   * the newest request. It has to happen here — this used to clear `pending`
   * first, which made `run`'s `finally` skip its own reset, so every search
   * that reached the provider left `loading` true and a `QSelect` spinner
   * turning until the next keystroke cancelled it. `run`'s `finally` keeps the
   * same reset only for the early returns (an abort) that never get here.
   */
  const settle = (entry: PendingSearch, found: GeocodeResult[]) => {
    if (entry.settled) return
    entry.settled = true
    entry.resolve(found)
    if (pending === entry) {
      pending = null
      searching.value = false
    }
  }

  const cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    const entry = pending
    pending = null
    searching.value = false
    if (!entry) return
    entry.request?.abort()
    if (!entry.settled) {
      entry.settled = true
      entry.resolve(results.value)
    }
  }

  const run = async (query: string, entry: PendingSearch) => {
    const active = provider()
    if (!active) {
      // A null geocoder means "do not touch the network": resolve empty rather
      // than throw, so a consumer can wire `:geocoder="null"` for a static map.
      results.value = []
      error.value = null
      searching.value = false
      settle(entry, [])
      return
    }

    const request = new AbortController()
    entry.request = request

    try {
      const found = await active.search(query, {
        signal: request.signal,
        limit
      })
      if (request.signal.aborted) return
      results.value = found
      error.value = null
      settle(entry, found)
    } catch (caught) {
      if (isAbort(caught) || request.signal.aborted) return
      // Keep the previous options: a transport hiccup must not empty a list
      // the user is in the middle of picking from.
      error.value = toError(caught)
      settle(entry, results.value)
    } finally {
      // A run that returned early — aborted, or superseded — still owns the
      // flag when nothing newer has taken it over.
      if (pending === entry) {
        pending = null
        searching.value = false
      }
    }
  }

  const search = (query: string): Promise<GeocodeResult[]> => {
    cancel()

    const trimmed = query.trim()
    if (trimmed.length < minLength) {
      results.value = []
      error.value = null
      return Promise.resolve([])
    }

    searching.value = true
    return new Promise<GeocodeResult[]>((resolve) => {
      const entry: PendingSearch = { request: null, resolve, settled: false }
      pending = entry
      timer = setTimeout(() => {
        timer = undefined
        void run(trimmed, entry)
      }, wait)
    })
  }

  const reverse = async (at: LngLat): Promise<GeocodeResult | null> => {
    const active = provider()
    if (!active) return null

    reverseRequest?.abort()
    const request = new AbortController()
    reverseRequest = request
    reversing.value = true

    try {
      const found = await active.reverse(at, { signal: request.signal })
      if (request.signal.aborted) return null
      error.value = null
      return found
    } catch (caught) {
      if (isAbort(caught) || request.signal.aborted) return null
      error.value = toError(caught)
      return null
    } finally {
      if (reverseRequest === request) {
        reverseRequest = null
        reversing.value = false
      }
    }
  }

  const dispose = () => {
    cancel()
    reverseRequest?.abort()
    reverseRequest = null
    // The in-flight reverse's own `finally` compares against `reverseRequest`,
    // which is null by now, so it never lowers this one: an unmount during a
    // lookup would leave `loading` true for whoever holds the ref.
    reversing.value = false
  }

  // `useGeocoder` is also usable outside a component; only tie lifetime to the
  // instance when there is one.
  if (getCurrentInstance()) onBeforeUnmount(dispose)

  return { results, loading, error, search, reverse }
}
