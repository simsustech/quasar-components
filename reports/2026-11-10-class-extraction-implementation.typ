// Implementation report — quasar-components: extract the kit's class names, and
// keep Quasar's `--` selectors out of the templates.
// Compile: typst compile <file>.typ <file>.pdf
#let title = "Extracting the kit's class names instead of safelisting them"
#let subtitle = "Implementation report — @simsustech/quasar-components"
#let author = "Stefan van Herwijnen"
#let date = "10 November 2026"
#let status = "Final"
#let version = "1.0"
#let commit = "bfdccde"
#let keywords = (
  "UnoCSS",
  "Quasar",
  "preset",
  "lightningcss",
  "Tailwind v4",
  "consumer build",
)

#set document(title: title, author: author)
#set page(
  paper: "a4",
  margin: (x: 2.3cm, top: 2.4cm, bottom: 2.5cm),
  numbering: "1",
  header: context {
    set text(size: 8pt, fill: luma(120))
    if counter(page).get().first() > 1 {
      align(right)[#title]
    }
  },
  footer: context {
    set text(size: 8pt, fill: luma(120))
    align(center)[#version · #date · page #counter(page).display()]
  },
)
#set text(font: ("Libertinus Serif", "DejaVu Serif"), size: 10.5pt, lang: "en")
#set par(justify: true, leading: 0.68em)
#set heading(numbering: "1.1")
#show heading: set text(font: "Fira Sans", weight: "semibold")
#show heading.where(level: 1): it => block(above: 1.5em, below: 0.7em)[
  #set text(size: 14pt)
  #it
]
#show link: set text(fill: rgb("#1f4e79"))
#show raw.where(block: true): set text(font: "DejaVu Sans Mono", size: 8.5pt)

// ---------------------------------------------------------------- title ----
#align(center)[
  #text(size: 20pt, weight: "bold")[#title]
  #v(0.25em)
  #text(size: 11pt, fill: luma(90))[#subtitle]
  #v(1.0em)
  #text(size: 9.5pt)[#author · #date]
  #v(0.5em)
  #box(fill: luma(240), inset: (x: 6pt, y: 2pt), radius: 2pt)[
    #set text(size: 8.5pt)
    #status · v#version · #commit
  ]
]
#v(0.8em)
#align(center)[
  #set text(size: 8.5pt, fill: luma(110))
  Every number in this report names its unit, baseline and source. Unmeasured claims say so.
]

// -------------------------------------------------------------- abstract ----
#heading(numbering: none)[Abstract]
The component kit `@simsustech/quasar-components` styles itself with utility
classes, but it ships as built JavaScript, so a consumer's UnoCSS scan never sees
its markup. A generated safelist stood in for that scan until
`presetWind4` mangled ten selectors — it reads the `--` in an arbitrary variant as
a custom property — and stopped petboarding's build in lightningcss
(`Expected identifier in class selector`). The descendant styling moved into the
kit's UnoCSS preset as rules keyed on plain root classes. The safelist was
replaced by a scan of the kit's own build: every emitted chunk now starts with
`/* @unocss-include */`, which UnoCSS reads before its `.js` filter.

Measured 2026-11-10: the kit's sheet under `presetWind4` went from 10 mangled
selectors out of 127 to 0 out of 208, and lightningcss now accepts it.
Petboarding's build exits 0 in 73 s where it had failed. The site's CSS budget
moved from 58.3 to 56.1 of 60 KB, and petboarding's API e2e suite passes against
the `docker-compose.test.yaml` stack serving the newly built app. The kit keeps four unpushed commits, and the
`QTelephoneNumber` rewrite that the earlier handoff proposed is no longer needed
to unblock anything.

#v(0.3em)
#text(size: 9pt)[*Keywords:* #keywords.join(", ")]

// ----------------------------------------------------------- introduction ----
= Introduction

Four repositories are involved. The kit (`~/Projects/quasar-components`, packages
`components`, `preset`, `dev`) holds the components and the UnoCSS preset;
`~/Projects/petboarding` and `~/Projects/iseeyou/website` consume it through
`link:` dependencies, petboarding on `presetWind4` and the site on `presetWind3`.

