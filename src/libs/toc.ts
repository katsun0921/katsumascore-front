import { parseDocument } from 'htmlparser2';
import { findAll, textContent } from 'domutils';

export type TocItem = {
  id: string
  text: string
  level: 2 | 3 | 4
}

/**
 * 記事本文 HTML から h2 / h3 / h4 を抽出して目次アイテムを生成する（サーバー側想定）。
 * id 属性があればその値を使い、無い場合は `heading-{index}` を付与する。
 */
export const extractToc = (html: string): TocItem[] => {
  const dom = parseDocument(html);
  const headings = findAll(
    (node) => node.type === 'tag' && (node.name === 'h2' || node.name === 'h3' || node.name === 'h4'),
    dom.children,
  );

  return headings.map((node, i) => {
    const el = node as import('domhandler').Element;
    const id = (el.attribs?.id as string | undefined) ?? `heading-${i}`;
    const text = textContent(el).trim();
    const level: 2 | 3 | 4 = el.name === 'h2' ? 2 : el.name === 'h3' ? 3 : 4;
    return { id, text, level };
  });
};
