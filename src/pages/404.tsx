import Head from 'next/head';
import { NotFoundTemplate } from '@/components/templates/NotFoundTemplate/NotFoundTemplate';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - ページが見つかりませんでした | KatsumaScore</title>
      </Head>
      <NotFoundTemplate />
    </>
  );
}
