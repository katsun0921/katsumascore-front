// ISR: revalidate 60s — TOPページ
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import type { HomeTemplateProps } from '@/components/templates/HomeTemplate/HomeTemplate.types';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { loadHomeTemplateProps } from '@/libs/homeStaticProps';
import { normalizeRouteLocale } from '@/libs/route';
import { toSerializableValue } from '@/utils/toSerializableValue';

type Props = HomeTemplateProps & { locale: string };

const Home = ({ locale, ...templateProps }: Props) => {
  const loc = normalizeRouteLocale(locale) as Locale;
  return (
    <>
      <Head>
        <title>KatsumaScore</title>
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
    revalidate: 60,
  };
};
