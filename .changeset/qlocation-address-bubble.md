---
'@simsustech/quasar-components': patch
'@simsustech/quasar-components-preset': patch
---

**`QLocation` answers where the user is looking.** "What's here?" resolved an
address and moved the pin, but the only place an address was drawn was
`QLocationAddress` above the map, which fills blank fields — so a form whose
fields were already typed could never show the result, and on the consumer's
quote form the answer was invisible. The map now carries a bubble anchored above
the pin with the resolved address: `formatted` when the geocoder provides one,
`street houseNumber, postalCode city` otherwise, and nothing at all when the
parts come out empty. It is a Vue overlay inside `.q-location__map`, positioned
from `map.project()` on MapLibre's `render` event, so it follows the pin through
pan, zoom and easing (a `ResizeObserver` sees none of those) and stays assertable
in a test. It is not a `maplibregl.Popup` for the same reason the search field
and the credit strip are not: the overlay has to react to state.

The bubble belongs to the newest pin: a pin move clears it with the address it
was showing, and the reverse-geocode sequence number that already discarded a
superseded answer now also decides which address may be painted. The close
button is a plain `<button type="button">` with a `×` glyph and an
`aria-label`, not a `q-icon`: the consumer's dialog ships no Material Icons font,
where an icon-font glyph renders as nothing. The bubble is `role="status"` with
`aria-live="polite"`, is skipped entirely when the `address` prop is `false`,
and disappears when the pin is cleared.

"What's here?" keeps taking the same path a left click takes — place the pin,
reverse geocode, publish — so its answer is the bubble and nothing else; it does
not write to the consumer's address card beyond what a pin move already did.

**New `center?: LngLat` prop.** The no-pin view was hardcoded to the world at
zoom 1, which is wrong for a service area (north Brabant, not the Pacific). The
prop sets the view when there is no pin, with `zoom` applying to it; without it
the world view is unchanged.

**New `center?: LngLat` prop.** The no-pin view was hardcoded to the world at
zoom 1, which is wrong for a service area (north Brabant, not the Pacific). The
prop sets the view when there is no pin, with `zoom` applying to it; without it
the world view is unchanged.

The map itself sits behind a `q-expansion-item` labelled from the language pack
(`Kaart`/`Map`/`Karte`), collapsed by default: the address card is the question
and the basemap is the confirmation, so a form that never looks at the map does
not fetch a tile. The map mounts on the first open and is kept afterwards, so
collapsing and reopening never reloads it. While it loads, the element MapLibre
will draw into stands empty, so the component draws the box itself — a tinted
`q-location__canvas-placeholder` with a spinner, which becomes the failure
message when the style never arrives. A spinner in an invisible box says
"something is loading"; this says a map is.

An address entered in the card is a location, not just text: a suggestion picked
there carries coordinates, and the pin moves to them (the card used to fill in
while the pin stayed put, or never appeared at all). A hand-typed address is
forward geocoded once it names a street and a postcode or city, debounced, and
skipped when the address is the one this component just resolved — so a pin move
never geocodes the address it obtained from a reverse geocode.
