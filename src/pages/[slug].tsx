// ISR: revalidate 300s — WP固定ページ（特集ページ等）の動的ルート
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostContent } from '@/components/ui-section/PostPage/PostContent';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getPageBySlug, normalizePageContent, getFeaturedPages } from '@/libs/api/wordpress';

type WPPageProps = {
  title: string;
  html: string | null;
  locale: string;
};

const WPPage = ({ title, html, locale }: WPPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{title} | KatsumaScore</title>
      </Head>
      <PageLayout>
        <div className='px-4 py-8 max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6 text-[var(--color-text-primary)]'>{title}</h1>
          {html ? <PostContent content={html} /> : null}
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default WPPage;

export const getStaticPaths: GetStaticPaths = async ({ locales = ['ja'] }) => {
  const paths: { params: { slug: string }; locale: string }[] = [];
  for (const loc of locales.filter((l) => l !== 'default')) {
    const lang = loc === 'en' ? 'en' : 'ja';
    const pages = await getFeaturedPages(lang);
    for (const p of pages) {
      paths.push({ params: { slug: p.slug }, locale: loc });
    }
  }
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<WPPageProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };
  const currentLocale = locale === 'default' ? 'ja' : (locale ?? 'ja');
  const lang = currentLocale === 'en' ? 'en' : 'ja';
  const page = await getPageBySlug(slug, lang);
  if (!page) return { notFound: true };
  const normalized = normalizePageContent(page);

  return {
    props: {
      title: normalized.title,
      html: normalized.html,
      locale: currentLocale,
    },
    revalidate: 300,
  };
};
