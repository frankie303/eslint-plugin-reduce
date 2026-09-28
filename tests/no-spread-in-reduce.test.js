const { describe, it } = require("node:test");
const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");
const rule = require("../rules/no-spread-in-reduce");

// The reference suite includes TypeScript snippets (`as` expressions, parameter
// type annotations), so run everything through the TypeScript parser.
const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

// Wire RuleTester into the node:test runner. These are static accessors on the
// RuleTester class, not instance properties.
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

ruleTester.run("no-spread-in-reduce", rule, {
  valid: [
    // --- Basics: spread that is not in a reduce callback ---
    "const merged = { ...a, ...b }",
    "const list = [...a, ...b]",
    // reduce without a function callback
    "arr.reduce(fn, initial)",
    // spread passed as an argument to reduce, not used in the callback body
    "arr.reduce(...args)",
    "arr.reduce(makeReducer(), 0)",

    // --- Valid cases (reference suite) ---
    "array.reduce((acc, item) => acc + item, 0);",
    "array.reduce((acc, item) => { return acc + item; }, 0);",
    "array.reduce((acc, item) => { acc.push(item); return acc; }, []);",
    "array.reduce((acc, item) => acc.concat(item), []);",
    "array.reduce((acc, item) => { return acc.concat(item); }, []);",
    "array.reduce((acc, item) => { acc = acc.concat(item); return acc; }, []);",
    "array.reduce((acc, item) => { if (item) acc.push(item); return acc; }, []);",
    "array.reduce((acc, item) => { return item ? acc.concat(item) : acc; }, []);",
    "array.reduce((acc, item) => { return acc; }, []);", // No operation
    "array.reduce((acc, item) => { acc[item] = true; return acc; }, {});", // Object mutation
    "array.reduce((acc, item) => { acc[item] = item; return acc; }, {});", // Object mutation
    "array.reduce((acc, item) => { acc = acc || []; acc.push(item); return acc; }, []);", // Logical OR
  ],

  invalid: [
    // --- Minimal object / function-expression coverage ---
    {
      code: "arr.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})",
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: "arr.reduce(function (acc, item) { return [...acc, item] }, [])",
      errors: [{ messageId: "noSpreadInReduce" }],
    },

    // --- Invalid cases (reference suite) ---
    {
      code: "array.reduce((acc, item) => [...acc, item], []);",
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: "array.reduce((acc, item) => { return [...acc, item]; }, []);",
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: "array.reduce((acc, item) => { acc = [...acc, item]; return acc; }, []);",
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: "array.reduce((acc, item) => { return item ? [...acc, item] : acc; }, []);",
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: "array.reduce((acc, item) => { acc = item ? [...acc, item] : acc; return acc; }, []);",
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: "array.reduce((acc, item) => { return [...acc, ...item]; }, []);",
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: "array.reduce((acc, item) => [...acc, ...item], [])",
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        array.reduce((acc, item) => {
          if (item) {
            return [...acc, item]
          } else {
            return [...acc, item]
          }
        }, [])
      `,
      errors: [{ messageId: "noSpreadInReduce" }, { messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        array.reduce((acc, item) => {
          if (item) {
            return [...acc, item]
          }
        }, [])
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        const customFields = getCustomFieldsForOperation(operation).reduce(
          (acc, field) => ({
            ...acc,
            [field]: currentTokenState[field] || '',
          }),
          {}
        )
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        new webpack.DefinePlugin(
          Object.keys(globals).reduce(
            (acc, key) => ({
              ...acc,
              [key]: JSON.stringify(globals[key]),
            }),
            {}
          )
        )
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        const idToIndexMap = useMemo(
          () =>
            cards.reduce(
              (acc, card, index) => ({ ...acc, [card.id]: index }),
              {} as Record<string, number>
            ),
          [cards]
        )
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        jest.mock('./constants', () => {
          const act = jest.requireActual('./constants')
          return {
            ...act,
            CardConfig: Object.keys(act.CardConfig as Record<string, unknown>).reduce(
              (acc, cur) => ({ ...acc, [cur]: () => mockUseExploreCardResult() }),
              {} as Record<string, unknown>
            ),
          }
        })
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        export const parseAutomationState = (automationState: AutomationState): ExtractedData => {
          return automationState.extracted.reduce((acc, e) => {
            const parsedItem = parseKnowledgeItem(e)
            return { ...acc, ...parsedItem }
          }, {} as ExtractedData)
        }
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        export const formatCollectionWithItems = (collectionWithItems: any) => {
          return {
            ...formatCollection(collectionWithItems),
            items: collectionWithItems.items
              ? collectionWithItems.items.reduce((acc: any, item: any) => {
                  if (isValidItem(item) || 'productKrn' in item) {
                    return [...acc, typeof item === 'string' ? item : \`\${item.id}\`]
                  }
                  return acc
                }, [])
              : [],
          }
        }
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        export const formatCollections = (
          collections: Collection[] = []
        ): Record<string, FormatedCollection> =>
          collections.reduce((acc, collection) => {
            if (collection.id) {
              return { ...acc, [collection.id]: formatCollection(collection) }
            }
            return acc
          }, {})
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        const mergedEntries = {
          bootstrap: path.resolve(__dirname, './lol/bootstrap/index.js'),
          ...Object.entries({
            ...entries,
            ...designEntries,
            ...globalizedFeatureEntries,
            ...localizedFeatureEntries,
          }).reduce((acc, [entryName, entryPath]) => {
            if (entryName === 'hey') {
              return {
                ...acc,
                [entryName]: entryPath,
              }
            }
            return {
              ...acc,
              [entryName]: {
                import: entryPath,
                dependOn: 'bootstrap',
              },
            }
          }, {}),
        }
      `,
      errors: [{ messageId: "noSpreadInReduce" }, { messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        const sortedTextFields = fields.reduce((acc: TextFieldProps[], field: FieldNamesValue) => {
          const item = textInputFields.find((item) => item.props.name === field)
          if (item) return [...acc, item]
          return acc
        }, [])
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        const partitionImages = (imagesToPartition: any[]) =>
          imagesToPartition.reduce(
            (acc: string[][], image: string, index: number) =>
              index === 0 || index === 3 ? [[...acc[0], image], acc[1]] : [acc[0], [...acc[1], image]],
            [[], []]
          )
      `,
      errors: [{ messageId: "noSpreadInReduce" }, { messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        const newKnownErrors = logItems.reduce((acc: KnownErrors, logItem) => {
          if (logItem.status !== 'failure') {
            return acc
          }
          if (!isValidationLogItem(logItem)) {
            return acc
          }
          const validationName = logItem.validationName || 'unknown'
          return {
            ...acc,
            [validationName]: {
              ...(acc[validationName] && acc[validationName]),
            } as KnownErrors
          }
        }, {})
      `,
      // only one error for the nested spread
      errors: [{ messageId: "noSpreadInReduce" }],
    },
    {
      code: `
        const contractCreation = Object.keys(originalContractCreation).reduce(
          (acc, fnName) => ({
            ...acc,
            [fnName]: mockFn(),
          }),
          {}
        ) as typeof originalContractCreation
      `,
      errors: [{ messageId: "noSpreadInReduce" }],
    },
  ],
});
