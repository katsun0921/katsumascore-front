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
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-8xl font-bold text-gray-200 mb-4">404</p>
          <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">
            ページが見つかりませんでした
          </h1>
          <p className="text-gray-500 mb-8">
            お探しのページは存在しないか、移動・削除された可能性があります。
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </PageLayout>
    </>
  );
}
