// SSG（ISR なし）: ビルド時に ja / en を静的生成する固定ページ
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { AboutTemplate } from '@/components/templates/AboutTemplate';
import { messages as aboutMessages } from '@/components/templates/AboutTemplate/i18n';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { t } from '@/i18n/t';

type AboutPageProps = {
  locale: Locale;
};

const AboutPage = ({ locale }: AboutPageProps) => {
  const loc = locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{t(aboutMessages, ['meta', 'title'], loc)}</title>
        <meta name='description' content={t(aboutMessages, ['meta', 'description'], loc)} />
      </Head>
      <AboutTemplate />
    </I18nProvider>
  );
};

export default AboutPage;

export const getStaticProps: GetStaticProps<AboutPageProps> = async (ctx) => {
  const locale = ctx.locale === 'en' ? 'en' : 'ja';
  return {
    props: { locale },
  };
};
