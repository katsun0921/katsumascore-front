// ISR: revalidate REVALIDATE_DAILY — VOD配信情報（週次まとめ記事）詳細ページ
import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { REVALIDATE_DAILY } from '@/config/revalidate.config';
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PostContent } from '@/components/ui-section/PostPage/PostContent';
import { I18nProvider } from '@/i18n/provider';
import { t, type Locale } from '@/i18n/t';
import { messages } from '@/i18n/vodReleasePageMessages';
import { getVodReleaseBySlug } from '@/libs/api/wordpress';
import {
  getVodHubPath,
  getVodReleaseArchivePath,
  getVodReleaseUrl,
  normalizeRouteLocale,
} from '@/libs/route';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

type VodReleaseDetailProps = {
  title: string;
  html: string;
  slug: string;
  publishedAt: string;
  modifiedAt: string;
  locale: string;
};

/** HTMLタグを除いた先頭120字をメタディスクリプションに使う。 */
const buildDescription = (html: string, fallback: string): string => {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, 120) : fallback;
};

const VodReleaseDetailPage = ({
  title,
  html,
  slug,
  publishedAt,
  modifiedAt,
  locale,
}: VodReleaseDetailProps) => {
  const loc = normalizeRouteLocale(locale) as Locale;
  const canonicalUrl = `${SITE_URL}${getVodReleaseUrl(slug, loc)}`;
  const description = buildDescription(
    html,
    t(messages, ['head', 'detailDescriptionFallback'], loc),
  );

  const breadcrumbItems = [
    { label: t(messages, ['breadcrumb', 'home'], loc), href: '/' },
    { label: t(messages, ['breadcrumb', 'vodRelease'], loc), href: getVodReleaseArchivePath(loc) },
    { label: title },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: canonicalUrl,
    datePublished: publishedAt,
    dateModified: modifiedAt,
    publisher: {
      '@type': 'Organization',
      name: 'KatsumaScore',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href === '/' ? '' : item.href}` : canonicalUrl,
    })),
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${title} | KatsumaScore`}</title>
        <meta name='description' content={description} />
        <link rel='canonical' href={canonicalUrl} />
        <meta property='og:type' content='article' />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={description} />
        <meta property='og:url' content={canonicalUrl} />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>
      <PageLayout>
        <div className='px-4 pt-3 pb-0'>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <article className='mx-auto max-w-3xl px-4 py-8'>
          <h1 className='mb-2 text-2xl font-bold text-color-primary'>{title}</h1>
          <p className='mb-6 font-ui text-xs text-color-secondary'>
            {t(messages, ['detail', 'publishedAt'], loc)}: {publishedAt.slice(0, 10)}
          </p>
          <PostContent content={html} />
          <nav className='mt-10 flex flex-wrap gap-4 border-t border-color-border pt-6'>
            <Link href={getVodReleaseArchivePath(loc)} className='text-primary hover:underline'>
              {t(messages, ['detail', 'backToArchive'], loc)}
            </Link>
            <Link href={getVodHubPath(loc)} className='text-primary hover:underline'>
              {t(messages, ['detail', 'findByService'], loc)}
            </Link>
          </nav>
        </article>
      </PageLayout>
    </I18nProvider>
  );
};

export default VodReleaseDetailPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<VodReleaseDetailProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const wp = await getVodReleaseBySlug(slug);
  if (!wp) return { notFound: true };

  return {
    props: {
      title: wp.title.rendered,
      html: wp.content.rendered,
      slug: wp.slug,
      publishedAt: wp.date,
      modifiedAt: wp.modified,
      locale: normalizeRouteLocale(locale),
    },
    revalidate: REVALIDATE_DAILY,
  };
};
