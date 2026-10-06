---
'@simsustech/quasar-components': patch
---

fix(components): let QStyledCard fill its container instead of capping at 300px

`QStyledCard` carried an unconditional inline `style="max-width: 300px; padding: 2px"` on its
`q-card` root. Inline style beats any class, so a consumer placing the card in a grid column
(`col-12 col-md-4` → 445px at 1440) still got a 300px card: petboarding's pets, contact-people
and account grids rendered content-hugging cards with the columns and gutters never filling, and
the card's sections sat behind an extra 2px inset on top of Quasar's own padding.

The cap and the padding are gone; width now comes from the container (grid classes, the parent's
width, or nothing at all for a standalone card), and sections use Quasar's stock padding.
