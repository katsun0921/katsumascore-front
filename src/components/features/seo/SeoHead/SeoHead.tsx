import Head from 'next/head';
import { useLocale } from '@/i18n/provider';
import type { Post } from '@/types/post';

type SeoData = Pick<Post, 'title' | 'excerpt' | 'image' | 'publishedAt' | 'slug'>;

type Props = {
  post: SeoData;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'KatsumaScore';
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-default.png`;

export const SeoHead = ({ post }: Props) => {
  const locale = useLocale();
  const title = `${post.title} | ${SITE_NAME}`;
  const description = post.excerpt || post.title;
  const canonicalUrl = `${SITE_URL}${post.slug}`;
  const ogImage = post.image ?? FALLBACK_OG_IMAGE;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    image: ogImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    url: canonicalUrl,
    inLanguage: locale,
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      <link rel='canonical' href={canonicalUrl} />

      {/* Open Graph */}
      <meta property='og:type' content='article' />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={canonicalUrl} />
      <meta property='og:image' content={ogImage} />
      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:locale' content={locale === 'en' ? 'en_US' : 'ja_JP'} />

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={ogImage} />

      {/* JSON-LD */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  );
};
