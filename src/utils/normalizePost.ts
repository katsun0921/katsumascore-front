import { publicAssetUrl } from '@/lib/publicAssetUrl';
import type { Post } from '@/types/post';
import type { WPPost } from '@/types/wordpress';

export const normalizePost = (post: WPPost, locale: string = 'ja'): Post => {
  const title =
    locale === 'ja'
      ? post.acf?.title_jp || post.title.rendered || ''
      : post.acf?.title_en || post.title.rendered || '';

  const score = typeof post.acf?.review_score === 'number' ? post.acf.review_score : undefined;
  return {
    id: String(post.id),
    slug: `/posts/${post.slug}`,
    title,
    excerpt: post.excerpt?.rendered ?? '',
    image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? publicAssetUrl('/images/mock-image.webp'),
    publishedAt: post.date,
    ...(score !== undefined ? { score } : {}),
  };
}

export const normalizePosts = (posts: WPPost[], locale: string = 'ja'): Post[] =>
  posts.map((post) => normalizePost(post, locale));
