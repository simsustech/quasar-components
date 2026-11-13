---
'@simsustech/quasar-components': minor
---

refactor(components): ship no CSS — every component styles itself with utilities

The kit's nine `<style>` blocks are gone, so there is no stylesheet left to
import:

```diff
-import '@simsustech/quasar-components/css'
+// nothing: add `quasarComponentsPreset()` to your UnoCSS config
```

Each rule is now a utility on the element the component's own template renders.
A consumer's UnoCSS scan skips `.js` by default, so every emitted chunk carries
`/* @unocss-include */` (`unocssIncludePlugin`): the consumer's own extractor
reads the chunks it imports, and there is no class list to install or keep in
step. Every selector the kit writes was already namespaced and nothing used
`:deep()`.

Rules that reach Quasar's internals — `.q-field__control`, `.q-item__section--avatar`,
`.q-drawer__content` — became arbitrary variants on the nearest element the
template owns (`[&_.q-field\_\_append]:h-6`,
`[&.q-drawer--on-top.q-drawer--top-padding_.q-drawer\_\_content]:!pt-0`), so
specificity is still the stylesheet's and Quasar's own rules are still overridden.
The ones whose selector carries a `--` (`q-item__section--avatar`,
`q-field--standard`, `q-expansion-item--expanded` — `DateInput`'s internals and
`QDrawerList`'s whole menu) cannot be written that way: `presetWind4` reads the
`--` as a custom property and emits `.q-item__sectionvar(--avatar)`, which
lightningcss refuses to minify. Those moved to `@simsustech/quasar-components-preset` as rules keyed on the
root class the component writes, so nothing in a template can be mangled by an
engine: `QDrawerList`, `DateInput`, `QTelephoneNumber` and `CronScheduleInput`
carry no arbitrary variant at all.

One sheet cannot be written as utilities: MapLibre's. `./location` imports
`maplibre-gl/dist/maplibre-gl.css` and the build lists that exact specifier in
`rollupOptions.external`, so `dist/location.js` keeps the import instead of
vite's lib mode extracting it into an unexported `dist/style.css`; the
consumer's bundler resolves it from the kit's own dependency, in the version the
kit was built against.

Measured consequence: `pnpm -C packages/components build` emits no CSS asset at
all, `grep maplibre-gl/dist/maplibre-gl.css packages/components/dist/location.js`
matches, and `packages/dev` — which runs `presetWind3()` + `quasarComponentsPreset()`
and imports no stylesheet — renders the same computed styles on the date field,
the cron field, the drawer list and the map's controls before and after the
conversion. Under `presetWind4` the generated sheet has 0 mangled selectors and
survives lightningcss, which it did not before this change.
