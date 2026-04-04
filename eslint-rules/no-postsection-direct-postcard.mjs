/**
 * Rule: no-postsection-direct-postcard
 *
 * PostSection is a layout wrapper. It must not import or render PostCard directly.
 * Pass PostCard as `children` from the parent instead.
 *
 * Bad:
 *   // PostSection.tsx
 *   import { PostCard } from '@/components/features/post/PostCard/PostCard'
 *   return <section><PostCard post={p} /></section>
 *
 * Good:
 *   // PostSection.tsx
 *   return <section className="c-postSection">{children}</section>
 *
 *   // Parent (page or template)
 *   <PostSection>
 *     <PostCard post={post} />
 *   </PostSection>
 *
 * Applies to: any file with 'PostSection' in its path (not stories)
 */

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'PostSection must not import or render PostCard directly. It should only wrap children.',
    },
    messages: {
      noImport:
        'PostSection must not import PostCard. Pass PostCard as children from the parent component.',
      noJSXUsage:
        'PostSection must not render <PostCard> directly. Use children composition instead.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()

    if (!filename.includes('PostSection')) return {}
    if (filename.includes('.stories.')) return {}

    return {
      ImportDeclaration(node) {
        if (typeof node.source.value === 'string' && node.source.value.includes('PostCard')) {
          context.report({ node, messageId: 'noImport' })
        }
      },

      JSXOpeningElement(node) {
        if (
          node.name.type === 'JSXIdentifier' &&
          node.name.name === 'PostCard'
        ) {
          context.report({ node, messageId: 'noJSXUsage' })
        }
        // Also catch member expressions: <Post.Card />
        if (
          node.name.type === 'JSXMemberExpression' &&
          node.name.property.type === 'JSXIdentifier' &&
          node.name.property.name === 'PostCard'
        ) {
          context.report({ node, messageId: 'noJSXUsage' })
        }
      },
    }
  },
}

export default rule
