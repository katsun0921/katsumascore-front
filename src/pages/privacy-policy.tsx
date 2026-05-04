// SSG（ISR なし）: ビルド時に ja / en を静的生成する固定ページ
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { PrivacyPolicyTemplate } from '@/components/templates/PrivacyPolicyTemplate';
import { messages as privacyMessages } from '@/components/templates/PrivacyPolicyTemplate/i18n';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { t } from '@/i18n/t';

type PrivacyPolicyPageProps = {
  locale: Locale;
};

const PrivacyPolicyPage = ({ locale }: PrivacyPolicyPageProps) => {
  const loc = locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{t(privacyMessages, ['meta', 'title'], loc)}</title>
        <meta name='description' content={t(privacyMessages, ['meta', 'description'], loc)} />
      </Head>
      <PrivacyPolicyTemplate />
    </I18nProvider>
  );
};

export default PrivacyPolicyPage;

export const getStaticProps: GetStaticProps<PrivacyPolicyPageProps> = async (ctx) => {
  const locale = ctx.locale === 'en' ? 'en' : 'ja';
  return {
    props: { locale },
  };
};
