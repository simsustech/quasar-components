# CONTEXT — quasar-components

## Glossary

- **segment placeholder** — the YYYY/MM/DD hint text inside `DateInput`'s raw
  inputs (the `<input class="q-field__native">` elements in its `#control`
  slot). The preset's rule keyed on `.date-input-field`
  (`packages/preset/src/rules.ts`) sets them to `--q-on-surface-variant` at
  0.6 (inheriting the input's colour when the token is undefined), so they are
  not left to whatever the consumer's field CSS does with `::placeholder`.
  Avoid: hint, ghost text, watermark.
- **unocss-include marker** — `/* @unocss-include */` at the top of every chunk
  the kit's build emits (`unocssIncludePlugin`, `packages/components/vite.config.ts`).
  UnoCSS skips `.js` by default and reads that comment before its pipeline
  filter, so a consumer's own extractor scans the chunks it imports. It replaces
  the safelist the preset used to carry: there is no class list to regenerate,
  and a subpath the app never imports costs no CSS.
- **component rule** — a rule in `packages/preset/src/rules.ts`, keyed on the
  plain root class a component writes (`q-drawer-list`, `date-input-field`,
  `phone-dial-select`, `cron-input-row`), for the selectors that reach Quasar's own markup. It
  cannot be a utility: one styles only the element carrying the class, and the
  variant form (`[&_.q-item\_\_section--avatar]`) is not portable — `presetWind4`
  reads the `--` as a custom property and emits a selector lightningcss rejects.
  The descendant part is built with `symbols.selector`. `scripts/check.mjs`
  fails when a template writes such a variant, and when a block names a component
  that does not write the class it keys on.
- **national display** — what `QTelephoneNumber` shows inside its input:
  `formatNationalNumber()` of the parsed number (`6 12345678`), the national
  significant number with international grouping and no trunk prefix, rewritten
  on blur (and once on hydration), never mid-typing, so the caret never moves
  while the user types. The trunk `0` is omitted because the dial code lives in
  the `#prepend` select; repeating it would read as a second prefix.
- **model value** (of `QTelephoneNumber`) — the number in E.164
  (`+31612345678`), which is what `update:modelValue` emits and what stored data
  is parsed back from. Hydration re-emits a stored national or spaced
  international value once as E.164; a stored value that is not a valid number
  is not re-emitted. Display text and model text are deliberately different; see
  `src/ui/phone/`.
- **model value (of `QLocation`)** — the `LocationValue` object with `lng`,
  `lat`, an optional `zoom` and an optional `address` — not a `[lng, lat]`
  tuple. The address a reverse geocode produced is part of what the user
  picked, so it travels with the point; a tuple would need a second `v-model`
  for the same fact. Avoid: coordinate, position, marker.
- **reverse geocode** — turning a pin position into an address
  (`Geocoder.reverse`), as opposed to a **search**, which turns typed text into
  positions. `QLocation` does both; the pin's address card is only ever filled
  by a reverse geocode or by a picked suggestion.
- **credit control** — the visible credit strip in the map's bottom-right
  corner (`© OpenStreetMap contributors · OpenMapTiles · OpenFreeMap`, or
  `Protomaps · © OpenStreetMap contributors` over a PMTiles archive), drawn by
  the component rather than by MapLibre's `AttributionControl`: the OpenFreeMap
  style carries no source `attribution` string and `protomapsStyle` sets one to
  `''` on purpose, so the control renders nothing at all, and one credit for the
  whole map beats a per-source strip. The default branches link every name; a
  custom `attribution` string is rendered as plain text, not linked. It is
  text, not an `ⓘ` icon behind a tooltip: the licences require the credit to be
  visible without interaction, and an icon picks up the consumer's icon font
  (`icon="info_outline"` printed its own name in a consumer without the
  Material Icons ligature font). The prop and the class keep MapLibre's word,
  `attribution`; the documentation calls the thing it draws the credit control.
  `attribution: false` removes it, which makes the consumer responsible for the
  credit. Avoid: attribution footer, legend, attribution button.

## Unused-code gate

`pnpm run knip` (`knip.json`) fails on an unused file, an unused dependency and
an import it cannot resolve; CI runs it after the format check. Two entries in
`ignoreDependencies` are deliberate:

- `.*\.icon$` is not a package: it is a virtual module id the kit's own Vite
  plugin resolves (`moduleTransformPlugin` in
  `packages/components/vite.config.ts`).
- `@quasar/extras` is imported by path from vitrify's Quasar integration
  (`@quasar/extras/material-icons/material-icons.css`), not by any source file
  here — the dev build fails without it (measured).
- `@iconify-json/flagpack` is read by UnoCSS's `presetIcons` when it turns the
  `i-flagpack-*` classes into CSS; no source file imports it. It is the dev app's
  copy of the collection a consumer installs, and the flag artwork now comes from
  it instead of the 252 SVGs the `./flags` subpath used to ship.
