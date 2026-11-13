---
'@simsustech/quasar-components': patch
---

**The bubble follows an edited field, and the address echo stops looping.**
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
