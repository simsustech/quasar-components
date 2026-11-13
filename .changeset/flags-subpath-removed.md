---
'@simsustech/quasar-components': minor
---

**The `./flags` subpath is gone, and flags are icon classes.** It shipped 252 SVG
files, 252 generated components and a language module — 1.3 MB — to render a flag
per country, and nothing but the dev app's own demo imported it. `CountrySelect`,
`LocaleSelect` and `QTelephoneNumber` already take the flag as an icon name from
the caller, so the supported path is the one the consumers use: pass
`i-flagpack-nl` (or `i-flag-*`, or an `img:` URL) and let UnoCSS's `presetIcons`
resolve it from the icon collection in your app.

Removing a subpath is breaking: `import ... from '@simsustech/quasar-components/flags'`
has no replacement, and `@iconify-json/flagpack` moves from this package's
dependencies to the app that renders flags — the quote site already has it.
