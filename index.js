const noSpreadInReduce = require('./rules/no-spread-in-reduce')

const plugin = {
  meta: {
    name: 'eslint-plugin-reduce',
    version: require('./package.json').version,
  },
  rules: {
    'no-spread-in-reduce': noSpreadInReduce,
  },
  configs: /** @type {Record<string, import('eslint').Linter.Config>} */ ({}),
}

/** @type {import('eslint').Linter.Config} */
const recommended = {
  plugins: {
    reduce: plugin,
  },
  rules: {
    'reduce/no-spread-in-reduce': 'warn',
  },
}

plugin.configs.recommended = recommended

module.exports = plugin
