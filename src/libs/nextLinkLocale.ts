/** href にロケール接頭辞が含まれる場合、next/link の二重付与を防ぐ */
export const linkLocaleForHref = (href: string): false | undefined =>
  href.startsWith('/ja/') || href.startsWith('/en/') ? false : undefined;
