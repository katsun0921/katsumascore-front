/**
 * Rule: no-direct-font-size
 *
 * Disallow hardcoded font-size values in JSX (style prop or Tailwind arbitrary values).
 * Enforce usage of Design Tokens (var(--font-size-*)).
 *
 * Bad:
 *   <div style={{ fontSize: '16px' }} />
 *   <div style={{ fontSize: 16 }} />
 *   <div className="text-[16px]" />
 *   <div className="text-[1rem]" />
 *
 * Good:
 *   <div style={{ fontSize: 'var(--font-size-body-pc)' }} />
 *   <div className="text-body" />
 */

// px / rem / em 値の正規表現
const FONT_SIZE_VALUE_RE = /\b\d+(\.\d+)?(px|rem|em)\b/

// Tailwind の任意値 text-[...] で px/rem/em を指定している
const TAILWIND_ARBITRARY_FONT_RE = /\btext-\[[\d.]+(?:px|rem|em)[^\]]*\]/

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded font-size values. Use design tokens (var(--font-size-*)) instead.',
    },
    messages: {
      noDirectFontSizeStyle:
        'Hardcoded fontSize "{{value}}" found in style prop. Use a design token (var(--font-size-*)) instead.',
      noDirectFontSizeTailwind:
        'Hardcoded Tailwind font-size "{{value}}" found. Use a token class (text-body, text-h1, …) instead.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (!filename.match(/\.(tsx|jsx)$/)) return {}

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier') return

        // ── style={{ fontSize: '...' }} ─────────────────────────
        if (node.name.name === 'style') {
          const value = node.value
          if (value?.type !== 'JSXExpressionContainer') return

          const expr = value.expression
          if (expr.type !== 'ObjectExpression') return

          for (const prop of expr.properties) {
            if (prop.type !== 'Property') continue
            const key = prop.key
            if (
              (key.type === 'Identifier' && key.name === 'fontSize') ||
              (key.type === 'Literal' && key.value === 'fontSize')
            ) {
              const val = prop.value
              // Literal string: '16px', '1rem' など
              if (
                val.type === 'Literal' &&
                typeof val.value === 'string' &&
                FONT_SIZE_VALUE_RE.test(val.value)
              ) {
                context.report({
                  node: val,
                  messageId: 'noDirectFontSizeStyle',
                  data: { value: val.value },
                })
              }
              // Numeric literal: 16 など (px単位省略)
              if (val.type === 'Literal' && typeof val.value === 'number') {
                context.report({
                  node: val,
                  messageId: 'noDirectFontSizeStyle',
                  data: { value: String(val.value) },
                })
              }
            }
          }
        }

        // ── className="... text-[16px] ..." ────────────────────
        if (node.name.name === 'className') {
          const value = node.value
          if (!value) return

          let classStr = null
          if (value.type === 'Literal' && typeof value.value === 'string') {
            classStr = value.value
          } else if (
            value.type === 'JSXExpressionContainer' &&
            value.expression.type === 'Literal' &&
            typeof value.expression.value === 'string'
          ) {
            classStr = value.expression.value
          }

          if (classStr && TAILWIND_ARBITRARY_FONT_RE.test(classStr)) {
            const match = classStr.match(TAILWIND_ARBITRARY_FONT_RE)
            context.report({
              node: value,
              messageId: 'noDirectFontSizeTailwind',
              data: { value: match?.[0] ?? classStr },
            })
          }
        }
      },
    }
  },
}

export default rule
