import type { Preset } from 'unocss'
import { componentRules } from './rules.js'

/**
 * The components kit's UnoCSS preset: the handful of rules a utility cannot
 * write.
 *
 * It carries **no class list**. The kit's build marks every emitted chunk with
 * the `@unocss-include` magic comment (`unocssIncludePlugin` in
 * `packages/components/vite.config.ts`), which is how a package opts into a
 * consumer's scan: UnoCSS's pipeline filter rejects `.js` by default, and the
 * comment is consulted before the filter (`filter()` in `@unocss/vite`). So the
 * consumer's own extractor reads the chunks it imports — the same mechanism that
 * gives it the consumer's own sources — and a class added to a template appears
 * in the sheet on the next build. A subpath the app never imports costs no CSS,
 * because its chunk is never in the graph.
 *
 * What is left for the preset is the styling a utility cannot express: rules
 * that reach *into* Quasar's markup from an element a component renders
 * (`q-item__section--avatar` in a drawer list, the native parts of a date field,
 * the field chrome of the phone and cron inputs). A utility styles only the
 * element that carries it, and the variant form of those selectors is not
 * portable: `presetWind4` reads the `--` in `[&_.q-item\_\_section--avatar]` as a
 * custom property and emits `.q-item__sectionvar(--avatar)`, which lightningcss
 * rejects. Those rules are keyed on the plain root class the component writes,
 * with the descendant selector built from `symbols.selector` — see
 * `src/rules.ts`.
 *
 * The one stylesheet the kit needs and cannot write as utilities is MapLibre's,
 * and it is imported by the `./location` subpath that needs it, kept external in
 * the build so the consumer's bundler resolves it from the kit's own dependency.
 */
export function quasarComponentsPreset(): Preset {
  return {
    name: 'quasar-components',
    rules: componentRules
  }
}

export { componentRuleSets, componentRules } from './rules.js'
export type { ComponentRules } from './rules.js'
