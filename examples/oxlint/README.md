# Oxlint example

A minimal project showing `eslint-plugin-reduce` running under
[Oxlint](https://oxc.rs), using its ESLint-compatible JS plugin API.

## Run

```sh
npm install
npm run lint
```

You should see three warnings from `reduce/no-spread-in-reduce`
(one for each ✗ in `src/index.ts`) and none for the final, mutation-based
example.

## How it works

The plugin is installed from this repository through a local `file:`
dependency:

```jsonc
// package.json
"devDependencies": {
  "eslint-plugin-reduce": "file:../..",
  "oxlint": "^1.85.0"
}
```

`.oxlintrc.json` registers it by **package name** under `jsPlugins` and enables
the rule:

```json
{
  "jsPlugins": ["eslint-plugin-reduce"],
  "rules": {
    "reduce/no-spread-in-reduce": "warn"
  }
}
```

Referencing the plugin by package name is what real users do, and it keeps
editor / LSP resolution working even when the editor's workspace root is not
this folder.

## Note

Oxlint's JS plugins are currently in alpha. The rule ID is the same in Oxlint
and ESLint.
