---
'@simsustech/quasar-components': patch
---

Name `ResponsiveDialog` for assistive tech

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
