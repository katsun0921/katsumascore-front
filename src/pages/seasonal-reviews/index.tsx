// ISR: revalidate REVALIDATE_NORMAL — 季節レビュー一覧
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { REVALIDATE_NORMAL } from '@/config/revalidate.config';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostCardImgLeft } from '@/components/ui-section/PostCard/PostCardImgLeft';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
// 一覧の組み立て・定数は `@/libs/seasonalReviewIndex` に置く（TOP の特集枠と共有するため）。
// ページからの再エクスポートは Next のビルドが剥がすため行わない。
import { buildSeasonalIndexProps, type SeasonalIndexProps } from '@/libs/seasonalReviewIndex';

const SeasonalIndexPage = ({ items, locale }: SeasonalIndexProps) => {
  const loc = (locale ?? 'ja') as Locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>季節のレビュー | KatsumaScore</title>
        <meta name='description' content='季節ごとのアニメ・ドラマレビュー一覧' />
      </Head>
      <PageLayout>
        <div className='px-4 py-8 max-w-5xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6 text-color-primary'>季節のレビュー</h1>
          {items.length === 0 ? (
            <p className='text-sm text-color-secondary'>現在表示できるページがありません。</p>
          ) : (
            <ul className='grid list-none grid-cols-1 gap-4 p-0 m-0 lg:grid-cols-2'>
              {items.map((item) => (
                <li key={item.id}>
                  <PostCardImgLeft post={item} />
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
  return {
    props: await buildSeasonalIndexProps(locale),
    revalidate: REVALIDATE_NORMAL,
  };
};
