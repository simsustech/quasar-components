# @simsustech/quasar-components

## 0.13.0

### Minor Changes

- a9ea6db: refactor(components): ship no CSS — every component styles itself with utilities
  
  The kit's nine `<style>` blocks are gone, so there is no stylesheet left to
  import:
  
  ```diff
  -import '@simsustech/quasar-components/css'
  +// nothing: add `quasarComponentsPreset()` to your UnoCSS config
  ```
  
  Each rule is now a utility on the element the component's own template renders.
  A consumer's UnoCSS scan skips `.js` by default, so every emitted chunk carries
  `/* @unocss-include */` (`unocssIncludePlugin`): the consumer's own extractor
  reads the chunks it imports, and there is no class list to install or keep in
  step. Every selector the kit writes was already namespaced and nothing used
  `:deep()`.
  
  Rules that reach Quasar's internals — `.q-field__control`, `.q-item__section--avatar`,
  `.q-drawer__content` — became arbitrary variants on the nearest element the
  template owns (`[&_.q-field\_\_append]:h-6`,
  `[&.q-drawer--on-top.q-drawer--top-padding_.q-drawer\_\_content]:!pt-0`), so
  specificity is still the stylesheet's and Quasar's own rules are still overridden.
  The ones whose selector carries a `--` (`q-item__section--avatar`,
  `q-field--standard`, `q-expansion-item--expanded` — `DateInput`'s internals and
  `QDrawerList`'s whole menu) cannot be written that way: `presetWind4` reads the
  `--` as a custom property and emits `.q-item__sectionvar(--avatar)`, which
  lightningcss refuses to minify. Those moved to `@simsustech/quasar-components-preset` as rules keyed on the
  root class the component writes, so nothing in a template can be mangled by an
  engine: `QDrawerList`, `DateInput`, `QTelephoneNumber` and `CronScheduleInput`
  carry no arbitrary variant at all.
  
  One sheet cannot be written as utilities: MapLibre's. `./location` imports
  `maplibre-gl/dist/maplibre-gl.css` and the build lists that exact specifier in
  `rollupOptions.external`, so `dist/location.js` keeps the import instead of
  vite's lib mode extracting it into an unexported `dist/style.css`; the
  consumer's bundler resolves it from the kit's own dependency, in the version the
  kit was built against.
  
  Measured consequence: `pnpm -C packages/components build` emits no CSS asset at
  all, `grep maplibre-gl/dist/maplibre-gl.css packages/components/dist/location.js`
  matches, and `packages/dev` — which runs `presetWind3()` + `quasarComponentsPreset()`
  and imports no stylesheet — renders the same computed styles on the date field,
  the cron field, the drawer list and the map's controls before and after the
  conversion. Under `presetWind4` the generated sheet has 0 mangled selectors and
  survives lightningcss, which it did not before this change.
- 799cf29: **The `./flags` subpath is gone, and flags are icon classes.** It shipped 252 SVG
  files, 252 generated components and a language module — 1.3 MB — to render a flag
  per country, and nothing but the dev app's own demo imported it. `CountrySelect`,
  `LocaleSelect` and `QTelephoneNumber` already take the flag as an icon name from
  the caller, so the supported path is the one the consumers use: pass
  `i-flagpack-nl` (or `i-flag-*`, or an `img:` URL) and let UnoCSS's `presetIcons`
  resolve it from the icon collection in your app.
  
  Removing a subpath is breaking: `import ... from '@simsustech/quasar-components/flags'`
  has no replacement, and `@iconify-json/flagpack` moves from this package's
  dependencies to the app that renders flags — the quote site already has it.
- 21768b8: feat(components): add the location module — QLocation, QLocationSearch, QLocationAddress
  
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
- 33b9396: feat(components): add QTelephoneNumber and the `./phone` subexport
  
  A telephone field that actually knows what a phone number is, in its own
  subexport so the 29 KB of metadata does not land in `form.js`, which every
  consumer already imports.
  
  `QTelephoneNumber` is one field, not a field inside a field: a `QInput` whose
  `#prepend` holds a borderless `QSelect` showing the dial code. The model value is
  E.164 (`+31612345678`); the input shows the national significant number without
  the trunk prefix (`6 12345678`) and rewrites it on blur (and once on hydration),
  so typing never moves the caret. The trunk `0` is omitted because `+31` is
  already visible in the prepend.
  
  Incoming values are re-parsed rather than assumed, so nothing stored needs
  migrating: `0612345678`, `612345678`, `+31612345678`, `+31 6 12345678` and the
  separator variants all hydrate to `6 12345678` / `+31612345678`, and a leading
  `+` sets the country in the select. A stored value that is not a phone number at all stays
  visible untouched and emits nothing; typed into an empty field it shows as
  typed and emits `''`.
  
  Validation is one rule on `lazy-rules`, so the message appears on blur and
  clears on the first valid keystroke. Countries come from a `countries` prop —
  `{ iso3166, name, icon? }` items, a different shape from `CountrySelect`'s
  `{ icon, iso3166 }`, since the label is the caller's name rather than
  `lang.countries` and the dial code is derived from the metadata — or from the
  245 countries in the metadata (named by `Intl.DisplayNames` in the active
  language) when there is none.
  
  The component and its `QTelephoneNumberProps` props type are exported from the
  `./phone` subexport, alongside `isValidPhoneNumber`, `formatInternational`,
  `formatNationalNumber`, `parsePhoneNumber`, `countryCallingCode` and
  `defaultCountries`.
  
  Known limitation: the metadata is `libphonenumber-js/min` (29.2 KB minified,
  against 49.9 KB for `/max`), whose length tables are coarser — for some
  countries a correctly-shaped but too-short number (`+31123456`) is accepted as
  valid. This is the documented cost of the smaller bundle, not a bug in the
  component. For scale, the built artifact — which also carries the parser and
  the component — is `dist/phone.js` at 224 kB (44.6 kB gzip); it lives in its
  own subexport precisely so that cost stays out of `form.js`.
  
  **The dial-code select is searchable, and one click is never a dead end.** The
  popup opened with the `countries` prop and nothing else, so a number from a
  country the list did not carry could not be entered: the chip was the only way
  to change the code. The select takes input now — a name (`spanje`), an ISO code
  (`es`) or a dial code (`34`, `+34`) narrows the list, and the search runs over
  every country the metadata knows, with the `countries` prop's entries first. That
  prop describes what the popup opens with, not the limit of what can be picked.
  
  Four things came out of living with it: the search box is sized to the typed text
  rather than the 20 characters a bare input asks for (Quasar pins a select's input
  at `min-width: 50px !important`, so the prepend took 289px of a 420px field, and
  it measures 126px now); the chip yields while there is a query, because an
  input-enabled select renders both and `+31 +33` reads as two dial codes; the
  select keeps a `min-w-[13ch]` floor, because the popup's width follows the select
  and hiding the chip was clipping the options; and the search box takes
  `font: inherit`, because a theme styles `.q-field__native` while a select's input
  is `.q-field__input` — the field showed `+31` in 16px Roboto and `33` in 13.3px
  Arial. The `Landcode` tooltip is gone: it painted over the first option.
  
  **`flagUrl` gives a country the list does not name a flag.** It is a function
  from ISO code to image URL, so a field that offers three countries can still show
  a flag for any of the 245 a search reaches, and the kit ships no images.
  
  What keeps the requests down is the length of the list, not per-image machinery:
  a query renders at most 12 rows, measured on a 245-row lazy list that fetched
  173 images in Chromium and 46 in Firefox against exactly 12 for a 12-row one.
  `loading="lazy"` is the only decoration on top, and it is a hint — Chromium
  defers a scrolled-out row in a menu where Firefox does not.

### Patch Changes

- 42f6b5b: fix(components): draw CronScheduleInput as one field, not a field inside a field
  
  The component forced `borderless` on its outer QField, which is the one thing a
  field cannot be if it has to sit in a form: under a token-driven style the
  borderless control carries no surface, no radius and no padding, so the input
  rendered as loose text under a floating label next to ordinary inputs. It now
  inherits the same field appearance as any other input (and any field attribute
  a consumer passes — `filled`, `outlined`, `standout`, `dense`, `square` — reaches
  the outer QField again), so it matches its siblings instead of announcing that
  it came from another library.
  
  The parts are values, not fields: dense borderless QSelects with no hint strip,
  no frame and no underline of their own, sized to the field's value band
  (`--q-comp-lg` minus `--q-field-labeled-padding-top`) so the composite lands on
  the same 56px control as a plain input. Previously each part reserved its own
  label band and hint strip, the composite grew to 136px against a 56px sibling,
  and the per-part hints (the only thing naming the parts) collided with each
  other — "Day of monthMonth". Part names now live in per-part `aria-label`s and
  tooltips, and the trailing padding the `--labeled` rule reserves under a native
  input no longer leaves dead surface at the bottom of the control.
  
  Also fixes the minute options stopping at 58: `Array(59)` cannot offer minute 59,
  so a schedule at minute 59 could not be entered or re-entered through the UI.
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
- 21768b8: **The bubble follows an edited field, and the address echo stops looping.**
  `formatted` is the geocoder's sentence for the parts it was built from, and it
  survived a part being edited: the card said `Dorpsstraat 99` while the map's
  bubble still drew `Dorpsstraat 12`. Editing a part now drops `formatted`, so the
  bubble falls back to the parts it has.
  
  That made a latent bug fire: `applyAddress()` treats an empty field as "fill me",
  so re-applying an address it had just emitted counted as a change and emitted
  again — the consumer's echo came straight back and the loop allocated until the
  renderer died (`V8 javascript OOM (CALL_AND_RETRY_LAST)`, measured in Chromium on
  the quote form). A value that does not differ is no longer assigned, so the echo
  settles.
- 21768b8: fix(location): visible basemap credit, address card above the map, and a pin move that settles
  
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
- 21768b8: **A house number moves the pin.** Photon answers
  `Dorpsstraat 99, 5504 Veldhoven` with the street's centroid as the first result
  and the house numbers after it, and the card's forward geocode took `found[0]` —
  so every number in a street put the pin on the same point. Editing the number
  changed nothing on the map and nothing in the distance, with the card already
  showing the new number. The first result that carries the number asked for now
  wins, and the first answer is still used when none does. Measured against
  photon.komoot.io: `Dorpsstraat 12` 5.396683/51.403618 (no housenumber),
  `Dorpsstraat 99` 5.4030191/51.4046998.
- 21768b8: **The picked street is a value again, not a label.** `QSelect` with `use-input`
  and no `fill-input` moves the selected option's text into a sibling
  `<span class="q-select__selected-value">` and leaves the real `<input>` empty, so
  the address card showed a street that was not in the field: Ctrl+A selected
  nothing, Home/End did nothing, and typing started a fresh query instead of
  editing the address that was there. `QLocationSearch` now sets `fill-input`
  (the label stays in the input) and `hide-selected` (Quasar otherwise renders the
  same label twice, once in the input and once in that span); the map overlay's
  search box has no model value, so nothing changes for it.
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

## 0.12.14

### Patch Changes

- f1188d4: fix(components): stop FilteredModelSelect discarding the typed phrase
  
  With `use-input` on, Quasar fires `filter('')` whenever the options array
  identity changes while the menu is open and nothing is selected (its
  `watch(innerValue)`). `FilteredModelSelect` forwarded that synthetic event as
  the search phrase, so the phrase the user typed was thrown away. Because the
  parent updates `filteredOptions` from the result, the empty phrase changed the
  options again and the select refetched forever — SlimFact measured ~120 requests
  per second with the typed result overwritten by the last empty one.
  
  The component now follows QSelect's own `input-value` event: an empty `filter`
  falls back to the input's real text, so a synthetic empty re-filter is a no-op
  instead of a clear. A made selection clears the tracked text (the input then
  holds the option label, which is not a search), so the prefetch of an unmapped
  model value asks for the full list rather than searching for the label.
- e8e8e11: fix(components): let QStyledCard fill its container instead of capping at 300px
  
  `QStyledCard` carried an unconditional inline `style="max-width: 300px; padding: 2px"` on its
  `q-card` root. Inline style beats any class, so a consumer placing the card in a grid column
  (`col-12 col-md-4` → 445px at 1440) still got a 300px card: petboarding's pets, contact-people
  and account grids rendered content-hugging cards with the columns and gutters never filling, and
  the card's sections sat behind an extra 2px inset on top of Quasar's own padding.
  
  The cap and the padding are gone; width now comes from the container (grid classes, the parent's
  width, or nothing at all for a standalone card), and sections use Quasar's stock padding.

## 0.12.13

### Patch Changes

- bd6b1c0: `DateInput` segment placeholders stay visible under preset CSS
  
  The segment inputs are raw `<input class="q-field__native">` elements without
  Quasar's `q-placeholder` class, so a stylesheet that hides `::placeholder`
  unconditionally drops their YYYY/MM/DD hints — reported on petboarding's
  `PetForm`, where all three segments rendered no hint text. Reproduced on the
  harness fixture (2026-10-05): the segment inputs computed `rgba(0, 0, 0, 0)`.
  The scoped rule gives them `--q-on-surface-variant` at 0.6 when a theme
  defines the token, inheriting the input's own colour otherwise (stock Quasar
  consumers).

