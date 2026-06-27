// ISR: revalidate REVALIDATE_LOW — franchise（シリーズ）特集ページ
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { REVALIDATE_LOW } from '@/config/revalidate.config';
import { I18nProvider } from '@/i18n/provider';
import {
  getAllFranchiseSlugs,
  getFranchiseBySlug,
  transformFranchise,
  getPostsByFranchiseTermId,
  mapWPPostToPost,
} from '@/libs/api/wordpress';
import { FranchiseTemplate } from '@/components/templates/FranchiseTemplate';
import { normalizeRouteLocale } from '@/libs/route';
import type { Franchise } from '@/types/franchise';
import type { Locale } from '@/i18n/t';

type FranchisePageProps = {
  franchise: Franchise;
  locale: string;
};

const FranchisePage = ({ franchise, locale }: FranchisePageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  const description = franchise.description
    ? franchise.description.slice(0, 120)
    : `${franchise.title}のシリーズ特集・作品一覧`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: loc === 'en' ? 'Franchise' : 'シリーズ', href: '/' },
    { label: franchise.title, href: `/franchise/${franchise.slug}` },
  ];

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${franchise.title} | 完全ガイド - KatsumaScore`}</title>
        <meta name='description' content={description} />
        <link
          rel='canonical'
          href={`https://katsumascore.blog/franchise/${franchise.slug}`}
        />
        {franchise.heroImage && (
          <>
            <meta property='og:image' content={franchise.heroImage.url} />
            <meta property='og:image:alt' content={franchise.heroImage.alt} />
          </>
        )}
        <meta property='og:title' content={`${franchise.title} | 完全ガイド - KatsumaScore`} />
        <meta property='og:description' content={description} />
        <meta property='og:type' content='website' />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: franchise.title,
              description: franchise.description,
              image: franchise.heroImage?.url,
            }),
          }}
        />
      </Head>
      <FranchiseTemplate franchise={franchise} breadcrumbs={breadcrumbs} />
    </I18nProvider>
  );
};

export default FranchisePage;

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllFranchiseSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<FranchisePageProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const term = await getFranchiseBySlug(slug);
  if (!term) return { notFound: true };

  const [wpPosts] = await Promise.all([getPostsByFranchiseTermId(term.id)]);
  const posts = wpPosts.flatMap((wp) => {
    const post = mapWPPostToPost(wp);
    return post ? [post] : [];
  });

  return {
    props: {
      franchise: transformFranchise(term, posts),
      locale: currentLocale,
    },
    revalidate: REVALIDATE_LOW,
  };
};
