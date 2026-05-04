/**
 * Rule: no-hardcoded-hex-color
 *
 * Inline style props must not contain hardcoded hex color values.
 * Use SCSS variables ($scoreBackground, etc.) or Tailwind tokens instead.
 *
 * Bad:
 *   <div style={{ color: '#e50914' }} />
 *   <div style={{ background: '#fff', borderColor: '#000000' }} />
 *
 * Good:
 *   <div style={{ color: 'var(--color-netflix)' }} />
 *   className="text-purple-900"  (Tailwind token)
 *   .c-component { color: $colorNetflix }  (SCSS variable)
 */

const HEX_RE = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded hex colors in JSX inline style props. Use SCSS variables or CSS custom properties.',
    },
    messages: {
      noHardcodedColor:
        'Hardcoded color "{{color}}" found in inline style. Use a design token (SCSS variable or CSS custom property) instead.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (!filename.match(/\.(tsx|jsx)$/)) return {}

    /**
     * Recursively check ObjectExpression properties for hex string literals.
     * Also handles spread / nested objects shallowly.
     */
    function checkObject(objNode) {
      for (const prop of objNode.properties) {
        if (prop.type !== 'Property') continue
        const val = prop.value

        if (val.type === 'Literal' && typeof val.value === 'string' && HEX_RE.test(val.value)) {
          context.report({
            node: val,
            messageId: 'noHardcodedColor',
            data: { color: val.value },
          })
        }

        // style={{ background: condition ? '#fff' : '#000' }}
        if (val.type === 'ConditionalExpression') {
          for (const branch of [val.consequent, val.alternate]) {
            if (branch.type === 'Literal' && typeof branch.value === 'string' && HEX_RE.test(branch.value)) {
              context.report({
                node: branch,
                messageId: 'noHardcodedColor',
                data: { color: branch.value },
              })
            }
          }
        }
      }
    }

    return {
      JSXAttribute(node) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          node.name.name !== 'style'
        ) return

        const value = node.value
        if (value?.type !== 'JSXExpressionContainer') return

        const expr = value.expression
        if (expr.type === 'ObjectExpression') {
          checkObject(expr)
        }
      },
    }
  },
}

export default rule