## 0.12.12

### Patch Changes

- 237514b: Accessible names: a `heading` slot for `Md3Layout`, named row menus, named date segments.
  
  `Md3Layout` gains a `heading` slot inside `q-page-container` (before the
  `router-view`), so a consumer can place exactly one `<h1>` per routed page in
  the main landmark instead of duplicating the header title in content.
  
  `AccountsTable`'s row ⋮ button now carries an accessible name built from the
  new `lang.moreOptions` key plus the row's identity (`name ?? email`) — "More
  options" alone does not say *which* row (added to the authentication lang in
  en-US, nl and de).
  
  `DateInput`'s day/month/year segment inputs get an explicit `aria-label` from
  `lang.datePicker` instead of relying on the placeholder fallback for their
  accessible name.
- 28c9445: Make `DateInput` compact and correctly aligned, robust without its stylesheet.
  
  Segment sizing. The group stretched across the whole field because
  `.date-input-row { max-width: fit-content }` only lived in `<style>` — shipped in
  `dist/quasar-components.css`, a file consumers that style themselves (via
  unocss/preset-quasar, say) never import, silently disabling every rule in the
  component. The row is now content-sized inline and each segment cap is tightened —
  `YYYY` 8ch/7ch → 4.25ch, `MM` 7ch → 3ch, `DD` 7ch/4ch → 3ch — with the
  `format`-conditional variants collapsed to one value per part. `4.25ch` not `5ch`:
  5ch is 45px at Roboto 16px, failing the consuming app's `<= 5 * 8` assertion. Caps
  stay `ch`-relative so they track the caller's font. Measured on the petboarding
  `/employee/overview` audit pages at 375px and 1440px: group 215px → 118px,
  segments 63/63/63px → 27/27/38px, no clipping and no document overflow.
  
  Separator alignment. The dash between `DD`/`MM`/`YYYY` carried
  `class="q-field__marginal"` — Quasar's full-height edge affordance for the clear
  and calendar icons — which the unocss/preset-quasar field rules style with
  `height: 56px` and `font-size: var(--q-size-icon)` (24px). On a `display: block`
  span the line box sat at the top of a 56px box, so the parent's `align-items:
  center` centred the *box* and never the glyph: the dash rendered 19px above the
  digits and at 24px against their 16px. Replace it with a `date-input-separator`
  class and inline `display: flex` + `align-items: center` + `font-size: inherit`,
  so the glyph centres in its own box and matches the digits regardless of the
  caller's font — inline rather than in `<style>`, for the same reason as above.
  Measured on `/employee/overview` at 1440px, before → after:
  
  | | control | dash glyph | digit glyph | gap | dash font |
  |---|---|---|---|---|---|
  | before | 88px | 95 | 114 | 19px | 24px |
  | after | 56px | 98 | 98 | 0 | 16px |
  
  The control height falls out of the same bug: it is `--auto-height`, so its height
  is the container's 32px padding plus the row, and the 56px span was inflating the
  row from 24 to 56 — 32 + 56 = 88 before, 32 + 24 = 56 after, landing exactly on the
  M3 standard `.q-field__control { height: 56px }`. Note this is a page-layout change
  for consumers; audit captures need re-shooting.
- d666b0c: `DateInput`'s icon defaults were Quasar material strings, not iconify names.
  
  The `icons` prop defaulted to `{ event: 'event', clear: 'clear' }`. Those are
  `@quasar/extras` material set names, and this stack resolves icons through
  iconify (`i-mdi-*`, wired via unocss-preset-quasar) with no material set loaded —
  so `q-icon` had nothing to draw and rendered the raw name as text. Consumers that
  passed `:icons` explicitly were unaffected; the ones that didn't showed the word
  **event** where the date picker's calendar glyph belongs. Visible on
  `AddPaymentDialog`, `SubscriptionForm` and `ExportsPage`.
  
  Defaults are now `i-mdi-calendar` / `i-mdi-close`, matching what the pages already
  pass by hand — so passing `icons` is optional rather than load-bearing.
- 237514b: Put `Md3Layout`'s drawer scrim on the drawer's own backdrop tier.
  
  `Md3Layout` renders its own scrim above the `sm` breakpoint when the drawer is
  expanded, because QDrawer renders *nothing* to dim or dismiss behind an expanded
  desktop drawer: its backdrop is pushed inside `if (belowBreakpoint.value)` in
  `ui/src/components/drawer/QDrawer.js`, and its `overlay` prop only feeds `offset`,
  not that branch.
  
  That scrim was pinned at `z-index: 2500`, which is above the drawer's own 1500 in
  `unocss-preset-quasar`'s ADR 0007 scale. The expanded drawer therefore sat *under*
  its own scrim and none of its items took clicks — the `nav-drift` spec could not
  expand "Administrator", and at 375px the header's controls were unreachable too.
  
  It now wears Quasar's own `fullscreen q-drawer__backdrop` classes instead of
  restating a number, so the tier comes from the same rule as the backdrop it stands
  in for (the preset emits it at `z-index: 1499 !important`) and follows the scale if
  the scale moves. Position and background stay inline, so the scrim still covers the
  viewport and dims whichever style entry is active. Behaviour and the click-to-close
  handler are unchanged.
- d666b0c: Point `NavigationRailFabs`' text utilities at tokens that exist.
  
  The FABs asked for `text-$on-light-primary-container` and
  `dark:text-$on-dark-primary-container`, but the preset defines those roles the
  other way round: `--light-on-primary-container` / `--dark-on-primary-container`
  (alongside `--light-primary-container`, `--light-on-primary`, …). Neither
  `--on-light-primary-container` nor `--on-dark-primary-container` is declared
  anywhere, so the colour declaration was invalid at computed-value time and fell
  back to `inherit` — which is what produced white text on the light
  `--light-primary-container` fill (`!bg-$light-primary-container`, which did
  resolve).
  
  The background tokens were already correct; only the two text names were wrong, in
  both the add and edit FABs.
- d666b0c: Name `ResponsiveDialog` for assistive tech
  
  A dialog carrying `role="dialog"` and `aria-modal="true"` but no accessible name is
  announced as an unnamed dialog, which leaves a screen-reader user with no idea what
  opened. `ResponsiveDialog` rendered a `#title` slot inside its toolbar and nothing
  else — no `aria-labelledby`, no `title` prop — so *every* instance was unnamed,
  including the two call sites (`BankLinkDialog`, `BankSettingsPage`) that already filled
  the slot, because the title text was never linked to the dialog element.
  
  - New optional `title` prop, rendered as `<slot name="title">{{ title }}</slot>`; the
    slot keeps winning, so existing call sites are unaffected.
  - The toolbar title gets a per-instance `id` (module-scope counter, since several
    dialogs can be mounted at once) and the dialog points `aria-labelledby` at it.
  
  Call sites that pass no `title` and fill no slot still render an unnamed dialog; the
  prop is the intended path, and slimfact's call sites now pass one.

