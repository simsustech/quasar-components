---
'@simsustech/quasar-components': patch
---

fix(CronScheduleInput): remove negative-margin hack, use items-center

Same pattern as DateInput: the old margin-top: -1.7em hack broke with
unocss-preset-quasar updates. Replaced with:
- items-center for proper vertical alignment
- CSS overrides for padding leaks from q-field--labeled
- Neutralized cascaded padding-top on inner control-containers
- Removed horizontal padding on inner controls