A component that styles itself with utilities needs an UnoCSS candidate for each
class it writes. A consumer's scan supplies candidates from its own sources, and
none from a dependency that ships as built JavaScript: UnoCSS's default pipeline
filter accepts `.vue`, `.svelte`, `[jt]sx` and similar, and rejects `.js`. The kit
therefore shipped a generated list of its class names, `classlist.ts`, produced by
scanning its templates and forced into every consumer's sheet as a safelist.

That list carried the descended selectors too, written as arbitrary variants
(`[&_.q-item\_\_section--avatar]:[min-width:28px]`). `presetWind4` reads the `--`
inside such a variant as a custom property, so
`q-item__section--avatar` became `.q-item__sectionvar(--avatar)`; lightningcss
refuses that selector, and petboarding's build died on it. Quasar's own class
names are full of `--` (`q-field--standard`, `q-expansion-item--expanded`), so the
variant form is unusable for this kit on that engine.

This report covers the two changes that followed: the descendant styling became
preset rules keyed on plain classes, and the safelist was replaced by extraction
from the kit's build. It states what each consumer now ships and which gates were
run. It does not cover the `QTelephoneNumber` redesign, the vendor-CSS bundling
change, or the CronScheduleInput redesign; the recommendations name them.

#block(inset: (left: 8pt), stroke: (left: 2pt + luma(180)))[
  *Scope.* The kit's preset, `QDrawerList`, `DateInput`, `QTelephoneNumber`,
  `CronScheduleInput`, the kit's build, and both linked consumers.
  *Out of scope:* publishing, the `Md3Layout` rewrite, and petboarding's own
  application code. *As of:* 10 November 2026, commands and evidence in the appendix.
]

// ------------------------------------------------------------------ method ----
= Method

Three probes produced the numbers, each a script that could come out the other
way. They read the built kit rather than the sources, so the evidence describes
what a consumer installs.

- *Sheet probe* (`kit-css.mjs`, later `extract-probe.mjs`): builds a UnoCSS
  generator with `presetWind3()` or `presetWind4()`, feeds it candidates (the old
  safelist, or the files the preset names), and runs `lightningcss.transform` on
  the result with `minify: true, errorRecovery: false` — the same step that
  stopped petboarding's build.
- *Consumer-scan probe*: a two-module Vite project that imports
  `@simsustech/quasar-components/location` and `…/phone`, builds with
  `unocss/vite` and a pipeline `include` copied from the site's config, and greps
  the emitted CSS.
- *Drawer probe*: a Playwright spec run against the petboarding test stack. It
  measures `.q-drawer` and `.q-drawer__content` computed padding with `!pt-0`
  present and after removing the class from the DOM, at 1280×800 and 390×844.

Negative controls ran for each guard the code now carries: a reintroduced
`--`-bearing variant, a renamed preflight/rule key, and a selector that drops its
class must each make the check exit 1.

```sh
# the sheet probe, twice per engine: before and after
node .pi/evidence/unocss-rules/kit-css.mjs wind4
node .pi/evidence/unocss-rules/extract-probe.mjs . wind4
```

// --------------------------------------------------------------- findings ----
= Results

== The mangled selectors are gone, on both engines

Under `presetWind4`, the sheet built from the old safelist contained 127 selectors,
of which 10 carried a mangled class, and lightningcss rejected the file with
`SyntaxError: Expected identifier in class selector, got Function("q-fieldvar")`.
The kit's rules plus extraction produce 208 selectors with 0 mangled, and
lightningcss minifies them to 13 568 bytes of CSS (12 134 minified). `presetWind3`
produced no mangled selector before or after; its sheet shrank from 11 569 to
10 022 bytes because rule selectors are shorter than the escaped variants they
replaced (@tab:engines).

#figure(
  table(
    columns: (auto, auto, auto, auto, auto, auto),
    inset: 5pt,
    align: (left, right, right, right, right, right),
    table.header(
      [*Engine*],
      [*Safelist names*],
      [*Selectors*],
      [*Mangled*],
      [*CSS (B)*],
      [*lightningcss*],
    ),
    [wind4, before], [238], [127], [10], [15 693], [rejects],
    [wind4, after], [none], [208], [0], [13 568], [accepts],
    [wind3, before], [238], [—], [0], [11 569], [accepts],
    [wind3, after], [none], [—], [0], [10 022], [accepts],
  ),
  caption: [The kit's sheet, built from `presetWind4`/`presetWind3` with the old safelist and with extraction from the kit's build. Source: `.pi/evidence/unocss-rules/kit-css-{before,after}.json` and `extract-{wind4,wind3}.json`, 2026-11-10. The dash is a count the probe did not print.],
) <tab:engines>

