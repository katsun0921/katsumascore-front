import React from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/templates/PageLayout';

export const NotFoundTemplate = () => {
  return (
    <PageLayout>
      <div>
        <p>404</p>
        <h1>ページが見つかりませんでした</h1>
        <p>お探しのページは存在しないか、移動・削除された可能性があります。</p>
        <Link href='/'>トップページへ戻る</Link>
      </div>
    </PageLayout>
  );
};
