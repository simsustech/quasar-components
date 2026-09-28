---
'@simsustech/quasar-components': patch
---

Make `DateInput` compact and correctly aligned, robust without its stylesheet.

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
