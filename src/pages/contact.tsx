// SSG（ISR なし）: ビルド時に ja / en を静的生成する固定ページ
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { ContactTemplate } from '@/components/templates/ContactTemplate';
import { messages as contactMessages } from '@/components/templates/ContactTemplate/i18n';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { t } from '@/i18n/t';

type ContactPageProps = {
  locale: Locale;
};

const ContactPage = ({ locale }: ContactPageProps) => {
  const loc = locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{t(contactMessages, ['meta', 'title'], loc)}</title>
        <meta name='description' content={t(contactMessages, ['meta', 'description'], loc)} />
      </Head>
      <ContactTemplate />
    </I18nProvider>
  );
};

export default ContactPage;

export const getStaticProps: GetStaticProps<ContactPageProps> = async (ctx) => {
  const locale = ctx.locale === 'en' ? 'en' : 'ja';
  return {
    props: { locale },
  };
};
