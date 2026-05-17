// ISR: revalidate 86400s (24h) — company CPT 詳細ページ
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { I18nProvider } from '@/i18n/provider';
import { getCompanyBySlug } from '@/libs/api/wordpress';
import { transformCompany } from '@/libs/api/wordpress';
import { CompanyTemplate } from '@/components/templates/CompanyTemplate';
import { getEntityUrl, normalizeRouteLocale } from '@/libs/route';
import type { Company } from '@/libs/api/wordpress/transform';
import type { Locale } from '@/i18n/t';

type CompanyPageProps = {
  company: Company;
  locale: string;
};

const CompanyPage = ({ company, locale }: CompanyPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  const displayName = loc === 'en' ? company.nameEn : company.nameJa;
  const altName = loc === 'en' ? company.nameJa : company.nameEn;
  const description = company.description
    ? company.description.slice(0, 120)
    : `${displayName}の制作・配給作品一覧`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: loc === 'en' ? 'Company' : '企業', href: '/company' },
    { label: displayName, href: getEntityUrl('company', company.slug, loc) },
  ];

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${displayName}（${altName}）| KatsumaScore`}</title>
        <meta name='description' content={description} />
        <link
          rel='canonical'
          href={`https://katsumascore.blog/company/${company.slug}`}
        />
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
      <CompanyTemplate company={company} breadcrumbs={breadcrumbs} />
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

  return {
    props: {
      company: transformCompany(wp),
      locale: currentLocale,
    },
    revalidate: 60 * 60 * 24,
  };
};
