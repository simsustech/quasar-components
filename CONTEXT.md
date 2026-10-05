# CONTEXT — quasar-components

## Glossary

- **segment placeholder** — the YYYY/MM/DD hint text inside `DateInput`'s raw
  inputs (the `<input class="q-field__native">` elements in its `#control`
  slot). Scoped `.date-input-field` rule in `DateInput.vue` sets them to
  `--q-on-surface-variant` at 0.6 (inheriting the input's colour when the
  token is undefined), so they are not left to whatever the consumer's field
  CSS does with `::placeholder`. Avoid: hint, ghost text, watermark.
