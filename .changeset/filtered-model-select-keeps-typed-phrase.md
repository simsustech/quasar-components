---
'@simsustech/quasar-components': patch
---

fix(components): stop FilteredModelSelect discarding the typed phrase

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
