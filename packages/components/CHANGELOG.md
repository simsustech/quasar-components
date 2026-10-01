# @simsustech/quasar-components

## 0.12.12

### Patch Changes

- 237514b: Accessible names: a `heading` slot for `Md3Layout`, named row menus, named date segments.
  
  `Md3Layout` gains a `heading` slot inside `q-page-container` (before the
  `router-view`), so a consumer can place exactly one `<h1>` per routed page in
  the main landmark instead of duplicating the header title in content.
  
  `AccountsTable`'s row ⋮ button now carries an accessible name built from the
  new `lang.moreOptions` key plus the row's identity (`name ?? email`) — "More
  options" alone does not say *which* row (added to the authentication lang in
  en-US, nl and de).
  
  `DateInput`'s day/month/year segment inputs get an explicit `aria-label` from
  `lang.datePicker` instead of relying on the placeholder fallback for their
  accessible name.
- 28c9445: Make `DateInput` compact and correctly aligned, robust without its stylesheet.
  
  Segment sizing. The group stretched across the whole field because
  `.date-input-row { max-width: fit-content }` only lived in `<style>` — shipped in
  `dist/quasar-components.css`, a file consumers that style themselves (via
  unocss/preset-quasar, say) never import, silently disabling every rule in the
  component. The row is now content-sized inline and each segment cap is tightened —
  `YYYY` 8ch/7ch → 4.25ch, `MM` 7ch → 3ch, `DD` 7ch/4ch → 3ch — with the
  `format`-conditional variants collapsed to one value per part. `4.25ch` not `5ch`:
  5ch is 45px at Roboto 16px, failing the consuming app's `<= 5 * 8` assertion. Caps
  stay `ch`-relative so they track the caller's font. Measured on the petboarding
  `/employee/overview` audit pages at 375px and 1440px: group 215px → 118px,
  segments 63/63/63px → 27/27/38px, no clipping and no document overflow.
  
  Separator alignment. The dash between `DD`/`MM`/`YYYY` carried
  `class="q-field__marginal"` — Quasar's full-height edge affordance for the clear
  and calendar icons — which the unocss/preset-quasar field rules style with
  `height: 56px` and `font-size: var(--q-size-icon)` (24px). On a `display: block`
  span the line box sat at the top of a 56px box, so the parent's `align-items:
  center` centred the *box* and never the glyph: the dash rendered 19px above the
  digits and at 24px against their 16px. Replace it with a `date-input-separator`
  class and inline `display: flex` + `align-items: center` + `font-size: inherit`,
  so the glyph centres in its own box and matches the digits regardless of the
  caller's font — inline rather than in `<style>`, for the same reason as above.
  Measured on `/employee/overview` at 1440px, before → after:
  
  | | control | dash glyph | digit glyph | gap | dash font |
  |---|---|---|---|---|---|
  | before | 88px | 95 | 114 | 19px | 24px |
  | after | 56px | 98 | 98 | 0 | 16px |
  
  The control height falls out of the same bug: it is `--auto-height`, so its height
  is the container's 32px padding plus the row, and the 56px span was inflating the
  row from 24 to 56 — 32 + 56 = 88 before, 32 + 24 = 56 after, landing exactly on the
  M3 standard `.q-field__control { height: 56px }`. Note this is a page-layout change
  for consumers; audit captures need re-shooting.
- d666b0c: `DateInput`'s icon defaults were Quasar material strings, not iconify names.
  
  The `icons` prop defaulted to `{ event: 'event', clear: 'clear' }`. Those are
  `@quasar/extras` material set names, and this stack resolves icons through
  iconify (`i-mdi-*`, wired via unocss-preset-quasar) with no material set loaded —
  so `q-icon` had nothing to draw and rendered the raw name as text. Consumers that
  passed `:icons` explicitly were unaffected; the ones that didn't showed the word
  **event** where the date picker's calendar glyph belongs. Visible on
  `AddPaymentDialog`, `SubscriptionForm` and `ExportsPage`.
  
  Defaults are now `i-mdi-calendar` / `i-mdi-close`, matching what the pages already
  pass by hand — so passing `icons` is optional rather than load-bearing.
- 237514b: Put `Md3Layout`'s drawer scrim on the drawer's own backdrop tier.
  
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
- d666b0c: Point `NavigationRailFabs`' text utilities at tokens that exist.
  
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
- d666b0c: Name `ResponsiveDialog` for assistive tech
  
  A dialog carrying `role="dialog"` and `aria-modal="true"` but no accessible name is
  announced as an unnamed dialog, which leaves a screen-reader user with no idea what
  opened. `ResponsiveDialog` rendered a `#title` slot inside its toolbar and nothing
  else — no `aria-labelledby`, no `title` prop — so *every* instance was unnamed,
  including the two call sites (`BankLinkDialog`, `BankSettingsPage`) that already filled
  the slot, because the title text was never linked to the dialog element.
  
  - New optional `title` prop, rendered as `<slot name="title">{{ title }}</slot>`; the
    slot keeps winning, so existing call sites are unaffected.
  - The toolbar title gets a per-instance `id` (module-scope counter, since several
    dialogs can be mounted at once) and the dialog points `aria-labelledby` at it.
  
  Call sites that pass no `title` and fill no slot still render an unnamed dialog; the
  prop is the intended path, and slimfact's call sites now pass one.