## 0.12.11

### Patch Changes

- ea6c45b: Fix FilteredModelSelect popup not opening on mobile Chrome/PWA by calling `update()` synchronously in `filterFn` instead of inside the async `done` callback.

## 0.12.10

### Patch Changes

- 499473a: fix(DateInput): clearing all parts (clear button or manual delete) emits null instead of a stale ____-__-__ partial — required fields then report "Field is required.", and the calendar popup on a cleared field no longer passes an invalid undefined modelValue to QDate
- feat(NavigationRailFabs): expose a `rounded` prop (default false) and forward it
  to the edit and add FABs, so consumers can opt into Quasar's rounded fab styling.

## 0.12.9

### Patch Changes

- cafcfd0: fix: emit declaration types to dist/types/ui instead of dist/types/src/ui

## 0.12.8

### Patch Changes

- fa74c7c: fix: fix package.json

## 0.12.7

### Patch Changes

- ba02bc2: feat(components): decrease QStyledCard padding

## 0.12.6

### Patch Changes

- fix(components): fix DateInput input width

## 0.12.5

### Patch Changes

- d6f5de7: fix(components): fix NavigationRailFabs
- 0ec347b: fix(CronScheduleInput): remove negative-margin hack, use items-center

  Same pattern as DateInput: the old margin-top: -1.7em hack broke with
  unocss-preset-quasar updates. Replaced with:

  - items-center for proper vertical alignment
  - CSS overrides for padding leaks from q-field--labeled
  - Neutralized cascaded padding-top on inner control-containers
  - Removed horizontal padding on inner controls

