import type { Rule, RuleContext } from 'unocss'

/**
 * The kit's own rules: selectors that have to reach *into* Quasar's markup from
 * an element the component renders.
 *
 * A utility styles the element that carries it and nothing else, and an
 * arbitrary variant cannot express these selectors: `presetWind4` reads the `--`
 * inside one as a custom property, so `[&_.q-item\_\_section--avatar]` becomes
 * `.q-item__sectionvar(--avatar)` and lightningcss refuses the sheet
 * (`Expected identifier in class selector`). Quasar's class names are full of
 * `--` — `q-item__section--avatar`, `q-field--standard`,
 * `q-expansion-item--expanded` — so the variant form is unusable for this kit.
 *
 * Instead each block is a rule keyed on the plain root class the component
 * writes (`QDrawerList` renders `<q-list class="q-drawer-list">`), and the
 * descendant part of the selector is built with `symbols.selector`, which is how
 * a preset rule restyles elements it does not own (the same mechanism as
 * `unocss-preset-quasar`, `packages/preset/src/components/avatar/rules.ts`).
 * The class no engine can mangle, and the rule exists while the class is a
 * candidate — which the safelist the templates already produce guarantees.
 *
 * `scripts/generate.mjs` checks that every block names a component that exists
 * and writes the class it keys on, so a renamed root fails the build instead of
 * silently losing its styles.
 */
export interface ComponentRules {
  /** Path under `packages/components/src/ui`, e.g. `general/QDrawerList.vue`. */
  component: string
  /** The plain class the template puts on the element these rules qualify. */
  className: string
  rules: Rule[]
}

/** form/DateInput.vue — parts are plain <input class="q-field__native"> inside a QField. */
const dateInputRules: Rule[] = [
  [
    /^date-input-field$/,
    function* (_match: RegExpMatchArray, { symbols }: Readonly<RuleContext>) {
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector}.q-field--auto-height.q-field--labeled .q-field__native`,
        'padding-bottom': '0 !important',
        'box-sizing': 'border-box'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector}.q-field--standard > .q-field__inner > .q-field__control::before`,
        'border-bottom': 'none'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector}.q-field--standard > .q-field__inner > .q-field__control::after`,
        display: 'none'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-field__native::placeholder`,
        color: 'var(--q-on-surface-variant, inherit)',
        opacity: '0.6'
      }
    }
  ]
]

/**
 * phone/QTelephoneNumber.vue — the dial-code QSelect sits in the input's
 * `#prepend` slot and has to read as part of the value line: no resting
 * underline of its own, and the append arrow parked on the value line.
 */
