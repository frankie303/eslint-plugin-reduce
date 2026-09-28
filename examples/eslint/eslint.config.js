import plugin from "../../index.js"

// Uses the plugin's bundled flat-config preset. It registers the plugin and
// enables `reduce/no-spread-in-reduce` as a warning.
export default [plugin.configs.recommended]
