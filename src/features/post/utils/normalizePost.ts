import type { PostCardData } from '@/features/post/types/PostCard';
import type { WPPost } from '@/types/wordpress';

export function normalizePost(post: WPPost, locale: string = 'ja'): PostCardData {
  const title =
    locale === 'ja'
      ? post.acf?.title_jp || post.title.rendered || ''
      : post.acf?.title_en || post.title.rendered || '';

  return {
    id: post.id,
    title,
    excerpt: post.excerpt?.rendered ?? '',
    thumbnail: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '/images/dummy-540X400.webp',
    category: undefined,
    score: post.acf?.review_score ? String(post.acf.review_score) as '1' | '2' | '3' | '4' | '5' : undefined,
    publishedAt: post.date,
    href: `/posts/${post.slug}`,
  };
}

export function normalizePosts(posts: WPPost[], locale: string = 'ja'): PostCardData[] {
  return posts.map((post) => normalizePost(post, locale));
}