const phoneDialRules: Rule[] = [
  [
    /^phone-dial-select$/,
    function* (_match: RegExpMatchArray, { symbols }: Readonly<RuleContext>) {
      // A floor, so the select does not collapse to nothing beside the number.
      yield {
        [symbols.selector]: (selector: string) => `${selector}`,
        'min-width': '13ch'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-field__control::before`,
        content: 'none'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-field__control::after`,
        content: 'none'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-field__append`,
        height: '1.5rem',
        'align-self': 'flex-end',
        'margin-bottom': '0.5rem'
      }
    }
  ]
]

/**
 * phone/QTelephoneNumber.vue — the chip that shows the selected dial code. The
 * gap between the flag and the code stays `q-mr-xs` in the template: that is the
 * design system's spacing step, not a utility this rule should restate.
 */
const phoneChipRules: Rule[] = [
  [
    /^phone-dial-code$/,
    function* (_match: RegExpMatchArray, { symbols }: Readonly<RuleContext>) {
      yield {
        [symbols.selector]: (selector: string) => `${selector}`,
        display: 'inline-flex',
        'align-items': 'center',
        'white-space': 'nowrap'
      }
    }
  ]
]

/**
 * general/QDrawerList.vue — a slot-driven QList, so the avatar, expansion content
 * and toggle icons belong to Quasar, not here. The `!important`s are the `!` the
 * utilities carried: a nested expansion's indentation has to beat the outer
 * level's.
 */
const drawerListRules: Rule[] = [
  [
    /^q-drawer-list$/,
    function* (_match: RegExpMatchArray, { symbols }: Readonly<RuleContext>) {
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-item__section--avatar`,
        color: 'var(--q-primary)',
        'min-width': '28px',
        'padding-right': '12px'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-expansion-item__content`,
        'margin-left': '18px',
        'padding-left': '4px',
        'border-left': '1px solid rgba(0, 0, 0, 0.5)'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-expansion-item__content .q-expansion-item__content`,
        'margin-left': '26px !important',
        'padding-left': '2px !important'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-expansion-item__content .q-expansion-item__content .q-item`,
        'padding-left': '16px !important',
        'margin-left': '2px'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-expansion-item__toggle-icon`,
        color: '#bdbdbd'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-expansion-item--expanded > div > .q-item > .q-item__section--main`,
        color: 'var(--q-primary)'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-expansion-item--expanded > div > .q-item > .q-item__section--side .q-expansion-item__toggle-icon`,
        color: 'var(--q-primary)'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .q-drawer-list__deep-expansion > .q-expansion-item__container > .q-item .q-item__section--avatar`,
        'min-width': '16px',
        'padding-left': '8px',
        'padding-right': '0'
      }
    }
  ]
]

/**
 * form/CronScheduleInput.vue — each part is a QSelect, so the row has to strip the
 * field chrome Quasar gives every one of them (the row is the input). The height
 * is the value line of a labelled field, so it follows the consumer's density.
 */
const cronInputRules: Rule[] = [
  [
    /^cron-input-row$/,
    function* (_match: RegExpMatchArray, { symbols }: Readonly<RuleContext>) {
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .cron-input-part.q-field .q-field__control-container`,
        'padding-top': '0 !important'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .cron-input-part.q-field .q-field__control`,
        height:
          'max(24px, calc(var(--q-comp-lg, 56px) - var(--q-field-labeled-padding-top, 24px)))',
        'min-height': '0',
        'padding-inline': '0',
        'background-color': 'transparent'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .cron-input-part.q-field .q-field__control::before`,
        content: 'none'
      }
      yield {
        [symbols.selector]: (selector: string) =>
          `${selector} .cron-input-part.q-field .q-field__control::after`,
        content: 'none'
      }
    }
  ]
]

/**
 * location/QLocation.vue — the map and its overlays.
 *
 * One block keyed on the root the component writes, with every part reached by a
 * descendant: the bubble used to be 345 characters of class on one line, and the
 * four elements beside it carried the leftovers of the same styling.
 */
