import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostContent } from '@/components/ui-section/PostPage/PostContent';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getChildPages, getPageBySlug } from '@/lib/api/wordpress';
import { stripHtml } from '@/lib/api/wordpress';

type SeasonalDetailProps = {
  title: string;
  html: string | null;
  locale: string;
};

const SeasonalDetailPage = ({ title, html, locale }: SeasonalDetailProps) => {
  const loc = (locale ?? 'ja') as Locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{title} | KatsumaScore</title>
      </Head>
      <PageLayout>
        <div className='px-4 py-8 max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6 text-[var(--color-text)]'>{title}</h1>
          {html ? <PostContent content={html} /> : null}
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default SeasonalDetailPage;

export const getStaticPaths: GetStaticPaths = async ({ locales = ['ja'] }) => {
  const paths: { params: { slug: string }; locale: string }[] = [];
  const parentRaw = process.env.WP_SEASONAL_REVIEW_PARENT_ID;
  if (!parentRaw || !/^\d+$/.test(parentRaw)) {
    return { paths: [], fallback: 'blocking' };
  }
  const parentId = Number(parentRaw);
  for (const loc of locales) {
    const lang = loc === 'en' ? 'en' : 'ja';
    const children = await getChildPages(parentId, lang);
    for (const p of children) {
      paths.push({ params: { slug: p.slug }, locale: loc });
    }
  }
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<SeasonalDetailProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };
  const currentLocale = locale ?? 'ja';
  const lang = currentLocale === 'en' ? 'en' : 'ja';
  const page = await getPageBySlug(slug, lang);
  if (!page) return { notFound: true };

  return {
    props: {
      title: stripHtml(page.title.rendered),
      html: page.content?.rendered ?? null,
      locale: currentLocale,
    },
    revalidate: 60,
  };
};
