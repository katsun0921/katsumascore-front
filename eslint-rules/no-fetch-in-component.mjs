/**
 * Rule: no-fetch-in-component
 *
 * Components must not call fetch() directly.
 * Data fetching belongs in lib/ (getStaticProps / getServerSideProps / SWR hooks).
 *
 * Bad:
 *   const res = await fetch('/api/posts')          // inside a component file
 *   useEffect(() => { fetch(...) }, [])
 *
 * Good:
 *   export async function getServerSideProps() { ... }  // in pages/
 *   const { data } = useSWR(...)                        // SWR hook
 */

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct fetch() calls inside component files. Move data fetching to lib/ or page-level data functions.',
    },
    messages: {
      noFetch:
        'Components must not call fetch() directly. Use getServerSideProps, getStaticProps, or a custom hook in lib/.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()

    // Only apply inside src/components/**
    if (!filename.includes('/components/')) return {}

    // Skip story files — they may fetch mock data
    if (filename.includes('.stories.')) return {}

    return {
      CallExpression(node) {
        const { callee } = node

        // fetch(...)
        if (callee.type === 'Identifier' && callee.name === 'fetch') {
          context.report({ node, messageId: 'noFetch' })
          return
        }

        // window.fetch(...)
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'window' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'fetch'
        ) {
          context.report({ node, messageId: 'noFetch' })
        }
      },
    }
  },
}

export default rule