const locationRules: Rule[] = [
  [
    /^q-location$/,
    function* (_match: RegExpMatchArray, { symbols }: Readonly<RuleContext>) {
      const part = (suffix: string) => (selector: string) =>
        `${selector} ${suffix}`

      yield {
        [symbols.selector]: part('.q-location__address'),
        'margin-bottom': '12px'
      }
      yield {
        [symbols.selector]: part('.q-location__expand'),
        'margin-bottom': '12px'
      }
      yield {
        [symbols.selector]: part('.q-location__map'),
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }
      yield {
        [symbols.selector]: part('.q-location__canvas-placeholder'),
        position: 'absolute',
        inset: '0',
        'z-index': '30',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        padding: '1rem',
        'pointer-events': 'none',
        'text-align': 'center',
        'font-size': '0.875rem',
        'line-height': '1.25rem',
        background: 'var(--q-surface-variant, #e2e1ec)'
      }
      yield {
        [symbols.selector]: part('.q-location__canvas-placeholder--error'),
        color: 'var(--q-negative, #c10015)'
      }
      yield {
        [symbols.selector]: part('.q-location__search'),
        position: 'absolute',
        top: '0.5rem',
        left: '0.5rem',
        'z-index': '20',
        'border-radius': '4px',
        width: 'min(320px, calc(100% - 72px))',
        background: 'var(--q-card, #fff)'
      }
      yield {
        [symbols.selector]: part('.q-location__bubble'),
        position: 'absolute',
        'z-index': '20',
        display: 'flex',
        'align-items': 'flex-start',
        gap: '2px',
        'max-width': 'min(280px, calc(100% - 16px))',
        padding: '4px 4px 4px 8px',
        'border-radius': '4px',
        background: 'var(--q-surface, var(--q-card, #fff))',
        color: 'var(--q-on-surface, #1d1d1d)',
        'box-shadow': '0 1px 4px rgba(0, 0, 0, 0.25)',
        'font-size': '13px',
        'line-height': '1.4',
        'pointer-events': 'none',
        transform: 'translate(-50%, -100%)'
      }
      yield {
        [symbols.selector]: part('.q-location__bubble-text'),
        'padding-top': '2px'
      }
      yield {
        [symbols.selector]: part('.q-location__bubble-close'),
        flex: 'none',
        'margin-left': '2px',
        padding: '0 4px',
        'border-width': '0',
        background: 'transparent',
        color: 'inherit',
        font: 'inherit',
        'line-height': '1.2',
        cursor: 'pointer',
        // The bubble is click-through, so its only control opts back in.
        'pointer-events': 'auto'
      }
      yield {
        [symbols.selector]: part('.q-location__attribution'),
        position: 'absolute',
        'z-index': '20',
        right: '0.5rem',
        bottom: '0.5rem',
        display: 'flex',
        'flex-wrap': 'wrap',
        'align-items': 'baseline',
        gap: '0 4px',
        'max-width': 'calc(100% - 16px)',
        padding: '1px 6px',
        'border-radius': '0.125rem',
        background: 'var(--q-surface, var(--q-card, #fff))',
        color: 'var(--q-on-surface, #1d1d1d)',
        'font-size': '11px',
        'line-height': '1.5'
      }
      yield {
        [symbols.selector]: part('.q-location__attribution a'),
        color: 'inherit',
        'text-decoration-line': 'underline'
      }
      yield {
        [symbols.selector]: part('.q-location__anchor'),
        position: 'absolute',
        width: '0',
        height: '0',
        'pointer-events': 'none'
      }
    }
  ],
  [
    // The context menu is teleported out of the location tree by QMenu, so it
    // cannot be reached from the root: it is keyed on its own class.
    /^q-location__menu$/,
    function* (_match: RegExpMatchArray, { symbols }: Readonly<RuleContext>) {
      yield {
        [symbols.selector]: (selector: string) => `${selector}`,
        'min-width': '200px'
      }
    }
  ]
]

/**
 * location/QLocationAddress.vue — the card: a column of fields, and the row that
 * holds house number, postcode, city and country.
 */
const locationAddressRules: Rule[] = [
  [
    /^q-location-address$/,
    function* (_match: RegExpMatchArray, { symbols }: Readonly<RuleContext>) {
      const part = (suffix: string) => (selector: string) =>
        `${selector} ${suffix}`

      yield {
        [symbols.selector]: (selector: string) => `${selector}`,
        display: 'flex',
        'flex-direction': 'column',
        gap: '0.5rem'
      }
      yield {
        [symbols.selector]: part('.q-location-address__row'),
        display: 'grid',
        width: '100%',
        gap: '0.5rem',
        'grid-template-columns': 'repeat(auto-fit, minmax(140px, 1fr))'
      }
      yield {
        [symbols.selector]: part('.q-location-address__house-number'),
        'max-width': '10rem'
      }
    }
  ]
]

export const componentRuleSets: ComponentRules[] = [
  {
    component: 'form/DateInput.vue',
    className: 'date-input-field',
    rules: dateInputRules
  },
  {
    component: 'phone/QTelephoneNumber.vue',
    className: 'phone-dial-select',
    rules: phoneDialRules
  },
  {
    component: 'general/QDrawerList.vue',
    className: 'q-drawer-list',
    rules: drawerListRules
  },
  {
    component: 'form/CronScheduleInput.vue',
    className: 'cron-input-row',
    rules: cronInputRules
  },
  {
    component: 'phone/QTelephoneNumber.vue',
    className: 'phone-dial-code',
    rules: phoneChipRules
  },
  {
    component: 'location/QLocation.vue',
    className: 'q-location',
    rules: locationRules
  },
  {
    component: 'location/QLocationAddress.vue',
    className: 'q-location-address',
    rules: locationAddressRules
  }
]

/** Flat list for the preset, in the order the components are listed above. */
export const componentRules: Rule[] = componentRuleSets.flatMap(
  (set) => set.rules
)
