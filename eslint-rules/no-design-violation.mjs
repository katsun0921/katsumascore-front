/**
 * Rule: no-design-violation
 *
 * Enforces Spacing / Breakpoint / Media Query design token usage.
 *
 * Violations detected:
 *   1. Tailwind arbitrary spacing: p-[16px], m-[8px], gap-[24px] → use token class
 *   2. Hardcoded breakpoint px values in className strings / matchMedia
 *   3. max-width usage in className strings (SP-first: min-width only)
 *   4. style prop with spacing properties (margin / padding / gap)
 *
 * Bad:
 *   <div className="p-[16px] gap-[8px]" />
 *   <div className="max-w-[640px]" />
 *   <div style={{ padding: '16px', margin: 8 }} />
 *
 * Good:
 *   <div className="p-4 gap-2" />
 *   <div style={{ padding: 'var(--space-16)' }} />
 */

// Tailwind arbitrary spacing: p-[...], m-[...], gap-[...], px-[...], py-[...] etc.
const ARBITRARY_SPACING_RE =
  /\b(?:p|m|gap|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-\[[\d.]+(?:px|rem|em)[^\]]*\]/

// Hardcoded breakpoint values that must come from tokens
const BREAKPOINT_VALUES = ['640px', '768px', '1024px', '1280px']

// Spacing style properties
const SPACING_PROPS = new Set(['margin', 'padding', 'gap'])

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce Spacing / Breakpoint design token usage. No arbitrary values, no hardcoded breakpoints, no max-width, no inline spacing.',
    },
    messages: {
      noArbitrarySpacing:
        'Arbitrary spacing "{{value}}" is forbidden. Use a Tailwind token class (p-4, gap-2, …) instead.',
      noHardcodedBreakpoint:
        'Hardcoded breakpoint value "{{value}}" is forbidden. Use design tokens via Tailwind prefixes (sm: / md: / lg: / xl:).',
      noMaxWidth:
        'max-width is forbidden (SP-first design). Use min-width via Tailwind prefixes instead.',
      noInlineSpacing:
        'Inline "{{key}}" is forbidden. Use Tailwind token classes or CSS variables (var(--space-*)) in SCSS instead.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (!filename.match(/\.(tsx|jsx)$/)) return {}

    /**
     * Extract all string literals from a JSX attribute value,
     * including template literals and ternary branches.
     */
    function getStringValues(node) {
      const results = []
      if (!node) return results

      if (node.type === 'Literal' && typeof node.value === 'string') {
        results.push({ str: node.value, node })
      } else if (node.type === 'JSXExpressionContainer') {
        results.push(...getStringValues(node.expression))
      } else if (node.type === 'TemplateLiteral') {
        for (const quasi of node.quasis) {
          results.push({ str: quasi.value.raw, node: quasi })
        }
      } else if (node.type === 'ConditionalExpression') {
        results.push(...getStringValues(node.consequent))
        results.push(...getStringValues(node.alternate))
      } else if (node.type === 'LogicalExpression') {
        results.push(...getStringValues(node.right))
      }
      return results
    }

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier') return
        const attrName = node.name.name

        // ── className checks ─────────────────────────────────────────
        if (attrName === 'className') {
          for (const { str, node: strNode } of getStringValues(node.value)) {
            // 1. Arbitrary spacing
            const spacingMatch = str.match(ARBITRARY_SPACING_RE)
            if (spacingMatch) {
              context.report({
                node: strNode,
                messageId: 'noArbitrarySpacing',
                data: { value: spacingMatch[0] },
              })
            }

            // 2. Hardcoded breakpoint values
            for (const bp of BREAKPOINT_VALUES) {
              if (str.includes(bp)) {
                context.report({
                  node: strNode,
                  messageId: 'noHardcodedBreakpoint',
                  data: { value: bp },
                })
              }
            }

            // 3. max-width
            if (str.includes('max-w-') || str.includes('max-width')) {
              context.report({
                node: strNode,
                messageId: 'noMaxWidth',
              })
            }
          }
        }

        // ── style prop checks ─────────────────────────────────────────
        if (attrName === 'style') {
          const value = node.value
          if (value?.type !== 'JSXExpressionContainer') return

          const expr = value.expression
          if (expr.type !== 'ObjectExpression') return

          for (const prop of expr.properties) {
            if (prop.type !== 'Property') continue
            const key = prop.key
            const keyName =
              key.type === 'Identifier'
                ? key.name
                : key.type === 'Literal'
                  ? String(key.value)
                  : null
            if (!keyName) continue

            if (SPACING_PROPS.has(keyName)) {
              context.report({
                node: prop,
                messageId: 'noInlineSpacing',
                data: { key: keyName },
              })
            }
          }
        }
      },

      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') return
        if (node.callee.property.type !== 'Identifier') return
        if (node.callee.property.name !== 'matchMedia') return

        const [firstArg] = node.arguments
        if (!firstArg || firstArg.type !== 'Literal' || typeof firstArg.value !== 'string') return

        const mediaQuery = firstArg.value

        for (const bp of BREAKPOINT_VALUES) {
          if (mediaQuery.includes(bp)) {
            context.report({
              node: firstArg,
              messageId: 'noHardcodedBreakpoint',
              data: { value: bp },
            })
          }
        }

        if (mediaQuery.includes('max-width')) {
          context.report({
            node: firstArg,
            messageId: 'noMaxWidth',
          })
        }
      },
    }
  },
}

export default rule
