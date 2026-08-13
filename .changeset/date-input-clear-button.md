---
"@simsustech/quasar-components": patch
---

fix(DateInput): clearing all parts (clear button or manual delete) emits null instead of a stale ____-__-__ partial — required fields then report "Field is required.", and the calendar popup on a cleared field no longer passes an invalid undefined modelValue to QDate
