// ISR: revalidate 60s — TOPページ
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import type { HomeTemplateProps } from '@/components/templates/HomeTemplate/HomeTemplate.types';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { loadHomeTemplateProps } from '@/libs/homeStaticProps';
import { getLocalePathPrefix, normalizeRouteLocale } from '@/libs/route';
import { toSerializableValue } from '@/utils/toSerializableValue';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';

type Props = HomeTemplateProps & { locale: string };

const pageTitles: Record<Locale, string> = {
  ja: 'katsumascore - 映画とアニメなどを独自視点で考察・感想・解説',
  en: 'katsumascore - Reviews & Analysis of Movies and Anime from a Unique Perspective',
};

const Home = ({ locale, ...templateProps }: Props) => {
  const loc = normalizeRouteLocale(locale) as Locale;
  const canonicalUrl = `${SITE_URL}${getLocalePathPrefix(loc)}`;
  return (
    <>
      <Head>
        <title>{pageTitles[loc]}</title>
        <link rel='canonical' href={canonicalUrl} />
      </Head>
      <I18nProvider locale={loc}>
        <HomeTemplate {...templateProps} />
      </I18nProvider>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const locale = normalizeRouteLocale(ctx.locale);
  const templateProps = await loadHomeTemplateProps(locale);
  return {
    props: toSerializableValue({ ...templateProps, locale }),
    revalidate: 300,
  };
};
