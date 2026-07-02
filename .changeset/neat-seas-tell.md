---
'@simsustech/quasar-components': patch
---

fix(DateInput): prevent DD/MM/YYYY fields from overlapping QField stack label

Nesting QInput inside the outer QField's #control slot created a
QField-inside-QField structure that caused padding leaks from the
preset's q-field--labeled descendant selectors and broke with the
unocss-preset-quasar update. Refactored to use plain `<input>`
elements instead of nested QInput, removing the old negative-margin
hack (-1.7em) that caused the overlap.
