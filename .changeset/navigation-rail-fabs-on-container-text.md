---
'@simsustech/quasar-components': patch
---

Point `NavigationRailFabs`' text utilities at tokens that exist.

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
