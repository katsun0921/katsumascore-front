// ISR: revalidate 60s — TOPページ
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import type { HomeTemplateProps } from '@/components/templates/HomeTemplate/HomeTemplate.types';
import { loadHomeTemplateProps } from '@/libs/homeStaticProps';

type Props = HomeTemplateProps;

const Home = (props: Props) => {
  return (
    <>
      <Head>
        <title>KatsumaScore</title>
      </Head>
      <HomeTemplate {...props} />
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const locale = ctx.locale ?? 'ja';
  const props = await loadHomeTemplateProps(locale);
  return {
    props,
    revalidate: 60,
  };
};
