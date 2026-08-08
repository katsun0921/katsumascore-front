import { parseDocument } from 'htmlparser2';
import { findAll, textContent } from 'domutils';

export type ReleaseWorkItem = {
  /** 作品タイトル（本文の h4 テキスト） */
  title: string;
  /** 直前の h3 見出し（劇場: 「8月8日(土)公開」/ VOD: サービス名） */
  meta?: string;
  /** 作品の詳細先。自サイトのレビュー記事を優先し、無ければ公式サイト等の外部URL */
  href?: string;
  /** `href` が自サイト外を指すか。外部リンクの装飾・`rel` 付与に使う */
  isExternal?: boolean;
};

/** 自サイトとみなすホスト。WPの管理ドメインもレビュー記事URLとして現れうる */
const INTERNAL_HOSTS = ['katsumascore.blog', 'cms.katsumascore.blog'];

/**
 * リンクを内部/外部に判定し、内部なら `<Link>` に渡せるパス（`/ja/movie/…`）へ正規化する。
 * news_bot はレビュー記事URLを絶対URLで埋め込むため、そのままでは内部遷移にならない。
 */
const resolveLink = (url: string): { href: string; isExternal: boolean } => {
  if (url.startsWith('/')) return { href: url, isExternal: false };
  try {
    const parsed = new URL(url);
    if (INTERNAL_HOSTS.includes(parsed.hostname)) {
      return { href: `${parsed.pathname}${parsed.search}${parsed.hash}`, isExternal: false };
    }
  } catch {
    // パースできないものは外部リンク扱いでそのまま出す
  }
  return { href: url, isExternal: true };
};

/**
 * 週次まとめ記事（theater_release / vod_release）の本文 HTML から作品リストを抽出する（サーバー側想定）。
 *
 * news_bot が生成する本文は `<section><h3>見出し</h3><h4>作品名</h4><p>…</p><p><a>リンク</a></p></section>`
 * の構造を持つ。h4 を作品タイトル、直前の h3（公開日 or サービス名）を meta として拾い、
 * 次の h4 までに現れる `<a>` を作品のリンク候補とする。
 *
 * リンクは自サイトのレビュー記事（`Katsumascore URL` 由来）を優先し、無ければ最初の外部リンク
 * （公式サイト / 作品詳細 / 予告編）を採用する。
 *
 * 「今週の注目作」「編集部おすすめ」セクションはタイトルが h3 側に入り h4 を持たないため、
 * この走査では自然に除外される（通常セクションとの重複も避けられる）。
 */
export const extractReleaseWorks = (html: string, max = 6): ReleaseWorkItem[] => {
  const dom = parseDocument(html);
  const nodes = findAll(
    (node) =>
      node.type === 'tag' && (node.name === 'h3' || node.name === 'h4' || node.name === 'a'),
    dom.children,
  );

  const works: ReleaseWorkItem[] = [];
  let currentMeta: string | undefined;
  let current: ReleaseWorkItem | undefined;

  for (const node of nodes) {
    const el = node as import('domhandler').Element;
    const text = textContent(el).trim();

    if (el.name === 'h3') {
      currentMeta = text;
      continue;
    }

    if (el.name === 'h4') {
      if (text.length === 0) continue;
      if (works.length >= max) break;
      current = { title: text, ...(currentMeta !== undefined ? { meta: currentMeta } : {}) };
      works.push(current);
      continue;
    }

    // <a>: 直近の作品に紐づける。レビュー記事が来たら外部リンクを上書きする
    const rawHref = el.attribs?.href;
    if (!current || !rawHref) continue;
    const { href, isExternal } = resolveLink(rawHref);
    if (current.href === undefined || (!isExternal && current.isExternal === true)) {
      current.href = href;
      current.isExternal = isExternal;
    }
  }

  return works;
};
