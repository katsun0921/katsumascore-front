/**
 * Rule: no-variant-layout-prop
 *
 * Variant props must not encode layout/presentation choices.
 * Create separate components instead.
 *
 * Bad (variant explosion):
 *   variant === 'grid'     → use PostGrid component
 *   variant === 'list'     → use PostList component
 *   variant === 'overlay'  → use PostOverlay component
 *   variant === 'left'     → use PostLeftImage component
 *
 * Good:
 *   size === 'small' | 'large'     (dimension variant — OK)
 *   theme === 'light' | 'dark'     (color variant — OK)
 *   <PostGrid />  <PostOverlay />  (separate components — OK)
 *
 * Applies to: src/components/**\/*.tsx (not stories)
 */

const FORBIDDEN_LAYOUT_VALUES = new Set([
  'grid',
  'list',
  'overlay',
  'left',
  'right',
  'center',
  'featured',
  'compact',
  'inline',
  'block',
  'sidebar',
])

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow variant props with layout values. Create a separate component for each layout variant.',
    },
    messages: {
      noVariantLayout:
        'variant="{{value}}" encodes a layout choice. Create a dedicated component for this layout (e.g. PostGrid, PostOverlay, PostLeftImage) instead of branching on variant.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()

    if (!filename.includes('/components/')) return {}
    if (!filename.endsWith('.tsx')) return {}
    if (filename.includes('.stories.')) return {}

    function checkVariantComparison(node) {
      if (node.operator !== '===' && node.operator !== '==') return

      const check = (ident, literal) => {
        if (
          ident.type === 'Identifier' &&
          ident.name === 'variant' &&
          literal.type === 'Literal' &&
          typeof literal.value === 'string' &&
          FORBIDDEN_LAYOUT_VALUES.has(literal.value)
        ) {
          context.report({
            node,
            messageId: 'noVariantLayout',
            data: { value: literal.value },
          })
        }
      }

      check(node.left, node.right)
      check(node.right, node.left)
    }

    return {
      // variant === 'grid'
      BinaryExpression: checkVariantComparison,

      // variant prop type definition: variant?: 'grid' | 'list'
      // Catches the type union literal values in .tsx type annotations
      TSLiteralType(node) {
        const literal = node.literal
        if (
          literal.type === 'Literal' &&
          typeof literal.value === 'string' &&
          FORBIDDEN_LAYOUT_VALUES.has(literal.value)
        ) {
          // Walk up to find if this is inside a property named 'variant'
          let parent = node.parent
          while (parent) {
            if (
              parent.type === 'TSPropertySignature' &&
              parent.key?.type === 'Identifier' &&
              parent.key.name === 'variant'
            ) {
              context.report({
                node: literal,
                messageId: 'noVariantLayout',
                data: { value: literal.value },
              })
              break
            }
            // Stop climbing at function/component boundary
            if (['FunctionDeclaration', 'ArrowFunctionExpression', 'Program'].includes(parent.type)) break
            parent = parent.parent
          }
        }
      },
    }
  },
}

export default rule