- fix(DateInput): prevent DD/MM/YYYY fields from overlapping QField stack label

  Nesting QInput inside the outer QField's #control slot created a
  QField-inside-QField structure that caused padding leaks from the
  preset's q-field--labeled descendant selectors and broke with the
  unocss-preset-quasar update. Refactored to use plain `<input>`
  elements instead of nested QInput, removing the old negative-margin
  hack (-1.7em) that caused the overlap.

## 0.12.4

### Patch Changes

- a21d944: fix(components): move ready check to QLayout in Md3Layout

## 0.12.3

### Patch Changes

- ff2fc3b: fix(components): fix Md3Layout rendering

## 0.12.2

### Patch Changes

- f2f5aaa: feat: add german (de) translations

## 0.12.1

### Patch Changes

- 6987645: feat(LoginForm): add defaultCredentials prop

## 0.12.0

### Minor Changes

- 5f271e8: feat(components): use iso639, iso3166 and bcp47 for locales and add CountrySelect

## 0.11.26

### Patch Changes

- 16439cd: feat(components): add disable prop to NavigationRailFabs
- 89c6493: feat(ResponsiveDialog): use css variables for colors

## 0.11.25

### Patch Changes

- 82b94b4: fix(LocaleSelect): fix update model value

## 0.11.24