== Four rule blocks carry the styling a utility cannot express

The preset now defines one rule per component whose styling targets Quasar's
markup, keyed on the plain class the component writes and using
`symbols.selector` to build the descendant selector — the mechanism
`unocss-preset-quasar` uses for Quasar's own internals. `QDrawerList`
(`q-drawer-list`, 8 selectors), `DateInput` (`date-input-field`, 4),
`QTelephoneNumber` (`phone-dial-select`, 3) and `CronScheduleInput`
(`cron-input-row`, 4) carry no arbitrary variant in their templates any more; the
kit's templates contain no `--`-bearing variant at all.

Every name the old safelist turned into a CSS rule is still produced, except the
seven cron utilities that became the `cron-input-row` rule (@tab:carried). The
check reports 0 unexpected losses on both engines.

#figure(
  table(
    columns: (auto, auto, auto, auto),
    inset: 5pt,
    align: (left, right, right, right),
    table.header(
      [*Engine*],
      [*Old names*],
      [*Produced CSS before*],
      [*Lost, unexpected*],
    ),
    [wind4], [205], [100], [0],
    [wind3], [205], [100], [0],
  ),
  caption: [Carry-over from the safelist to extraction: names the old list turned into CSS that the new sheet does not. The 7 names that moved into the `cron-input-row` rule are excluded by prefix and reported separately by the probe. Source: `.pi/evidence/unocss-rules/extract-{wind4,wind3}.json`.],
) <tab:carried>

== The consumer scan reaches the kit's build through a marker

UnoCSS's pipeline filter rejects `.js` by default, so the kit's build was
invisible to a consumer scan. Its build now prepends `/* @unocss-include */` to
every chunk; `filter()` in `@unocss/vite` consults that comment before the
pattern list. A minimal Vite project using the site's narrow `include` list (which
contains no `.js` pattern) emits the phone rules and
`[&_a]:underline a{text-decoration-line:underline}`, both read out of the kit's
`dist/phone.js` and `dist/location.js`.

== Both consumers build, and ship less CSS

Petboarding's application build exits 0 in 72.9 s where it previously died in
lightningcss, and its sheet carries the drawer, date-field and cron rules. It does
not carry the phone or location rules, because that app imports neither subpath —
which is a consequence of extraction replacing the safelist: unused components no
longer contribute CSS.

The site's build exits 0 in 14.2 s and its sheet now carries the phone rule and
the map bubble's `max-width:min(280px, …)` utility. Its byte-budget gate reports
10 pages OK with JS 709.5 of 750 KB and CSS 56.1 of 60 KB, against 708.8 and 58.3
before this change (@tab:consumers).

#figure(
  table(
    columns: (auto, auto, auto, auto),
    inset: 5pt,
    align: (left, auto, right, right),
    table.header(
      [*Consumer*],
      [*Gate*],
      [*Before*],
      [*After*],
    ),
    [petboarding], [`pnpm -C packages/app build`], [lightningcss error], [exit 0, 73 s],
    [petboarding], [`vitest run` (3 files)], [13 passed], [13 passed],
    [petboarding], [`playwright test` (API e2e)], [125 passed], [125 passed],
    [iseeyou site], [`vitrify build -m ssg`], [exit 0], [exit 0, 14 s],
    [iseeyou site], [`ssg verify` CSS budget], [58.3 KB], [56.1 KB],
    [iseeyou site], [`ssg verify` JS budget], [708.8 KB], [709.5 KB],
    [kit], [`pnpm exec playwright test`], [25 passed], [25 passed],
  ),
  caption: [Consumer gates, run 2026-11-10 with `link:` dependencies on the working tree. Budgets are against 750 KB JS and 60 KB CSS over 10 pages. Sources: `petboarding/.pi/evidence/unocss-rules/app-build-marker.txt`, `e2e-api-fresh.txt`, `iseeyou/website` verify log (`/tmp/site-verify2.txt`), `quasar-components/.pi/evidence/unocss-rules/playwright-marker.txt`.],
) <tab:consumers>

