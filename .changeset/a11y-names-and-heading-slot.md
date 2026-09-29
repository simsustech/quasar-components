---
'@simsustech/quasar-components': patch
---

Accessible names: a `heading` slot for `Md3Layout`, named row menus, named date segments.

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
