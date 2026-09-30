---
'@simsustech/quasar-components': patch
---

`DateInput`'s icon defaults were Quasar material strings, not iconify names.

The `icons` prop defaulted to `{ event: 'event', clear: 'clear' }`. Those are
`@quasar/extras` material set names, and this stack resolves icons through
iconify (`i-mdi-*`, wired via unocss-preset-quasar) with no material set loaded —
so `q-icon` had nothing to draw and rendered the raw name as text. Consumers that
passed `:icons` explicitly were unaffected; the ones that didn't showed the word
**event** where the date picker's calendar glyph belongs. Visible on
`AddPaymentDialog`, `SubscriptionForm` and `ExportsPage`.

Defaults are now `i-mdi-calendar` / `i-mdi-close`, matching what the pages already
pass by hand — so passing `icons` is optional rather than load-bearing.
