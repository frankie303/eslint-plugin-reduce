# eslint-plugin-reduce

[![npm version](https://img.shields.io/npm/v/eslint-plugin-reduce.svg)](https://www.npmjs.com/package/eslint-plugin-reduce)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/frankie303/eslint-plugin-reduce/actions/workflows/ci.yml/badge.svg)](https://github.com/frankie303/eslint-plugin-reduce/actions/workflows/ci.yml)

An ESLint plugin whose `no-spread-in-reduce` rule flags spreading syntax (`...`)
inside an `Array.prototype.reduce()` callback. Building a new accumulator with
spread on every iteration allocates a new object/array and copies all existing
keys, which turns an `O(n)` reduction into `O(n²)` work on large inputs.

```js
// ✗ bad — new object allocated and copied on every iteration
items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})

// ✓ good — mutate a single accumulator instead
items.reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {})
```

## Why this rule exists

Spread (`...`) is essentially a `for` loop that copies every element. Inside
`Array.prototype.reduce`, using spread to rebuild the accumulator copies the
whole accumulator on every iteration, turning an `O(n)` reduction into `O(n²)`
work — plus one discarded allocation per step. The bigger the accumulator grows,
the worse it gets.

A real-world example:

- [Making TanStack Table 1000x faster with a 1 line change](https://jpcamara.com/2023/03/07/making-tanstack-table.html) — JP Camara
- Upstream fix: [TanStack/table#4495](https://github.com/TanStack/table/pull/4495)

This rule flags that pattern statically. It is a heuristic: spreading an
accumulator that stays small is harmless, which is why it ships as a
[warning](#severity) by default. If you'd rather fail the build, raise it to
`error`.

### Further reading

- [Is JavaScript Spread a Performance Killer? Quick Fix](https://www.youtube.com/watch?v=tcZbY-Q0TIE) (video)
- [Spread syntax (`...`) on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

## Compatibility

- **ESLint 9 and 10** are supported (peer dependency `^9.0.0 || ^10.0.0`).
  Flat config only, which is the default in both.
- Works with either the CommonJS or ESM entry points:
  `require('eslint-plugin-reduce')` or
  `import reducePlugin from 'eslint-plugin-reduce'`.
- **Oxlint** can run this plugin too, through its ESLint-compatible JS plugin
  API — see [Usage with Oxlint](#usage-with-oxlint).
- Node.js `^20.19.0 || ^22.13.0 || >=24` — mirrors ESLint 10's own
  requirement (Node 18/21/23 are not supported).

## Install

```sh
npm install --save-dev eslint-plugin-reduce
```

## Usage (flat config, ESLint >= 9)

```js
// eslint.config.js
import reducePlugin from 'eslint-plugin-reduce'

export default [
  reducePlugin.configs.recommended,
  // ...or enable the rule manually:
  // {
  //   plugins: { reduce: reducePlugin },
  //   rules: { 'reduce/no-spread-in-reduce': 'warn' },
  // },
]
```

A runnable example lives in [`examples/eslint`](./examples/eslint).

## Usage with Oxlint

Oxlint's JS plugin API is ESLint v9+ compatible, so the same plugin runs there
unchanged — no separate build or fork. Oxlint does not read ESLint's flat-config
presets, so register the plugin under `jsPlugins` and enable the rule under
`rules`:

```jsonc
// .oxlintrc.json
{
  "jsPlugins": ["eslint-plugin-reduce"],
  "rules": {
    "reduce/no-spread-in-reduce": "warn"
  }
}
```

```ts
// oxlint.config.ts
import { defineConfig } from "oxlint"

export default defineConfig({
  jsPlugins: ["eslint-plugin-reduce"],
  rules: {
    "reduce/no-spread-in-reduce": "warn",
  },
})
```

The rule ID is identical in both linters (Oxlint strips the `eslint-plugin-`
prefix). Oxlint's JS plugins are currently in alpha.

A runnable example lives in [`examples/oxlint`](./examples/oxlint).

## Severity

Severity is yours to choose — it is set in your config, not by the rule. The
bundled `recommended` preset uses `warn` because the rule is a heuristic (a
small, non-growing accumulator is fine to spread):

```js
rules: {
  // default from `configs.recommended`
  'reduce/no-spread-in-reduce': 'warn',
  // fail the build instead
  'reduce/no-spread-in-reduce': 'error',
}
```

## Rule options

The rule takes no options.

## Detected patterns

The rule inspects the callback body and its `if` / `else` branches of a
`reduce` call, and reports spread syntax found in:

- object expressions — `{ ...acc }`
- array expressions — `[...acc, item]`
- conditional expressions — `cond ? { ...acc } : acc`
- TypeScript `as` expressions — `{ ...acc } as Record<string, unknown>`
- assignments — `acc = { ...acc }`

It's a syntactic check with no scope analysis: it reports *any* spread of the
returned value, so a spread that isn't the accumulator can be reported too, and
some wrappers aren't seen through. If a report is intentional, silence it for
the line:

```js
// eslint-disable-next-line reduce/no-spread-in-reduce
```

## License

MIT
