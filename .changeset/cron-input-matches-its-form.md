---
'@simsustech/quasar-components': patch
---

fix(components): draw CronScheduleInput as one field, not a field inside a field

The component forced `borderless` on its outer QField, which is the one thing a
field cannot be if it has to sit in a form: under a token-driven style the
borderless control carries no surface, no radius and no padding, so the input
rendered as loose text under a floating label next to ordinary inputs. It now
inherits the same field appearance as any other input (and any field attribute
a consumer passes — `filled`, `outlined`, `standout`, `dense`, `square` — reaches
the outer QField again), so it matches its siblings instead of announcing that
it came from another library.

The parts are values, not fields: dense borderless QSelects with no hint strip,
no frame and no underline of their own, sized to the field's value band
(`--q-comp-lg` minus `--q-field-labeled-padding-top`) so the composite lands on
the same 56px control as a plain input. Previously each part reserved its own
label band and hint strip, the composite grew to 136px against a 56px sibling,
and the per-part hints (the only thing naming the parts) collided with each
other — "Day of monthMonth". Part names now live in per-part `aria-label`s and
tooltips, and the trailing padding the `--labeled` rule reserves under a native
input no longer leaves dead surface at the bottom of the control.

Also fixes the minute options stopping at 58: `Array(59)` cannot offer minute 59,
so a schedule at minute 59 could not be entered or re-entered through the UI.