### Patch Changes

- f271caf: chore: update dependencies
- 206b679: fix: use fileURLToPath instead of pathname

## 0.11.23

### Patch Changes

- 85d1703: fix(components): DateInput use lazy-rules

## 0.11.22

### Patch Changes

- 9ef33d4: fix(components): set DateInput modelValue to null on clear

## 0.11.21

### Patch Changes

- 6dc180e: fix(components): use lower QDrawer width for small screens in Md3Layout

## 0.11.20

### Patch Changes

- 3c91d3e: fix(components): fix icons in PasswordChangeStepper

## 0.11.19

### Patch Changes

- 989f4c0: feat(components): add data-testid to AccountsTable search button
- b109c88: fix(components): remove flat from AccountsTable search button
- 3253b20: chore: update dependencies

## 0.11.18

### Patch Changes

- 4012069: fix(components): fix Md3Layout fab button slot min height

## 0.11.17

### Patch Changes

- c4a67e8: fix(components): fix DateInput margins
- f10af4e: fix(components): fix CronScheduleInput margins

## 0.11.16

### Patch Changes

- c890140: feat(components): add isItem prop to LocaleSelect

## 0.11.15

### Patch Changes

- 138a828: fix(components): fix CronScheduleInput style

## 0.11.14

### Patch Changes

