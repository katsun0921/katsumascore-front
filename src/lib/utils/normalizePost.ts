import type { WPPost } from '@/types/wordpress';
import type { Post } from '@/types/post';
import { mapWPPostToPost } from '@/lib/api/wordpress';

/** WP REST の記事配列を一覧用 Post に正規化（本文は破棄） */
export const normalizePosts = (wpPosts: WPPost[], _locale: string): Post[] => {
  void _locale;
  const out: Post[] = [];
  for (const p of wpPosts) {
    const m = mapWPPostToPost(p);
    if (m) {
      const { content, ...rest } = m;
      void content;
      out.push(rest);
    }
  }
  return out;
};
