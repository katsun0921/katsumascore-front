import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticProps } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getChildPages } from '@/lib/api/wordpress';
import { stripHtml } from '@/lib/api/wordpress';
import type { SeasonItem } from '@/components/ui-home/HomeSeasonReview';

type SeasonalIndexProps = {
  items: SeasonItem[];
  locale: string;
};

const SeasonalIndexPage = ({ items, locale }: SeasonalIndexProps) => {
  const loc = (locale ?? 'ja') as Locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>季節のレビュー | KatsumaScore</title>
        <meta name='description' content='季節ごとのアニメ・ドラマレビュー一覧' />
      </Head>
      <PageLayout>
        <div className='px-4 py-8 max-w-2xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6 text-color-primary'>季節のレビュー</h1>
          {items.length === 0 ? (
            <p className='text-sm text-color-secondary'>現在表示できるページがありません。</p>
          ) : (
            <ul className='space-y-3'>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className='block rounded-lg border border-color-border px-4 py-3 text-color-primary hover:border-category'
                  >
                    <span className='font-medium'>{item.label}</span>
                    <span className='ml-3 text-sm text-color-secondary'>{item.period}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default SeasonalIndexPage;

export const getStaticProps: GetStaticProps<SeasonalIndexProps> = async ({ locale }) => {
  const currentLocale = locale ?? 'ja';
  const lang = currentLocale === 'en' ? 'en' : 'ja';
  const parentRaw = process.env.WP_SEASONAL_REVIEW_PARENT_ID;
  const items: SeasonItem[] =
    parentRaw && /^\d+$/.test(parentRaw)
      ? (await getChildPages(Number(parentRaw), lang)).map((p) => ({
          label: stripHtml(p.title.rendered),
          period: (p.modified ?? p.date).slice(0, 10),
          href: `/seasonal-reviews/${p.slug}`,
        }))
      : [];

  return {
    props: { items, locale: currentLocale },
    revalidate: 60,
  };
};
