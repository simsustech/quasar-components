---
'@simsustech/quasar-components': patch
---

**The picked street is a value again, not a label.** `QSelect` with `use-input`
and no `fill-input` moves the selected option's text into a sibling
`<span class="q-select__selected-value">` and leaves the real `<input>` empty, so
the address card showed a street that was not in the field: Ctrl+A selected
nothing, Home/End did nothing, and typing started a fresh query instead of
editing the address that was there. `QLocationSearch` now sets `fill-input`
(the label stays in the input) and `hide-selected` (Quasar otherwise renders the
same label twice, once in the input and once in that span); the map overlay's
search box has no model value, so nothing changes for it.
