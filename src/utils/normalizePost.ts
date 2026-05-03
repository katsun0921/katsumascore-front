import type { WPPost } from '@/types/wordpress';
import type { Post } from '@/types/post';
import type { Locale } from '@/libs/api/wordpress/lang';
import { mapWPPostToPost } from '@/libs/api/wordpress';

/**
 * WP REST の記事配列を一覧用 Post に正規化し、ACF 由来の `m.lang` で言語フィルタをかける。
 * カテゴリ等のクエリだけでは英日投稿が混ざることがあるため、一覧は常にこちらを使う。
 */
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

