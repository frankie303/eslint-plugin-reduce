// Examples of the patterns this rule targets.
// Run `npm run lint` in this directory to see the three warnings.

interface Item {
  id: string
  value: number
}

const items: Item[] = [
  { id: "a", value: 1 },
  { id: "b", value: 2 },
]

// ✗ Triggers the rule: a new object is allocated and copied on every iteration.
export const byId = items.reduce<Record<string, Item>>(
  (acc, item) => ({ ...acc, [item.id]: item }),
  {},
)

// ✗ Triggers the rule: array spread inside an if branch.
export const grow = items.reduce<Item[]>((acc, item) => {
  if (item.value > 1) {
    return [...acc, item]
  }
  return acc
}, [])

// ✗ Triggers the rule: TypeScript `as` expression wrapping the spread.
export const cast = items.reduce(
  (acc, _item) => ({ ...acc }) as Record<string, unknown>,
  {},
)

// ✓ Does not trigger: mutate the single accumulator instead.
export const byIdFast = items.reduce<Record<string, Item>>((acc, item) => {
  acc[item.id] = item
  return acc
}, {})
