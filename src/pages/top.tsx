import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostContent } from '@/components/ui-section/PostPage/PostContent';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getPageBySlug } from '@/libs/api/wordpress';
import { stripHtml } from '@/libs/api/wordpress';

type TopPageProps = {
  title: string;
  html: string | null;
  locale: string;
};

const TopPage = ({ title, html, locale }: TopPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{title} | KatsumaScore</title>
      </Head>
      <PageLayout>
        <div className='px-4 py-8 max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6 text-color-primary'>{title}</h1>
          {html ? <PostContent content={html} /> : null}
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default TopPage;

export const getStaticProps: GetStaticProps<TopPageProps> = async ({ locale }) => {
  const currentLocale = locale ?? 'ja';
  const lang = currentLocale === 'en' ? 'en' : 'ja';
  const slug = process.env.WP_TOP_PAGE_SLUG ?? 'top';
  const page = await getPageBySlug(slug, lang);
  if (!page) {
    return {
      props: {
        title: 'Top',
        html: null,
        locale: currentLocale,
      },
      revalidate: 60,
    };
  }
  return {
    props: {
      title: stripHtml(page.title.rendered),
      html: page.content?.rendered ?? null,
      locale: currentLocale,
    },
    revalidate: 60,
  };
};
