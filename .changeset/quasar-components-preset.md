---
'@simsustech/quasar-components-preset': minor
---

feat(preset): add `@simsustech/quasar-components-preset`

A UnoCSS preset for the kit that carries only what a scan cannot produce: the
rules whose selectors have to reach into Quasar's own markup. There is no class
list to install, and no `@simsustech/quasar-components-preset/css`.

The kit marks every emitted chunk with `/* @unocss-include */`
(`unocssIncludePlugin` in `packages/components/vite.config.ts`). UnoCSS skips
`.js` by default and checks that comment before its pipeline filter, so a
consumer's own extractor reads the chunks it imports — the same extractor that
reads the consumer's sources. A class added to a template appears in the sheet on
the next build, a subpath the app never imports costs no CSS, and nothing has to
be regenerated or kept in step.

What the preset does carry is a rule per component whose styling targets Quasar's
internals (`QDrawerList`'s avatar and expansion content, `DateInput`'s native
inputs, `QTelephoneNumber`'s dial-code select, `CronScheduleInput`'s row). The
descendant part of each selector is built from `symbols.selector`, keyed on the
plain root class the component writes (`<q-list class="q-drawer-list">`). Those
rules cannot be utilities: one styles only the element carrying it, and the
variant form is not portable — `presetWind4` reads the `--` in
`[&_.q-item\_\_section--avatar]` as a custom property and emits
`.q-item__sectionvar(--avatar)`, which lightningcss rejects with
`Expected identifier in class selector`, stopping a consumer's build.

`pnpm -C packages/preset run check` verifies the two properties a scan cannot:
that no template writes an arbitrary variant carrying `--`, and that each rules
block names a component that exists and writes the class it keys on, with every
selector continuing that class.
