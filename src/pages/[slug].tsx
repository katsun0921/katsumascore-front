// SSG: WP固定ページ。日次ビルドで事前生成するのはjaのみ（enはfallback blocking）。正常ページはrevalidateなし。404のみ60秒で再検証
import { REVALIDATE_NOT_FOUND } from '@/config/revalidate.config';
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { makeDetailStaticPaths } from '@/libs/api/wordpress/staticPaths';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostContent } from '@/components/ui-section/PostPage/PostContent';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getPageBySlug, normalizePageContent, getPostBySlug, parseWPPostUnknown } from '@/libs/api/wordpress';
import { resolvePostType, getPostUrl } from '@/libs/route';

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

// 固定ページは日本語運用のため、事前生成はjaに限定してビルド件数を抑える。
export const getStaticPaths: GetStaticPaths = makeDetailStaticPaths('pages', ['ja']);

export const getStaticProps: GetStaticProps<WPPageProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };
  const currentLocale = locale === 'default' ? 'ja' : (locale ?? 'ja');
  const page = await getPageBySlug(slug);
  if (!page) {
    const rawPost = await getPostBySlug(slug);
    if (rawPost) {
      const post = parseWPPostUnknown(rawPost);
      if (post) {
        const terms = post._embedded?.['wp:term'];
        const categories = Array.isArray(terms) ? terms[0] : undefined;
        const categorySlug = categories?.[0]?.slug;
        const type = resolvePostType(categorySlug);
        const lang = post.acf?.lang ?? 'ja';
        return {
          redirect: {
            destination: getPostUrl(type, slug, lang),
            permanent: true,
          },
        };
      }
    }
    return { notFound: true, revalidate: REVALIDATE_NOT_FOUND };
  }
  const normalized = normalizePageContent(page);

  return {
    props: {
      title: normalized.title,
      html: normalized.html,
      locale: currentLocale,
    },
  };
};
