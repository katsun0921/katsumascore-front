import Head from 'next/head';
import { ProductJsonLd, BreadcrumbJsonLd } from 'next-seo';
import { useLocale } from '@/i18n/provider';
import type { Post } from '@/types/post';

type SeoData = Pick<Post, 'title' | 'excerpt' | 'image' | 'publishedAt' | 'slug' | 'score' | 'category'>;

export type SeoHeadProps =
  | { post: SeoData }
  | { noIndex: true; pageTitle: string; pageDescription?: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'KatsumaScore';
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-default.png`;

export const SeoHead = (props: SeoHeadProps) => {
  const locale = useLocale();

  if ('noIndex' in props && props.noIndex) {
    const title = `${props.pageTitle} | ${SITE_NAME}`;
    return (
      <Head>
        <title>{title}</title>
        {props.pageDescription ? (
          <meta name='description' content={props.pageDescription} />
        ) : null}
        <meta name='robots' content='noindex, follow' />
        <meta property='og:locale' content={locale === 'en' ? 'en_US' : 'ja_JP'} />
      </Head>
    );
  }

  const { post } = props as { post: SeoData };
  const title = `${post.title} | ${SITE_NAME}`;
  const description = post.excerpt || post.title;
  const path = post.slug.startsWith('/') ? post.slug : `/${post.slug}`;
  const canonicalUrl = `${SITE_URL.replace(/\/$/, '')}${path}`;
  const ogImage = post.image ?? FALLBACK_OG_IMAGE;
  const jaUrl = `${SITE_URL.replace(/\/$/, '')}${path}`;
  const enUrl = `${SITE_URL.replace(/\/$/, '')}/en${path}`;

  const breadcrumbItems = [
    { name: 'HOME', item: SITE_URL },
    ...(post.category ? [{ name: post.category }] : []),
    { name: post.title, item: canonicalUrl },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <link rel='canonical' href={canonicalUrl} />
        <link rel='alternate' hrefLang='ja' href={jaUrl} />
        <link rel='alternate' hrefLang='en' href={enUrl} />
        <link rel='alternate' hrefLang='x-default' href={jaUrl} />

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
      </Head>

      <ProductJsonLd
        name={post.title}
        description={description}
        image={ogImage}
        review={
          post.score != null
            ? {
                reviewRating: { ratingValue: post.score, bestRating: 5 },
                author: { name: SITE_NAME },
              }
            : undefined
        }
        aggregateRating={
          post.score != null
            ? { ratingValue: post.score, reviewCount: 1, bestRating: 5 }
            : undefined
        }
      />

      <BreadcrumbJsonLd items={breadcrumbItems} />
    </>
  );
};
