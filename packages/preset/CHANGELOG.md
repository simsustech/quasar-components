# @simsustech/quasar-components-preset

## 0.13.0

### Minor Changes

- a9ea6db: feat(preset): add `@simsustech/quasar-components-preset`

  A UnoCSS preset for the kit that carries only what a scan cannot produce: the
  rules whose selectors have to reach into Quasar's own markup. There is no class
  list to install, and no `@simsustech/quasar-components-preset/css`.

  The kit marks every emitted chunk with `/* @unocss-include */`
  (`unocssIncludePlugin` in `packages/components/vite.config.ts`). UnoCSS skips
  `.js` by default and checks that comment before its pipeline filter, so a
  consumer's own extractor reads the chunks it imports — the same extractor that
  reads the consumer's sources. A class added to a template appears in the sheet on
  the next build, a subpath the app never imports costs no CSS, and nothing has to
  be regenerated or kept in step.

  What the preset does carry is a rule per component whose styling targets Quasar's
  internals (`QDrawerList`'s avatar and expansion content, `DateInput`'s native
  inputs, `QTelephoneNumber`'s dial-code select, `CronScheduleInput`'s row). The
  descendant part of each selector is built from `symbols.selector`, keyed on the
  plain root class the component writes (`<q-list class="q-drawer-list">`). Those
  rules cannot be utilities: one styles only the element carrying it, and the
  variant form is not portable — `presetWind4` reads the `--` in
  `[&_.q-item\_\_section--avatar]` as a custom property and emits
  `.q-item__sectionvar(--avatar)`, which lightningcss rejects with
  `Expected identifier in class selector`, stopping a consumer's build.

  `pnpm -C packages/preset run check` verifies the two properties a scan cannot:
  that no template writes an arbitrary variant carrying `--`, and that each rules
  block names a component that exists and writes the class it keys on, with every
  selector continuing that class.

### Patch Changes

- 21768b8: **`QLocation` answers where the user is looking.** "What's here?" resolved an
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

- 21768b8: fix(location): visible basemap credit, address card above the map, and a pin move that settles

  Four defects found by using `QLocation` in a real quote form:
  - **The credit is visible.** A tooltip is not attribution. The map now draws the credit each basemap
    licence requires as text with links — `© OpenStreetMap contributors · OpenMapTiles · OpenFreeMap`
    for an OpenFreeMap style, `Protomaps · © OpenStreetMap contributors` over a PMTiles archive — and a
    custom `attribution` string renders as that visible credit. The `ⓘ` button is gone; it was rendered
    with Quasar's default Material Icons _ligature_ font, so a consumer whose icon set does not ship
    that font saw the literal text `info_outline` under the search box.
  - **The address card sits above the map.** The fields are the question, the map is the confirmation.
  - **The search spinner stops.** `useGeocoder` cleared its pending entry before the `finally` that
    lowers `loading`, so every lookup that reached the provider left `QSelect` showing a spinner until
    the next keystroke cancelled it.
  - **A superseded reverse geocode is silent.** A second pin move aborts the reverse geocode before it,
    which resolves `null` exactly like an empty result; `QLocation` now only reports the newest move, so
    a drag no longer paints "address lookup failed" for work it cancelled itself. Every move takes a new
    sequence number — including _Move pin here_ and _Clear pin_, which request no lookup at all — so an
    in-flight reverse cannot land its address on a pin that has since gone elsewhere, and
    `useGeocoder`'s teardown lowers its flags instead of leaving them for a discarded instance.

- 33b9396: **`QTelephoneNumber`'s prepend is on the field's value line.** The dial code,
  the flag and the dropdown arrow each sat on a different line — the code in the
  value band, the arrow centred in the whole control, the flag on neither — so the
  prepend looked broken next to the typed number. The select is now an ordinary
  borderless value inside the prepend rather than a style of its own: dropping
  `dense` and `stack-label` lets Quasar's labelled-field padding reach it, which is
  exactly what puts the code on the value line, and the field keeps the label
  behaviour of every other input. The stylesheet is three rules: no frame, the
  arrow takes the value line, and the flag and code share one line. Measured on
  the consumer's outlined field: value band 433.3, code/flag/arrow
  433.3/433.3/433.3 (418.3 empty), and the composite is still as tall as the plain
  input beside it.
