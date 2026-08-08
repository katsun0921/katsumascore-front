import { parseDocument } from 'htmlparser2';
import { findAll, textContent } from 'domutils';

export type ReleaseWorkItem = {
  /** 作品タイトル（本文の h4 テキスト） */
  title: string;
  /** 直前の h3 見出し（劇場: 「8月8日(土)公開」/ VOD: サービス名） */
  meta?: string;
};

/**
 * 週次まとめ記事（theater_release / vod_release）の本文 HTML から作品リストを抽出する（サーバー側想定）。
 *
 * news_bot が生成する本文は `<section><h3>見出し</h3><h4>作品名</h4>…</section>` の構造を持つ。
 * h4 を作品タイトル、直前の h3（公開日 or サービス名）を meta として拾う。
 * 「今週の注目作」「編集部おすすめ」セクションはタイトルが h3 側に入り h4 を持たないため、
 * この走査では自然に除外される（通常セクションとの重複も避けられる）。
 */
export const extractReleaseWorks = (html: string, max = 6): ReleaseWorkItem[] => {
  const dom = parseDocument(html);
  const headings = findAll(
    (node) => node.type === 'tag' && (node.name === 'h3' || node.name === 'h4'),
    dom.children,
  );

  const works: ReleaseWorkItem[] = [];
  let currentMeta: string | undefined;
  for (const node of headings) {
    const el = node as import('domhandler').Element;
    const text = textContent(el).trim();
    if (el.name === 'h3') {
      currentMeta = text;
      continue;
    }
    if (text.length === 0) continue;
    works.push({ title: text, ...(currentMeta !== undefined ? { meta: currentMeta } : {}) });
    if (works.length >= max) break;
  }
  return works;
};
