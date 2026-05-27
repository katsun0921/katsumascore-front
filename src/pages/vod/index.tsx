// ISR: revalidate 86400s（1日）— VOD ハブ（/ja/vod 等）
import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticProps } from 'next';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PageLayout } from '@/components/templates/PageLayout';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { t } from '@/i18n/t';
import { buildVodFinderItemsFromTerms } from '@/libs/vodPathToWpSlug';
import { normalizeRouteLocale } from '@/libs/route';
import { VOD_COLOR_VAR, type VodService } from '@/libs/vod';
import { messages } from '@/i18n/vodPageMessages';
import type { VodFinderItem } from '@/components/ui-home/HomeVodFinder';
import { getVodTerms } from '@/libs/api/wordpress/endpoints/vodTaxonomy';

type VodHubProps = {
  locale: string;
  vodItems: VodFinderItem[];
};

const VodHubPage = ({ locale, vodItems }: VodHubProps) => {
  const loc = normalizeRouteLocale(locale) as Locale;
  const items = vodItems;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{t(messages, ['head', 'title'], loc)}</title>
        <meta name='description' content={t(messages, ['head', 'description'], loc)} />
      </Head>
      <PageLayout>
        <div className='bg-secondary'>
          <div className='px-4 pt-3 pb-0'>
            <Breadcrumb
              items={[
                { label: t(messages, ['breadcrumb', 'home'], loc), href: '/' },
                { label: t(messages, ['breadcrumb', 'vod'], loc) },
              ]}
            />
          </div>
          <section className='px-4 py-8 md:py-12'>
            <div className='space-y-2'>
              <p className='font-ui text-xs tracking-[0.2em] text-score-accent uppercase'>
                {t(messages, ['hero', 'kicker'], loc)}
              </p>
              <h1 className='font-bold text-color-inverse'>{t(messages, ['hero', 'title'], loc)}</h1>
              <p className='text-sm text-[rgba(255,255,255,0.7)]'>{t(messages, ['hero', 'lead'], loc)}</p>
            </div>
          </section>
        </div>

        <div className='px-4 py-8 pb-12'>
          <ul className='m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4'>
            {items.map(({ vod, label, href }) => (
              <li key={vod}>
                <VodHubLink vod={vod} label={label} href={href} />
              </li>
            ))}
          </ul>
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

const VodHubLink = ({ vod, label, href }: { vod: VodService; label: string; href: string }) => (
  <Link
    href={href}
    className='flex items-center gap-3 rounded-lg border border-color-border bg-color-bg p-4 no-underline transition-opacity hover:opacity-90'
  >
    <span
      className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-ui text-sm font-bold text-color-inverse'
      style={{ background: VOD_COLOR_VAR[vod] }}
      aria-hidden='true'
    >
      {label[0].toUpperCase()}
    </span>
    <span className='font-ui text-sm font-medium text-color-primary'>{label}</span>
  </Link>
);

export default VodHubPage;

export const getStaticProps: GetStaticProps<VodHubProps> = async ({ locale }) => {
  const terms = await getVodTerms();
  const vodItems = buildVodFinderItemsFromTerms(terms ?? []);

  return {
    props: {
      locale: normalizeRouteLocale(locale),
      vodItems,
    },
    revalidate: 86400,
  };
};
