/**
 * i18n translation function
 *
 * Usage:
 *   import { t } from '@/i18n/t'
 *   import { messages } from './i18n'
 *
 *   const label = t(messages, ['cta', 'watch'], locale)
 *
 * Falls back to 'ja' if the requested locale key is missing.
 * Emits console.warn on missing paths.
 */

export type Locale = 'ja' | 'en'

type LeafNode = { ja: string; en: string }
type MessageTree = { [key: string]: MessageTree | LeafNode }

function isLeaf(node: MessageTree | LeafNode): node is LeafNode {
  return typeof (node as LeafNode).ja === 'string'
}

export function t(
  messages: MessageTree,
  path: string[],
  locale: Locale = 'ja',
): string {
  let current: MessageTree | LeafNode = messages

  for (const key of path) {
    if (typeof current !== 'object' || current === null || !(key in current)) {
      console.warn(`[i18n] Missing key: "${path.join('.')}"`)
      return path[path.length - 1] ?? ''
    }
    current = (current as MessageTree)[key]
  }

  if (!isLeaf(current)) {
    console.warn(`[i18n] Path "${path.join('.')}" does not point to a leaf node.`)
    return path[path.length - 1] ?? ''
  }

  return current[locale] ?? current['ja']
}