## 0.12.11

### Patch Changes

- ea6c45b: Fix FilteredModelSelect popup not opening on mobile Chrome/PWA by calling `update()` synchronously in `filterFn` instead of inside the async `done` callback.

## 0.12.10

### Patch Changes

- 499473a: fix(DateInput): clearing all parts (clear button or manual delete) emits null instead of a stale ____-__-__ partial — required fields then report "Field is required.", and the calendar popup on a cleared field no longer passes an invalid undefined modelValue to QDate
- feat(NavigationRailFabs): expose a `rounded` prop (default false) and forward it
  to the edit and add FABs, so consumers can opt into Quasar's rounded fab styling.

## 0.12.9

### Patch Changes

- cafcfd0: fix: emit declaration types to dist/types/ui instead of dist/types/src/ui

## 0.12.8

### Patch Changes

- fa74c7c: fix: fix package.json

## 0.12.7

### Patch Changes

- ba02bc2: feat(components): decrease QStyledCard padding

## 0.12.6

### Patch Changes

- fix(components): fix DateInput input width

## 0.12.5

### Patch Changes

- d6f5de7: fix(components): fix NavigationRailFabs
- 0ec347b: fix(CronScheduleInput): remove negative-margin hack, use items-center

  Same pattern as DateInput: the old margin-top: -1.7em hack broke with
  unocss-preset-quasar updates. Replaced with:

  - items-center for proper vertical alignment
  - CSS overrides for padding leaks from q-field--labeled
  - Neutralized cascaded padding-top on inner control-containers
  - Removed horizontal padding on inner controls

- fix(DateInput): prevent DD/MM/YYYY fields from overlapping QField stack label

  Nesting QInput inside the outer QField's #control slot created a
  QField-inside-QField structure that caused padding leaks from the
  preset's q-field--labeled descendant selectors and broke with the
  unocss-preset-quasar update. Refactored to use plain `<input>`
  elements instead of nested QInput, removing the old negative-margin
  hack (-1.7em) that caused the overlap.

## 0.12.4

### Patch Changes

- a21d944: fix(components): move ready check to QLayout in Md3Layout

## 0.12.3

### Patch Changes

- ff2fc3b: fix(components): fix Md3Layout rendering

## 0.12.2

### Patch Changes

- f2f5aaa: feat: add german (de) translations

## 0.12.1

### Patch Changes

- 6987645: feat(LoginForm): add defaultCredentials prop

## 0.12.0

### Minor Changes

- 5f271e8: feat(components): use iso639, iso3166 and bcp47 for locales and add CountrySelect

## 0.11.26

### Patch Changes

- 16439cd: feat(components): add disable prop to NavigationRailFabs
- 89c6493: feat(ResponsiveDialog): use css variables for colors

## 0.11.25

### Patch Changes

- 82b94b4: fix(LocaleSelect): fix update model value

## 0.11.24

### Patch Changes

- f271caf: chore: update dependencies
- 206b679: fix: use fileURLToPath instead of pathname

## 0.11.23

### Patch Changes

- 85d1703: fix(components): DateInput use lazy-rules

## 0.11.22

