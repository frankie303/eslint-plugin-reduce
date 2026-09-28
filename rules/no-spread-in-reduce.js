const MESSAGE_ID = 'noSpreadInReduce'

/** @type {import('eslint').RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent using spread syntax inside Array.prototype.reduce callbacks',
      recommended: true,
      category: 'Performance',
    },
    messages: {
      [MESSAGE_ID]:
        'Avoid spread syntax in reduce callbacks—causes O(n²) performance degradation',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'reduce') {
          // The first argument of `reduce` is the callback function
          const callback = node.arguments[0]

          if (
            callback &&
            (callback.type === 'FunctionExpression' || callback.type === 'ArrowFunctionExpression')
          ) {
            const callbackBody = callback.body

            // we ensure that it always works with an array of nodes, regardless of whether the body is a single node or a block of nodes.
            const bodyNodes =
              callbackBody.type === 'BlockStatement' ? callbackBody.body : [callbackBody]

            bodyNodes.forEach((bodyNode) => {
              // we handle ConditionalExpression in containsSpread function
              if (bodyNode.type !== 'ConditionalExpression') {
                reportIfNodeContainsSpread(bodyNode, context)
              }

              // consequent is the body of the if statement
              if (bodyNode.consequent) {
                // if the body of the if statement is a block, we need to iterate over each node
                const consequentBodyNode = bodyNode.consequent?.body ?? bodyNode.consequent

                if (Array.isArray(consequentBodyNode)) {
                  consequentBodyNode.forEach((consequentBodyNode) => {
                    reportIfNodeContainsSpread(consequentBodyNode, context)
                  })
                } else {
                  reportIfNodeContainsSpread(consequentBodyNode, context)
                }
              }

              // alternate is the body of the else statement
              if (bodyNode.alternate) {
                const alternateBodyNode = bodyNode.alternate?.body ?? bodyNode.alternate
                if (Array.isArray(alternateBodyNode)) {
                  alternateBodyNode.forEach((alternateBodyNode) => {
                    reportIfNodeContainsSpread(alternateBodyNode, context)
                  })
                } else {
                  reportIfNodeContainsSpread(alternateBodyNode, context)
                }
              }
            })
          }
        }
      },
    }
  },
}

/**
 * Check if an AST node (either a ReturnStatement or another type) contains spread syntax
 * and report it if found.
 * @param node - The AST node to check
 * @param context - The ESLint rule context for reporting violations.
 */
function reportIfNodeContainsSpread(node, context) {
  const spreadToken = context.sourceCode
    .getTokens(node.argument?.arguments?.[0] ?? node.argument ?? node)
    .find((token) => token.value === '...')

  if (!spreadToken) {
    return
  }

  if (containsSpread(node.argument ?? node)) {
    context.report({
      node: spreadToken,
      messageId: MESSAGE_ID,
    })
  }
}

/**
 * Recursively check if a node contains spread syntax
 * @param node - The AST node to check
 * @returns {boolean} - `true` if the node or its descendants contain spread syntax.
 */
function containsSpread(node) {
  if (!node) return false

  if (node.type === 'ObjectExpression') {
    return node.properties.some((prop) => prop.type === 'SpreadElement')
  }

  if (node.type === 'ArrayExpression') {
    return node.elements.some(
      (element) => element?.type === 'SpreadElement' || containsSpread(element)
    )
  }

  if (node.type === 'ConditionalExpression') {
    return containsSpread(node.consequent) || containsSpread(node.alternate)
  }

  if (node.type === 'TSAsExpression') {
    return containsSpread(node.expression)
  }

  if (node.type === 'ExpressionStatement') {
    if (node.expression.type === 'AssignmentExpression') {
      return containsSpread(node.expression.right) || containsSpread(node.expression.left)
    }
  }

  return false
}