- 7bc307d: fix(components): fix localeSelect selectedItems slot

## 0.11.13

### Patch Changes

- 221c1b4: chore: update dependencies

## 0.11.12

### Patch Changes

- 911f1ce: feat(components): make UserMenuButton round
- 08f4c9d: feat(components): add seekAttention prop to NavigationRailFabs
- 76e1484: fix(components): fix Md3Layout onMounted set mini state

## 0.11.11

### Patch Changes

- b684799: fix(components): fix LocaleSelect and QLanguageSelectButton
- 3de15ab: feat(components): add LogoutForm and LogoutButton
- 8a559fd: fix(components): add QField slots to DateInput

## 0.11.10

### Patch Changes

- e934bb1: feat(components): add QLanguageSelectBtn
- c5bc275: feat(components): add icon props

## 0.11.9

### Patch Changes

- 365945e: feat(QStyledCard): remove max-width

## 0.11.8

### Patch Changes

- cdb109c: feat(ResponsiveDialog): add padding prop to ResponsiveDialog
- 41749a7: fix(FormItem): add break-all class

## 0.11.7

### Patch Changes

- 5822b58: fix(components): add word-wrap to FormItem
- 0a500e8: feat(components): add closeIcon prop to ResponsiveDialog

## 0.11.6

### Patch Changes