### Patch Changes

- 9ef33d4: fix(components): set DateInput modelValue to null on clear

## 0.11.21

### Patch Changes

- 6dc180e: fix(components): use lower QDrawer width for small screens in Md3Layout

## 0.11.20

### Patch Changes

- 3c91d3e: fix(components): fix icons in PasswordChangeStepper

## 0.11.19

### Patch Changes

- 989f4c0: feat(components): add data-testid to AccountsTable search button
- b109c88: fix(components): remove flat from AccountsTable search button
- 3253b20: chore: update dependencies

## 0.11.18

### Patch Changes

- 4012069: fix(components): fix Md3Layout fab button slot min height

## 0.11.17

### Patch Changes

- c4a67e8: fix(components): fix DateInput margins
- f10af4e: fix(components): fix CronScheduleInput margins

## 0.11.16

### Patch Changes

- c890140: feat(components): add isItem prop to LocaleSelect

## 0.11.15

### Patch Changes

- 138a828: fix(components): fix CronScheduleInput style

## 0.11.14

### Patch Changes

- 7bc307d: fix(components): fix localeSelect selectedItems slot

## 0.11.13

### Patch Changes

- 221c1b4: chore: update dependencies

## 0.11.12

### Patch Changes

- 911f1ce: feat(components): make UserMenuButton round
- 08f4c9d: feat(components): add seekAttention prop to NavigationRailFabs
- 76e1484: fix(components): fix Md3Layout onMounted set mini state

## 0.11.11

### Patch Changes

- b684799: fix(components): fix LocaleSelect and QLanguageSelectButton
- 3de15ab: feat(components): add LogoutForm and LogoutButton
- 8a559fd: fix(components): add QField slots to DateInput

## 0.11.10

### Patch Changes

- e934bb1: feat(components): add QLanguageSelectBtn
- c5bc275: feat(components): add icon props

## 0.11.9

### Patch Changes

- 365945e: feat(QStyledCard): remove max-width

## 0.11.8

### Patch Changes

- cdb109c: feat(ResponsiveDialog): add padding prop to ResponsiveDialog
- 41749a7: fix(FormItem): add break-all class

## 0.11.7

### Patch Changes

- 5822b58: fix(components): add word-wrap to FormItem
- 0a500e8: feat(components): add closeIcon prop to ResponsiveDialog

## 0.11.6

### Patch Changes

- 16ce5f9: feat(ResourcePage): replace fab by regular buttons

## 0.11.5

### Patch Changes

- b09044f: fix(DateInput): add inputmode numeric

## 0.11.4

### Patch Changes

- 1df3ea7: feat(FilteredModelSelect): add no-option template

## 0.11.3

### Patch Changes

- 35ee659: fix: fix css export

## 0.11.2

### Patch Changes

- 56d905c: feat(PostalCodeInput): use optional country prop instead of locale

## 0.11.1

### Patch Changes

- 11d936a: fix(DateInput): add pattern attribute for numbers only input

## 0.11.0

### Minor Changes

- 7340d62: feat: add iso3166 flags and country codes

### Patch Changes

- 259240e: fix(DateInput): fix input width

## 0.10.6

### Patch Changes

- ca2f3e2: style(DateInput): fix margins

## 0.10.5

### Patch Changes

- 0143ec3: fix(FormInput): add slots
- 63313fa: fix(components): fix vue generics

## 0.10.4

### Patch Changes

- c88c7bc: feat(EmailInput): add link to toolbar

## 0.10.3

### Patch Changes

- 78e60c4: fix(QSubmitButton): set loading prop default to undefined

## 0.10.2

### Patch Changes

- e15c306: feat: add type prop to QSubmitButton

## 0.10.1

### Patch Changes

- 4ef557b: fix(ResourcePage): fix error on empty type

## 0.10.0

### Minor Changes

- a0e1496: feat(components): add CronScheduleInput

## 0.9.1

### Patch Changes

- 0bb7339: fix(FilteredModelSelect): fix fetching of missing modelValue id

## 0.9.0

### Minor Changes

- 9fe6cd0: feat: add AccountsTable component

### Patch Changes

- eec2e00: fix(DateInput): fix locale prop

## 0.8.1

### Patch Changes

