/**
 * ESLint rule: no-hardcoded-i18n
 *
 * Disallows hardcoded UI text strings (Japanese or English words) in JSX.
 * All visible text must go through the i18n system (i18n.ts per component).
 *
 * Phase 1: warn — allows gradual adoption
 * Phase 2: error — enforced after i18n coverage is sufficient
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded UI text — must use i18n (messages from i18n.ts)',
    },
    schema: [],
  },

  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return

        const text = node.value

        // Skip empty / whitespace-only strings
        if (!text.trim()) return

        // Skip technical strings: URLs, class names, keys, CSS values, etc.
        if (/^[a-z0-9-_:/\\.]+$/i.test(text)) return

        const isJapanese = /[\u3040-\u30ff\u4e00-\u9faf]/.test(text)
        const isEnglishWord = /^[A-Za-z ]+$/.test(text)

        if (isJapanese || isEnglishWord) {
          context.report({
            node,
            message: 'UI text must use i18n — define in i18n.ts and access via path array.',
          })
        }
      },
    }
  },
}