- 16ce5f9: feat(ResourcePage): replace fab by regular buttons

## 0.11.5

### Patch Changes

- b09044f: fix(DateInput): add inputmode numeric

## 0.11.4

### Patch Changes

- 1df3ea7: feat(FilteredModelSelect): add no-option template

## 0.11.3

### Patch Changes

- 35ee659: fix: fix css export

## 0.11.2

### Patch Changes

- 56d905c: feat(PostalCodeInput): use optional country prop instead of locale

## 0.11.1

### Patch Changes

- 11d936a: fix(DateInput): add pattern attribute for numbers only input

## 0.11.0

### Minor Changes

- 7340d62: feat: add iso3166 flags and country codes

### Patch Changes

- 259240e: fix(DateInput): fix input width

## 0.10.6

### Patch Changes

- ca2f3e2: style(DateInput): fix margins

## 0.10.5

### Patch Changes

- 0143ec3: fix(FormInput): add slots
- 63313fa: fix(components): fix vue generics

## 0.10.4

### Patch Changes

- c88c7bc: feat(EmailInput): add link to toolbar

## 0.10.3

### Patch Changes

- 78e60c4: fix(QSubmitButton): set loading prop default to undefined

## 0.10.2

### Patch Changes

- e15c306: feat: add type prop to QSubmitButton

## 0.10.1

### Patch Changes

- 4ef557b: fix(ResourcePage): fix error on empty type

## 0.10.0

### Minor Changes

- a0e1496: feat(components): add CronScheduleInput

## 0.9.1

### Patch Changes

- 0bb7339: fix(FilteredModelSelect): fix fetching of missing modelValue id

## 0.9.0

### Minor Changes

- 9fe6cd0: feat: add AccountsTable component

### Patch Changes

- eec2e00: fix(DateInput): fix locale prop

## 0.8.1

### Patch Changes

- 0b24daf: feat: add fab slot to ResourcePage
- 92a0c62: feat(components): add header-side slot to ResourcePage
- c750af3: fix: fix DateInput label
- 572c7e5: feat: add label to LocaleSelect

## 0.8.0

### Minor Changes