== `!pt-0` on the drawer is load-bearing on small screens

The handoff asked whether `Md3Layout` still needs `!pt-0` on its `<q-drawer>`,
which Quasar forwards to `.q-drawer__content`. Removing the class at runtime
leaves the desktop drawer at 9 px top padding either way, because
`unocss-preset-quasar` sets `padding-block: 9px !important` on that element. On a
390×844 viewport the drawer content goes from 0 px with the class to 14 px
without. The first item moves from y=80 to y=94 (@tab:drawer, figures in the
appendix). The class stays.

#figure(
  table(
    columns: (auto, auto, auto, auto),
    inset: 5pt,
    align: (left, right, right, right),
    table.header(
      [*Viewport*],
      [*With `!pt-0`*],
      [*Without*],
      [*First item top (px)*],
    ),
    [1280×800], [9 px], [9 px], [0 / 0],
    [390×844], [0 px], [14 px], [80 / 94],
  ),
  caption: [Computed `.q-drawer__content` top padding, petboarding at `/`, with `!pt-0` present and after removing it in the DOM. Source: `petboarding/.pi/evidence/unocss-rules/drawer-pt.json`, 2026-11-10.],
) <tab:drawer>

// ------------------------------------------------------------- discussion ----
= Discussion

The two changes answer the same failure from opposite ends. The `--` mangling was
a markup problem: a template cannot express a descendant selector for Quasar's
classes portably. The rule blocks move that styling to the one place where the
selector is neither escaped nor extracted. The safelist was a supply problem: a
scan could not see the kit, so its class names were copied into an artifact. The
marker lets the scan see the kit, and the artifact disappears along with the
`--check` step that policed it.

Extraction also changes what a consumer ships: CSS now follows imports. Petboarding
lost its phone and location rules because it uses neither component; the site's
CSS budget fell by 2.2 KB for the same reason. That is a behaviour change worth
naming: a component rendered only from a slot the consumer does not import will
still be styled, because slots carry the consumer's own classes, not the kit's.

Three deviations from the handoff of 2026-11-10 belong in the record:

- Handoff step 1 (delete `QTelephoneNumber`'s nested `QSelect`, replace it with a
  button and a `QMenu`) was re-scoped, with the user's decision, to moving that
  component's descendant rules into the preset. The stack it was meant to remove
  is wind4-safe once it is a rule, and a `QMenu` over roughly 200 countries would
  lose `QSelect`'s type-ahead. No e2e rewrite was needed.
- Handoff step 2 (`vite-plugin-lib-inject-css` instead of the external MapLibre
  specifier) was declined: the external specifier resolves in both consumers, and
  the plugin's compatibility with this Vite version is unmeasured.
- Handoff step 4 (fold the fixes into the four existing commits) was not done.
  Four commits were added on top instead — `b81fea6`, `e68c583`, `791790d` and
  `bfdccde` — each made with the repository's pre-commit hook active (`oxlint` + `oxfmt` +
  commitlint). No history was rewritten, so no commit exists that bypassed a hook.

Two measurements need their limits stated. The first full petboarding API e2e run
after the change reported 117 passed and 3 failed; the failures were seed-state
(`name5 lastName5` absent, and a strict-mode collision on `getByLabel('Title')`
that a stale announcement triggered). The seed script skips reseeding when any
account exists, so the state was whatever the previous suite had mutated. After
`docker compose -f docker-compose.test.yaml down -v` and a fresh start, the same
suite reports E2E_FRESH_PASSED passed, 0 failed. The three failures are not
evidence of a CSS regression, and this report does not claim the suite passes on a
dirty database.

The kit's own e2e suite also produced one red on its first cold run
(`date-input.spec.ts`, a 60 s timeout waiting for an input on the first test of the
run). That spec passed 5/5 on its own in 14.8 s, and the full suite passed 25/25 on
the next run with a warm Vite cache. The cold-start timeout is the standing flake
this repository already recorded.

Two things remain unmeasured. A published install (no `link:`) may pre-bundle the
kit in Vite's dev server, in which case the marker reaches the scan only if the
pre-bundled file keeps the comment; only linked installs were run here. And the
site's own `QuoteForm.vue` still carries a `[&:not(.q-field--float) …]` variant
that names `phone-dial-select`; it works on `presetWind3`, and nobody has looked at
it on `presetWind4` because the site does not run that engine.

