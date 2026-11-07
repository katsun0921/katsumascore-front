/** WordPress固定ページの親子関係を公開URLの階層へ変換する。 */
type PageEntry = { id: number; slug: string; parent?: number };

/** 親ページをルートまでたどり、ロケールなしの絶対パスを返す。親の欠落・循環時は誤ったURLを作らず失敗する。 */
export const getWpPagePath = (page: PageEntry, entries: readonly PageEntry[]): string => {
  const segments = [page.slug];
  const visited = new Set([page.id]);
  let parentId = page.parent;
  while (parentId) {
    if (visited.has(parentId)) throw new Error('WP page parent cycle');
    visited.add(parentId);
    const parent = entries.find((entry) => entry.id === parentId);
    if (!parent) throw new Error(`WP page parent missing: ${parentId}`);
    segments.unshift(parent.slug);
    parentId = parent.parent;
  }
  return `/${segments.map(encodeURIComponent).join('/')}`;
};
