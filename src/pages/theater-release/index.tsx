// ISR: revalidate REVALIDATE_DAILY — 劇場公開情報（週次まとめ記事）アーカイブ
import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticProps } from 'next';
import { REVALIDATE_DAILY } from '@/config/revalidate.config';
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { I18nProvider } from '@/i18n/provider';
import { t, type Locale } from '@/i18n/t';
import { messages } from '@/i18n/theaterReleasePageMessages';
import { getTheaterReleases } from '@/libs/api/wordpress';
import { getTheaterReleaseArchivePath, getTheaterReleaseUrl, normalizeRouteLocale } from '@/libs/route';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

type TheaterReleaseListItem = {
  slug: string;
  title: string;
  publishedAt: string;
};

type TheaterReleaseArchiveProps = {
  items: TheaterReleaseListItem[];
  locale: string;
};

const TheaterReleaseArchivePage = ({ items, locale }: TheaterReleaseArchiveProps) => {
  const loc = normalizeRouteLocale(locale) as Locale;
  // 記事は日本語のみのため、canonical はロケールに関わらず /ja/ に固定する（en側の重複コンテンツ回避）
  const canonicalUrl = `${SITE_URL}${getTheaterReleaseArchivePath('ja')}`;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{t(messages, ['head', 'archiveTitle'], loc)}</title>
        <meta name='description' content={t(messages, ['head', 'archiveDescription'], loc)} />
        <link rel='canonical' href={canonicalUrl} />
      </Head>
      <PageLayout>
        <div className='bg-secondary'>
          <div className='px-4 pt-3 pb-0'>
            <Breadcrumb
              items={[
                { label: t(messages, ['breadcrumb', 'home'], loc), href: '/' },
                { label: t(messages, ['breadcrumb', 'theaterRelease'], loc) },
              ]}
            />
          </div>
          <section className='px-4 py-8 md:py-12'>
            <div className='space-y-2'>
              <p className='font-ui text-xs tracking-[0.2em] text-score-accent uppercase'>
                {t(messages, ['archive', 'kicker'], loc)}
              </p>
              <h1 className='font-bold text-color-inverse'>
                {t(messages, ['archive', 'title'], loc)}
              </h1>
              <p className='text-sm text-[rgba(255,255,255,0.7)]'>
                {t(messages, ['archive', 'lead'], loc)}
              </p>
            </div>
          </section>
        </div>

        <div className='mx-auto max-w-3xl px-4 py-8 pb-12'>
          {items.length ? (
            <ul className='m-0 list-none space-y-3 p-0'>
              {items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={getTheaterReleaseUrl(item.slug, loc)}
                    className='block rounded-lg border border-color-border bg-color-bg p-4 no-underline transition-opacity hover:opacity-90'
                  >
                    <p className='font-ui text-xs text-color-secondary'>
                      {item.publishedAt.slice(0, 10)}
                    </p>
                    <p className='mt-1 font-medium text-color-primary'>{item.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-color-secondary'>{t(messages, ['archive', 'empty'], loc)}</p>
          )}
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default TheaterReleaseArchivePage;

export const getStaticProps: GetStaticProps<TheaterReleaseArchiveProps> = async ({ locale }) => {
  const releases = await getTheaterReleases();

  return {
    props: {
      items: releases.map((release) => ({
        slug: release.slug,
        title: release.title.rendered,
        publishedAt: release.date,
      })),
      locale: normalizeRouteLocale(locale),
    },
    revalidate: REVALIDATE_DAILY,
  };
};
