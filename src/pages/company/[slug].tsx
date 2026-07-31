// ISR: revalidate REVALIDATE_DAILY — company CPT 詳細ページ
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { REVALIDATE_DAILY } from '@/config/revalidate.config';
import { I18nProvider } from '@/i18n/provider';
import { getCompanyBySlug, getPostsByCompanyId, transformCompany } from '@/libs/api/wordpress';
import type { CompanyRelatedPost } from '@/libs/api/wordpress';
import { CompanyTemplate } from '@/components/templates/CompanyTemplate';
import { getEntityUrl, normalizeRouteLocale } from '@/libs/route';
import type { Company } from '@/libs/api/wordpress/transform';
import type { Locale } from '@/i18n/t';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

type CompanyPageProps = {
  company: Company;
  posts: CompanyRelatedPost[];
  locale: string;
};

const CompanyPage = ({ company, posts, locale }: CompanyPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  const displayName = loc === 'en' ? company.nameEn : company.nameJa;
  const altName = loc === 'en' ? company.nameJa : company.nameEn;
  const description = company.description
    ? company.description.slice(0, 120)
    : `${displayName}の制作・配給作品一覧`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: loc === 'en' ? 'Company' : '企業', href: '/' },
    { label: displayName, href: getEntityUrl('company', company.slug, loc) },
  ];

  const jaUrl = `${SITE_URL}${getEntityUrl('company', company.slug, 'ja')}`;
  const enUrl = `${SITE_URL}${getEntityUrl('company', company.slug, 'en')}`;
  const canonicalUrl = loc === 'en' ? enUrl : jaUrl;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${displayName}（${altName}）| KatsumaScore`}</title>
        <meta name='description' content={description} />
        <link rel='canonical' href={canonicalUrl} />
        <link rel='alternate' hrefLang='ja' href={jaUrl} />
        <link rel='alternate' hrefLang='en' href={enUrl} />
        <link rel='alternate' hrefLang='x-default' href={jaUrl} />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: company.nameJa,
              alternateName: company.nameEn,
              logo: company.logo?.url,
              description: company.description,
            }),
          }}
        />
      </Head>
      <CompanyTemplate company={company} posts={posts} breadcrumbs={breadcrumbs} />
    </I18nProvider>
  );
};

export default CompanyPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<CompanyPageProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const wp = await getCompanyBySlug(slug);
  if (!wp) return { notFound: true };

  const posts = await getPostsByCompanyId(wp.id, { lang: currentLocale, per_page: 100 });

  return {
    props: {
      company: transformCompany(wp),
      posts,
      locale: currentLocale,
    },
    revalidate: REVALIDATE_DAILY,
  };
};
