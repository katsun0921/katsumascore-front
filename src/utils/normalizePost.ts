import type { WPPost } from '@/types/wordpress';
import type { Post } from '@/types/post';
import type { Locale } from '@/libs/api/wordpress/lang';
import { mapWPPostToPost } from '@/libs/api/wordpress';

/** WP REST の記事配列を一覧用 Post に正規化し、locale で言語フィルタをかける */
export const normalizePosts = (wpPosts: WPPost[], locale: Locale): Post[] => {
  const out: Post[] = [];
  for (const p of wpPosts) {
    const m = mapWPPostToPost(p);
    if (!m) continue;
    if (m.lang && m.lang !== locale) continue;
    const { content, ...rest } = m;
    void content;
    out.push(rest);
  }
  return out;
};

/**
 * 取得時に REST の `lang` クエリで既に言語絞り込み済みの一覧向け。
 * ACF `lang` / link 由来の `m.lang` が実体とずれていると `normalizePosts` で記事がすべて落ちるため、こちらではクライアント側の言語フィルタを行わない。
 */
export const normalizePostsFromLangScopedQuery = (wpPosts: WPPost[]): Post[] => {
  const out: Post[] = [];
  for (const p of wpPosts) {
    const m = mapWPPostToPost(p);
    if (!m) continue;
    const { content, ...rest } = m;
    void content;
    out.push(rest);
  }
  return out;
};
