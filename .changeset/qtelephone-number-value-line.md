---
'@simsustech/quasar-components': patch
'@simsustech/quasar-components-preset': patch
---

**`QTelephoneNumber`'s prepend is on the field's value line.** The dial code,
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