- 0b24daf: feat: add fab slot to ResourcePage
- 92a0c62: feat(components): add header-side slot to ResourcePage
- c750af3: fix: fix DateInput label
- 572c7e5: feat: add label to LocaleSelect

## 0.8.0

### Minor Changes

- 050612f: Add CurrencySelect and LocaleSelect components

### Patch Changes

- d749926: chore: update package.json
- cba0aa7: chore: update package.json

## 0.7.1

### Patch Changes

- 3db27ca: fix(components): export QDrawerList

## 0.7.0

### Minor Changes

- d5eb6bf: feat(components): add QDrawerList component

## 0.6.0

### Minor Changes

- 2d54c9b: feat(components): add FilteredModelSelect component

## 0.5.7

### Patch Changes

- ba791dc: fix(components): change OTP email label

## 0.5.6

### Patch Changes

- 8cd7bb8: fix(DateInput): do not emit invalid date

## 0.5.5

### Patch Changes

- 6f8d9b9: feat: export useLang and loadLang

## 0.5.4

### Patch Changes

- d5d0975: fix(DateInput): fix style

## 0.5.3

### Patch Changes

- a908cb3: fix(PostalCodeInput): make modelValue optional

## 0.5.2

### Patch Changes

- 7799b8f: fix(DateInput): fix style

## 0.5.1

### Patch Changes

- 4d55fc8: feat(DateInput): add stack-label; fix(DateInput): set year to undefined on invalid values

## 0.5.0

### Minor Changes

- 401bf7b: feat: change DateInput to separate input fields for year, month and day
- fa4989f: feat: add autocomplete attributes to LoginForm

## 0.4.8

### Patch Changes

- e86715f: fix: make BooleanItem nullable

## 0.4.7

### Patch Changes

- ebb0c51: fix(components): export useLang in PasswordChangeStepper
- 98f6393: fix: replace .once modifier with debounce in QSubmitButton

## 0.4.6

### Patch Changes

- 255d957: fix(components): make LoginButton extend QSubmitButton

## 0.4.5

### Patch Changes

- 65b81d3: chore: change nl submit translation

## 0.4.4

### Patch Changes

- a14c1d9: fix(components): fix nl telephone number translation

## 0.4.3

### Patch Changes

- 17dbf94: refactor(components): change class attribute of ResponsiveDialog; fix(components): fix BooleanSelect validation

## 0.4.2

### Patch Changes

- 7e6d8ea: fix(components): add DateInput placeholder translation and set null on empty value

## 0.4.1

### Patch Changes

- a1de056: fix(components): fix DatePicker undefined value

## 0.4.0

### Minor Changes

- 9eb34b3: feat(components): add DatePicker component

## 0.3.7

### Patch Changes

- 34a81e2: fix: allow null as modelValue for BooleanSelect

## 0.3.6

### Patch Changes

- 4a79340: feat(components): add disableOther prop to GenderSelect; fix(components): fix null date validation in DateInput

## 0.3.5

### Patch Changes

- b18d3a5: Update dependencies
- ff2ee82: fix(components): fix date input validation

## 0.3.4

### Patch Changes

- 7f5b036: fix(components): await loadLang in GenderSelect

## 0.3.3

### Patch Changes

- e1538f5: fix(components): make genderOptions reactive; fix(components): make booleanOptions reactive

## 0.3.2

### Patch Changes

- cb84832: fix(components): LoginComponent: set text color of password forgot and create account buttons to primary

## 0.3.1

### Patch Changes

- 6d98116: fix: fix BooleanSelect input validation

## 0.3.0

### Minor Changes

- 1bc095c: feat: add EmailInput component

### Patch Changes

- 3961b33: Rename surname to lastName
- ea7443f: fix(ResponsiveDialog): replace modelValue with methods so that it is compatible with the persistent prop

## 0.2.0

### Minor Changes

- 91eb0e9: Components update

## 0.1.3

### Patch Changes

- 0926b41: Bind submit button to forms

## 0.1.2

### Patch Changes

- 5bdc2d0: Trim email in EmailChange and RequestOtp forms

## 0.1.1

### Patch Changes

- 42ecef6: Trim email and username fields
- 5e00c31: Ignore test in components package.json

## 0.1.0

### Minor Changes

- 62f9629: Release
