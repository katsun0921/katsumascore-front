import Head from 'next/head';
import { NotFoundTemplate } from '@/components/templates/NotFoundTemplate';

const NotFound = () => {
  return (
    <>
      <Head>
        <title>404 - ページが見つかりませんでした | KatsumaScore</title>
      </Head>
      <NotFoundTemplate />
    </>
  );
};

export default NotFound;
