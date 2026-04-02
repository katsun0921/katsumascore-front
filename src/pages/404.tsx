import Head from 'next/head';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - ページが見つかりませんでした | KatsumaScore</title>
      </Head>
      <PageLayout>
        <div>
          <p>404</p>
          <h1>
            ページが見つかりませんでした
          </h1>
          <p>
            お探しのページは存在しないか、移動・削除された可能性があります。
          </p>
          <Link
            href="/"
          >
            トップページへ戻る
          </Link>
        </div>
      </PageLayout>
    </>
  );
}
