#!/usr/bin/env node
/**
 * Checks the two invariants the preset cannot see for itself.
 *
 *   node scripts/check.mjs   exit 1 when a rule is broken; prints nothing on success
 *
 * There is no generated artifact any more: the preset points the consumer's
 * UnoCSS at the kit's own build (`content.filesystem`, see `src/index.ts`), so
 * the class names are extracted from the markup that ships instead of being
 * copied into a list this repository has to keep in step.
 *
 * What a scan cannot check is the shape of the markup and the link between a
 * rule and the component it styles:
 *
 *   1. No template may write an arbitrary *variant* carrying `--`.
 *      `presetWind4` reads that `--` as a custom property, so
 *      `[&_.q-item\_\_section--avatar]` becomes `.q-item__sectionvar(--avatar)`
 *      and lightningcss refuses the sheet (`Expected identifier in class
 *      selector`) — a consumer's build stops there. Quasar's class names are full
 *      of `--`, so a descendant rule belongs in `src/rules.ts`.
 *   2. Every block in `src/rules.ts` must name a component that exists, write
 *      the class it keys on, and every selector in it must continue that class.
 *      A rule is plain CSS text nobody scans: a renamed root would otherwise
 *      match nothing and lose its styles silently.
 *
 * Node builtins only, so the check cannot break on a package that is not
 * installed yet. `build` runs it first, and CI runs it as its own step.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(pkgRoot, '..', '..')
const componentsRoot = join(repoRoot, 'packages', 'components')
const uiRoot = join(componentsRoot, 'src', 'ui')
const RULES_TS = join(pkgRoot, 'src', 'rules.ts')

/**
 * A `--` inside an arbitrary *variant* is not portable across engine presets, so
 * the kit does not use the variant form at all.
 */
const VARIANT_WITH_CUSTOM_PROPERTY = /^\[.*&[^\]]*--/

const rel = (p) => relative(repoRoot, p).split(sep).join('/')

function fail(message) {
  console.error(`check: ${message}`)
  process.exit(1)
}

/** Every `.vue` template under the components package. */
function templates() {
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (entry.endsWith('.vue')) files.push(full)
    }
  }
  walk(uiRoot)
  return files
}

/**
 * Job 1: no arbitrary variant may name a class with `--` in it.
 *
 * The scan is textual on purpose. A candidate is any whitespace-separated token
 * of a class attribute — static or a string literal inside `:class` — which is
 * the same space the consumer's extractor reads, so a token the check accepts is
 * a token that will be extracted.
 */
function checkTemplates() {
  const problems = []
  for (const file of templates()) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/(?<!:)[\w-]*class="([^"]*)"/g)) {
      for (const token of match[1].split(/\s+/)) {
        if (VARIANT_WITH_CUSTOM_PROPERTY.test(token)) {
          problems.push(`${rel(file)}: ${token}`)
        }
      }
    }
    for (const match of text.matchAll(/:[\w-]*class="([^"]*)"/g)) {
      for (const literal of match[1].matchAll(/'([^']*)'|"([^"]*)"/g)) {
        for (const token of (literal[1] ?? literal[2] ?? '').split(/\s+/)) {
          if (VARIANT_WITH_CUSTOM_PROPERTY.test(token)) {
            problems.push(`${rel(file)}: ${token}`)
          }
        }
      }
    }
  }
  if (problems.length > 0) {
    fail(
      [
        'arbitrary variant carries a `--`; `presetWind4` mangles the selector and',
        'a consumer build stops in lightningcss. Move the rule into src/rules.ts,',
        'keyed on the plain class the element carries:',
        ...problems.map((p) => `  ${p}`)
      ].join('\n')
    )
  }
}

/** Job 2: each rules block names a component that writes the class it keys on. */
function checkComponentRules() {
  let text
  try {
    text = readFileSync(RULES_TS, 'utf8')
  } catch {
    fail('missing src/rules.ts — the kit’s descendant rules live there')
  }
  const blocks = [
    ...text.matchAll(
      /component:\s*'([^']+)',\s*className:\s*'([^']+)',\s*rules:\s*(\w+)/g
    )
  ]
  if (blocks.length === 0) {
    fail('src/rules.ts declares no component rule blocks')
  }
  const problems = []
  for (const [, component, className, constName] of blocks) {
    const file = join(uiRoot, component)
    let source
    try {
      source = readFileSync(file, 'utf8')
    } catch {
      problems.push(`${component}: no such component`)
      continue
    }
    if (!new RegExp(`(^|[\\s"'])${className}([\\s"']|$)`).test(source)) {
      problems.push(`${component}: never writes the class "${className}"`)
    }
    const declared = text.indexOf(`const ${constName}: Rule[] = [`)
    if (declared === -1) {
      problems.push(`${component}: rules const "${constName}" is not declared`)
      continue
    }
    const body = text.slice(declared, text.indexOf('\n]', declared))
    if (!body.includes(`/^${className}$/`)) {
      problems.push(
        `${component}: rules const "${constName}" is not keyed on "${className}"`
      )
    }
    // A rule may style the element that carries the class (`${selector}`),
    // qualify it (`${selector}.q-field--standard …`), or reach into its
    // descendants (`${selector} .q-item__section--avatar`); it must never drop
    // the class and restyle something else from nowhere.
    const selectors = [...body.matchAll(/`\$\{selector\}([^`]*)`/g)].map(
      (m) => m[1]
    )
    if (selectors.length === 0) {
      problems.push(`rules const "${constName}" declares no selector`)
    }
    for (const suffix of selectors) {
      if (
        suffix !== '' &&
        !(suffix.startsWith('.') || suffix.startsWith(' '))
      ) {
        problems.push(
          `${component}: selector suffix "${suffix}" does not continue the class`
        )
      }
    }
  }
  if (problems.length > 0) {
    fail(`rules:\n  ${problems.join('\n  ')}`)
  }
}

checkTemplates()
checkComponentRules()
console.log('check: templates and rules agree')
