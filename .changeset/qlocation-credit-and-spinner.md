---
'@simsustech/quasar-components': patch
'@simsustech/quasar-components-preset': patch
---

fix(location): visible basemap credit, address card above the map, and a pin move that settles

Four defects found by using `QLocation` in a real quote form:
- **The credit is visible.** A tooltip is not attribution. The map now draws the credit each basemap
  licence requires as text with links — `© OpenStreetMap contributors · OpenMapTiles · OpenFreeMap`
  for an OpenFreeMap style, `Protomaps · © OpenStreetMap contributors` over a PMTiles archive — and a
  custom `attribution` string renders as that visible credit. The `ⓘ` button is gone; it was rendered
  with Quasar's default Material Icons *ligature* font, so a consumer whose icon set does not ship
  that font saw the literal text `info_outline` under the search box.
- **The address card sits above the map.** The fields are the question, the map is the confirmation.
- **The search spinner stops.** `useGeocoder` cleared its pending entry before the `finally` that
  lowers `loading`, so every lookup that reached the provider left `QSelect` showing a spinner until
  the next keystroke cancelled it.
- **A superseded reverse geocode is silent.** A second pin move aborts the reverse geocode before it,
  which resolves `null` exactly like an empty result; `QLocation` now only reports the newest move, so
  a drag no longer paints "address lookup failed" for work it cancelled itself. Every move takes a new
  sequence number — including *Move pin here* and *Clear pin*, which request no lookup at all — so an
  in-flight reverse cannot land its address on a pin that has since gone elsewhere, and
  `useGeocoder`'s teardown lowers its flags instead of leaving them for a discarded instance.
