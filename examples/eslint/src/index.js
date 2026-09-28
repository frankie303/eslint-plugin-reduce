// Examples of the patterns this rule targets.
// Run `npm run lint` in this directory to see the warnings.

const items = [
  { id: "a", value: 1 },
  { id: "b", value: 2 },
]

// ✗ Triggers the rule: a new object is allocated and copied on every iteration.
export const byId = items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})

// ✗ Triggers the rule: array spread inside an if branch.
export const grow = items.reduce((acc, item) => {
  if (item.value > 1) {
    return [...acc, item]
  }
  return acc
}, [])

// ✗ Triggers the rule: spread in the else branch.
export const shrink = items.reduce((acc, item) => {
  if (item.value > 1) {
    return acc
  } else {
    return { ...acc, [item.id]: item }
  }
}, {})

// ✓ Does not trigger: mutate the single accumulator instead.
export const byIdFast = items.reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {})
