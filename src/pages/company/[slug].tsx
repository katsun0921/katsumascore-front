// ISR: revalidate 3600s — CPT company ページ（概要 / 制作作品 / 配給作品）
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { CompanyTemplate } from '@/components/templates/CompanyTemplate';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { normalizeRouteLocale } from '@/libs/route';
import { loadCompanyPage } from '@/libs/loadCompanyPage';
import type { Company } from '@/types/entity';
import type { Post } from '@/types/post';

type CompanyPageProps = {
  company: Company;
  productionPosts: Post[];
  distributorPosts: Post[];
  locale: string;
};

const CompanyPage = ({ company, productionPosts, distributorPosts, locale }: CompanyPageProps) => {
  const loc = (locale ?? 'ja') as Locale;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{company.name} | KatsumaScore</title>
        <meta
          name='description'
          content={company.description ?? `${company.name}の制作・配給作品 — スコアで選ぶ`}
        />
        <link rel='canonical' href={`/company/${company.slug}`} />
        <meta name='robots' content='index,follow' />
      </Head>
      <CompanyTemplate
        company={company}
        productionPosts={productionPosts}
        distributorPosts={distributorPosts}
      />
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
  const data = await loadCompanyPage(slug, currentLocale);
  if ('notFound' in data) return { notFound: true };

  return {
    props: {
      company: data.company,
      productionPosts: data.productionPosts,
      distributorPosts: data.distributorPosts,
      locale: currentLocale,
    },
    revalidate: 3600,
  };
};
