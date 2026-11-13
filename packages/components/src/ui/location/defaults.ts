/**
 * A single-archive PMTiles sample (Florence, Italy, ODbL) that answers range
 * requests, so the PMTiles path can be demonstrated without a key. It is not a
 * world basemap: a consumer with its own archive passes `pmtilesUrl`.
 *
 * This constant lives outside `pmtiles.ts` on purpose: the
 * `DEFAULT_PMTILES_URL` export from `index.ts` must not drag `pmtiles` and
 * `@protomaps/basemaps` into the eagerly loaded chunk (plan §3). The archive
 * implementation is a dynamic import reached only when `pmtilesUrl` is set.
 */
export const DEFAULT_PMTILES_URL =
  'https://pmtiles.io/protomaps(vector)ODbL_firenze.pmtiles'
