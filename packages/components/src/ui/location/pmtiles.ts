import { addProtocol } from 'maplibre-gl'
import type { AddProtocolAction, StyleSpecification } from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import { layers, namedFlavor } from '@protomaps/basemaps'

const GLYPHS =
  'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf'
const SPRITE = 'https://protomaps.github.io/basemaps-assets/sprites/v4/light'

let registered = false

/**
 * MapLibre's protocol registry is global and its `addProtocol` throws on a
 * duplicate name, so this is guarded on both sides: a module-level flag for the
 * common case, and a swallowed throw for the case where a second copy of this
 * module (or the consumer itself) already registered `pmtiles`.
 */
export const registerPmtilesProtocol = () => {
  if (registered) return
  registered = true
  try {
    // `Protocol.tile` is an arrow function assigned in the constructor, so it
    // keeps its `this` when passed unbound. The cast is for the response type
    // only: pmtiles promises `GetResourceResponse<unknown>`, which TypeScript
    // will not narrow to MapLibre's `AddProtocolResponseData` union.
    addProtocol('pmtiles', new Protocol().tile as unknown as AddProtocolAction)
  } catch {
    // Already registered by someone else in this page; the archive still works.
  }
}

export interface ProtomapsStyleOptions {
  /** URL of the PMTiles archive, without the `pmtiles://` prefix. */
  pmtilesUrl: string
  /** A Protomaps basemap flavour name, e.g. `light` or `dark`. */
  flavor?: string
  /** Label language code passed to `layers()`. */
  lang?: string
}

/**
 * A complete MapLibre style over one PMTiles archive, built from
 * `@protomaps/basemaps` so the layer stack stays in step with the flavour.
 * Attribution is left empty on the source: `QLocation` draws one visible credit
 * for the whole map (D12), and a source-level string would be a second,
 * invisible copy — MapLibre's own control has nothing to show without one.
 */
export const protomapsStyle = ({
  pmtilesUrl,
  flavor = 'light',
  lang = 'en'
}: ProtomapsStyleOptions): StyleSpecification => ({
  version: 8,
  glyphs: GLYPHS,
  sprite: SPRITE,
  sources: {
    protomaps: {
      type: 'vector',
      url: `pmtiles://${pmtilesUrl}`,
      attribution: ''
    }
  },
  layers: layers('protomaps', namedFlavor(flavor), { lang })
})
