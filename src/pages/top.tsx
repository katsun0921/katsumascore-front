// SSG — WordPress 固定ページは参照しない（コンテンツは別経路で管理）
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { t } from '@/i18n/t';
import { messages } from '@/i18n/topPageMessages';

type TopPageProps = {
  locale: string;
};

const TopPage = ({ locale }: TopPageProps) => {
  const loc = (locale ?? 'ja') as Locale;
  const titlePart = t(messages, ['head', 'title'], loc);
  const heading = t(messages, ['page', 'heading'], loc);
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>
          {titlePart} | KatsumaScore
        </title>
      </Head>
      <PageLayout>
        <div className='px-4 py-8 max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6 text-color-primary'>{heading}</h1>
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default TopPage;

export const getStaticProps: GetStaticProps<TopPageProps> = async ({ locale }) => {
  const currentLocale = locale ?? 'ja';
  return {
    props: {
      locale: currentLocale,
    },
  };
};
