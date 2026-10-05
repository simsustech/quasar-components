---
'@simsustech/quasar-components': patch
---

`DateInput` segment placeholders stay visible under preset CSS

The segment inputs are raw `<input class="q-field__native">` elements without
Quasar's `q-placeholder` class, so a stylesheet that hides `::placeholder`
unconditionally drops their YYYY/MM/DD hints — reported on petboarding's
`PetForm`, where all three segments rendered no hint text. Reproduced on the
harness fixture (2026-10-05): the segment inputs computed `rgba(0, 0, 0, 0)`.
The scoped rule gives them `--q-on-surface-variant` at 0.6 when a theme
defines the token, inheriting the input's own colour otherwise (stock Quasar
consumers).
