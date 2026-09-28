# ESLint example

A minimal [flat-config](https://eslint.org/docs/latest/use/configure/configuration-files)
project showing `eslint-plugin-reduce` running under ESLint 9/10.

## Run

```sh
npm install
npm run lint
```

You should see three warnings from `reduce/no-spread-in-reduce`
(one for each ✗ in `src/index.js`) and none for the final, mutation-based
example.

## How it works

`eslint.config.js` loads the plugin's bundled preset, which registers the plugin
and enables the rule as a warning:

```js
import plugin from "../../index.js"

export default [plugin.configs.recommended]
```

The `../../index.js` import points at this repository's plugin entry point, so
the example runs without publishing anything. In a real project that installed
the plugin from npm, import it by package name instead:

```js
import reducePlugin from "eslint-plugin-reduce"

export default [reducePlugin.configs.recommended]
```

## TypeScript

This example is plain JavaScript to stay dependency-free. To lint TypeScript,
add [`typescript-eslint`](https://typescript-eslint.io) and this plugin still
catches spreads inside `as` expressions:

```js
import tseslint from "typescript-eslint"
import reducePlugin from "eslint-plugin-reduce"

export default [
  ...tseslint.configs.recommended,
  reducePlugin.configs.recommended,
]
```

## Note

The rule ID is the same in ESLint and Oxlint. See `../oxlint` for the Oxlint
equivalent of this project.
