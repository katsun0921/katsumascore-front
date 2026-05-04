/**
 * Rule: no-hardcoded-font-family
 *
 * Disallow direct usage of font-family values in JSX (style / className).
 * Enforce usage of Design Tokens (var(--font-*)).
 *
 * Bad:
 *   <div style={{ fontFamily: 'Kaisei Tokumin' }} />
 *   <div className="font-[Kaisei Tokumin]" />
 *
 * Good:
 *   <div style={{ fontFamily: 'var(--font-heading)' }} />
 *   className="font-heading"
 */

const FONT_RE = /\b(Noto Sans JP|Kaisei Tokumin|Rampart One|Yusei Magic|Inter)\b/

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded font-family usage. Use design tokens instead.',
    },
    messages: {
      noHardcodedFont:
        'Hardcoded font-family "{{font}}" found. Use a design token (var(--font-*)) instead.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (!filename.match(/\.(tsx|jsx)$/)) return {}

    function report(node, value) {
      context.report({
        node,
        messageId: 'noHardcodedFont',
        data: { font: value },
      })
    }

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier') return

        // style={{ fontFamily: 'Kaisei Tokumin' }}
        if (node.name.name === 'style') {
          const value = node.value
          if (value?.type !== 'JSXExpressionContainer') return

          const expr = value.expression
          if (expr.type !== 'ObjectExpression') return

          for (const prop of expr.properties) {
            if (prop.type !== 'Property') continue
            if (
              prop.key.type === 'Identifier' &&
              prop.key.name === 'fontFamily'
            ) {
              const val = prop.value

              if (
                val.type === 'Literal' &&
                typeof val.value === 'string' &&
                FONT_RE.test(val.value)
              ) {
                report(val, val.value)
              }
            }
          }
        }

        // className="..."
        if (node.name.name === 'className') {
          const value = node.value
          if (!value || value.type !== 'Literal') return

          if (
            typeof value.value === 'string' &&
            FONT_RE.test(value.value)
          ) {
            report(value, value.value)
          }
        }
      },
    }
  },
}

export default rule
