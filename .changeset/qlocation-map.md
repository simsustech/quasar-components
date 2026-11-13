---
'@simsustech/quasar-components': minor
---

feat(components): add the location module — QLocation, QLocationSearch, QLocationAddress

`@simsustech/quasar-components/location` exports one complete map component plus the
primitives it is built from.

`QLocation` is a MapLibre map with a draggable pin, a right-click menu
(*What's here?*, *Move pin here*, *Center map here*, *Copy coordinates*,
*Clear pin*), an address autocomplete in the corner and a structured address
card underneath. `v-model` is `LocationValue` — a position with the address the
reverse geocode produced — so a consumer stores one object instead of a
coordinate tuple and a second, attached form.

The basemap is an OpenFreeMap style URL by default; setting `pmtilesUrl`
registers the `pmtiles://` protocol and builds a Protomaps style over the
archive instead, and `style` overrides both. The geocoder is injected
(`Geocoder`, with a keyless Photon implementation as the default), so a
deployment with its own geocoder — or none at all, with `:geocoder="null"` —
does not have to patch the library.

Attribution is drawn by the component, not by MapLibre's `AttributionControl`:
the basemap licences require links, and MapLibre's control cannot carry them
alongside an empty source attribution.

MapLibre is bundled into `dist/location.js`, so no other chunk grows and a
consumer only has to import the subpath. PMTiles and `@protomaps/basemaps` are a
separate chunk loaded on demand: nothing is downloaded unless `pmtilesUrl` is
set (or the exported `loadPmtiles` is called).

The module carries its own language pack (`en-US`, `nl`, `de`) with
`useLang`/`loadLang`, so `./location` does not depend on the form module being
loaded to switch language.