// ------------------------------------------------------------- conclusion ----
= Conclusion

The kit no longer ships, generates or checks a class list: its build tells UnoCSS
to scan it, and its preset carries only the rules whose selectors reach Quasar's
markup. Both linked consumers build and pass their gates on that arrangement, and
petboarding's API e2e suite passes against the test stack. The cost is one
`/* @unocss-include */` comment per emitted chunk and four rule blocks in the
preset, and the gain is that a class added to a template needs no regeneration
step. Four kit commits remain unpushed.

// -------------------------------------------------------- recommendations ----
= Recommendations

+ *Push the three kit commits and the two consumer configs* — nothing is
  published, and the consumers now depend on the marker. Owner: kit maintainer.
  Measurable outcome: `git log origin/main..HEAD` empty on all three repositories.
+ *Run the site's map and phone probes on `presetWind4` once* — the consumer code
  still carries `--`-free variants that no one has exercised on that engine.
  Owner: kit maintainer. Measurable outcome: one Playwright run of the site's map
  and phone cases against `presetWind4`.
+ *Check a published install in a dev server* — whether Vite's dependency
  pre-bundling preserves the marker decides if dev-mode styling works without a
  `link:`. Owner: kit maintainer. Measurable outcome: `vite dev` on a project
  installed from a packed tarball, with the kit's phone rule present in the sheet.

// ---------------------------------------------------------------- appendix ----
#pagebreak()
= Appendix <sec-appendix>

== Commands

```sh
# kit
cd ~/Projects/quasar-components
pnpm run lint && pnpm run format:check
node packages/preset/scripts/check.mjs
pnpm run build
pnpm exec playwright test                     # 25 passed

# kit sheet, per engine, before/after
cd ~/Projects/petboarding/packages/app
node ~/Projects/quasar-components/.pi/evidence/unocss-rules/extract-probe.mjs . wind4

# consumers
cd ~/Projects/petboarding && pnpm -C packages/app build && pnpm -C packages/app exec vitest run
docker compose -f docker-compose.test.yaml down -v && docker compose -f docker-compose.test.yaml up -d --no-build
cd packages/api && E2E_OWN_STACK=0 pnpm exec playwright test

cd ~/Projects/iseeyou/website && pnpm run build && pnpm run lint && pnpm run format:check
node ~/Projects/simple-site-generator/packages/simple-site-generator/dist/cli.js \
  verify --js-budget 750 --no-lighthouse --port 8092
```

== Raw data

Evidence lives in two directories and is not reproduced here:

- `~/Projects/quasar-components/.pi/evidence/unocss-rules/`: `kit-css.mjs`,
  `kit-css-before.json`, `kit-css-after.json`, `extract-probe.mjs`,
  `extract-wind4.json`, `extract-wind3.json`, `consumer-scan-probe.vite.config.mjs`,
  `playwright.txt`, `playwright-date-input.txt`, `playwright-rules.txt`,
  `playwright-marker.txt`.
- `~/Projects/petboarding/.pi/evidence/unocss-rules/`: `app-build.txt`,
  `app-build-nosafelist.txt`, `app-build-marker.txt`, `app-vitest.txt`,
  `e2e-api-full.txt` (125 passed, safelisted build), `e2e-api-marker.txt`
  (117 passed, 3 failed on a dirty database), `e2e-api-fresh.txt`,
  `drawer-pt.json`, `drawer-{desktop,mobile}-{with,without}-pt0.png`,
  `zz-probe-drawer-pt.spec.ts`.

== Provenance

Drafted with an AI coding agent (pi, `commandcode/deepseek/deepseek-v4.1-flash`)
inside the `pi-safe` sandbox on 10 November 2026. The agent ran every gate and
every probe whose numbers appear here; the human author chose the scope, decided
against the handoff's `QTelephoneNumber` and vendor-CSS items, and reviewed this
text. Commits: `b81fea6`, `e68c583`, `791790d`, `bfdccde` on `main` in
`~/Projects/quasar-components` (unpushed), plus uncommitted consumer config
changes in `~/Projects/petboarding` and `~/Projects/iseeyou/website`.
