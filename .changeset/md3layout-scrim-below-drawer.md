---
'@simsustech/quasar-components': patch
---

Put `Md3Layout`'s drawer scrim on the drawer's own backdrop tier.

`Md3Layout` renders its own scrim above the `sm` breakpoint when the drawer is
expanded, because QDrawer renders *nothing* to dim or dismiss behind an expanded
desktop drawer: its backdrop is pushed inside `if (belowBreakpoint.value)` in
`ui/src/components/drawer/QDrawer.js`, and its `overlay` prop only feeds `offset`,
not that branch.

That scrim was pinned at `z-index: 2500`, which is above the drawer's own 1500 in
`unocss-preset-quasar`'s ADR 0007 scale. The expanded drawer therefore sat *under*
its own scrim and none of its items took clicks — the `nav-drift` spec could not
expand "Administrator", and at 375px the header's controls were unreachable too.

It now wears Quasar's own `fullscreen q-drawer__backdrop` classes instead of
restating a number, so the tier comes from the same rule as the backdrop it stands
in for (the preset emits it at `z-index: 1499 !important`) and follows the scale if
the scale moves. Position and background stay inline, so the scrim still covers the
viewport and dims whichever style entry is active. Behaviour and the click-to-close
handler are unchanged.
