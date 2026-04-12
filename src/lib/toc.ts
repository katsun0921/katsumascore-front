/**
 * 記事本文 HTML から h2 / h3 を抽出して目次アイテムを生成する。
 * getServerSideProps（サーバーサイド）で呼び出す。
 *
 * - h タグに id がある場合はそのまま利用
 * - id がない場合は "heading-{index}" を採番
 */
import { parseDocument } from 'htmlparser2'
import { findAll, textContent } from 'domutils'

export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

export const extractToc = (html: string): TocItem[] => {
  const dom = parseDocument(html)
  const headings = findAll(
    (node) => node.type === 'tag' && (node.name === 'h2' || node.name === 'h3'),
    dom.children,
  )

  return headings.map((node, i) => {
    const el = node as import('domhandler').Element
    const id = (el.attribs?.id as string | undefined) ?? `heading-${i}`
    const text = textContent(el).trim()
    const level: 2 | 3 = el.name === 'h2' ? 2 : 3
    return { id, text, level }
  })
}
