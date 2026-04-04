/**
 * Rule: no-postlist-section-title
 *
 * PostList is a pure rendering list. It must not own section titles (h1–h3).
 * Business copy like "記事がまだありません" belongs in the parent (page or template).
 *
 * Bad:
 *   // PostList.tsx
 *   return (
 *     <section>
 *       <h2>記事がまだありません</h2>   ← hardcoded section title
 *     </section>
 *   )
 *
 * Good:
 *   // PostList.tsx — pass empty state slot as a prop or children
 *   return posts.length === 0 ? emptyState : <ul>...</ul>
 *
 *   // Parent decides the copy
 *   <PostList emptyState={<p>記事がまだありません</p>} posts={posts} />
 *
 * Applies to: any file with 'PostList' in its path (not stories)
 */

const HEADING_TAGS = new Set(['h1', 'h2', 'h3'])

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'PostList must not render section headings (h1–h3). Move titles to the parent or accept them as props.',
    },
    messages: {
      noSectionTitle:
        '<{{tag}}> found in PostList. Section titles are the parent\'s responsibility — pass them as children or a prop.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()

    if (!filename.includes('PostList')) return {}
    if (filename.includes('.stories.')) return {}

    return {
      JSXOpeningElement(node) {
        if (
          node.name.type === 'JSXIdentifier' &&
          HEADING_TAGS.has(node.name.name)
        ) {
          context.report({
            node,
            messageId: 'noSectionTitle',
            data: { tag: node.name.name },
          })
        }
      },
    }
  },
}

export default rule
