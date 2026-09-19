---
"@simsustech/quasar-components": patch
---

Fix FilteredModelSelect popup not opening on mobile Chrome/PWA by calling `update()` synchronously in `filterFn` instead of inside the async `done` callback.
