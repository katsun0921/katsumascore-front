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
