/**
 * `next/link` の `locale` 自動付与を制御する。
 * `href` が `/ja/` または `/en/` で始まる場合は `locale={false}` 相当として `false` を返し、二重接頭辞を防ぐ。
 */
export const linkLocaleForHref = (href: string): false | undefined =>
  href.startsWith('/ja/') || href.startsWith('/en/') ? false : undefined;