- 050612f: Add CurrencySelect and LocaleSelect components

### Patch Changes

- d749926: chore: update package.json
- cba0aa7: chore: update package.json

## 0.7.1

### Patch Changes

- 3db27ca: fix(components): export QDrawerList

## 0.7.0

### Minor Changes

- d5eb6bf: feat(components): add QDrawerList component

## 0.6.0

### Minor Changes

- 2d54c9b: feat(components): add FilteredModelSelect component

## 0.5.7

### Patch Changes

- ba791dc: fix(components): change OTP email label

## 0.5.6

### Patch Changes

- 8cd7bb8: fix(DateInput): do not emit invalid date

## 0.5.5

### Patch Changes

- 6f8d9b9: feat: export useLang and loadLang

## 0.5.4

### Patch Changes

- d5d0975: fix(DateInput): fix style

## 0.5.3

### Patch Changes

- a908cb3: fix(PostalCodeInput): make modelValue optional

## 0.5.2

### Patch Changes

- 7799b8f: fix(DateInput): fix style

## 0.5.1

### Patch Changes

- 4d55fc8: feat(DateInput): add stack-label; fix(DateInput): set year to undefined on invalid values

## 0.5.0

### Minor Changes

- 401bf7b: feat: change DateInput to separate input fields for year, month and day
- fa4989f: feat: add autocomplete attributes to LoginForm

## 0.4.8

### Patch Changes

- e86715f: fix: make BooleanItem nullable

## 0.4.7

### Patch Changes

- ebb0c51: fix(components): export useLang in PasswordChangeStepper
- 98f6393: fix: replace .once modifier with debounce in QSubmitButton

## 0.4.6

### Patch Changes

- 255d957: fix(components): make LoginButton extend QSubmitButton

## 0.4.5

### Patch Changes

- 65b81d3: chore: change nl submit translation

## 0.4.4

### Patch Changes

- a14c1d9: fix(components): fix nl telephone number translation

## 0.4.3

### Patch Changes

- 17dbf94: refactor(components): change class attribute of ResponsiveDialog; fix(components): fix BooleanSelect validation

## 0.4.2

### Patch Changes

- 7e6d8ea: fix(components): add DateInput placeholder translation and set null on empty value

## 0.4.1

### Patch Changes

- a1de056: fix(components): fix DatePicker undefined value

## 0.4.0

### Minor Changes

- 9eb34b3: feat(components): add DatePicker component

## 0.3.7

### Patch Changes

- 34a81e2: fix: allow null as modelValue for BooleanSelect

## 0.3.6

### Patch Changes

- 4a79340: feat(components): add disableOther prop to GenderSelect; fix(components): fix null date validation in DateInput

## 0.3.5

### Patch Changes

- b18d3a5: Update dependencies
- ff2ee82: fix(components): fix date input validation

## 0.3.4

### Patch Changes

- 7f5b036: fix(components): await loadLang in GenderSelect

## 0.3.3

### Patch Changes

- e1538f5: fix(components): make genderOptions reactive; fix(components): make booleanOptions reactive

## 0.3.2

### Patch Changes

- cb84832: fix(components): LoginComponent: set text color of password forgot and create account buttons to primary

## 0.3.1

### Patch Changes

- 6d98116: fix: fix BooleanSelect input validation

## 0.3.0

### Minor Changes

- 1bc095c: feat: add EmailInput component

### Patch Changes

- 3961b33: Rename surname to lastName
- ea7443f: fix(ResponsiveDialog): replace modelValue with methods so that it is compatible with the persistent prop

## 0.2.0

### Minor Changes

- 91eb0e9: Components update

## 0.1.3

### Patch Changes

- 0926b41: Bind submit button to forms

## 0.1.2

### Patch Changes

- 5bdc2d0: Trim email in EmailChange and RequestOtp forms

## 0.1.1

### Patch Changes

- 42ecef6: Trim email and username fields
- 5e00c31: Ignore test in components package.json

## 0.1.0

### Minor Changes

- 62f9629: Release
