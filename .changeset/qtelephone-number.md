---
'@simsustech/quasar-components': minor
---

feat(components): add QTelephoneNumber and the `./phone` subexport

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
