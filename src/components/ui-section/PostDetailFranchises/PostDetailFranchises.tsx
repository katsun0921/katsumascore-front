import Link from 'next/link';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { PostCardGrid } from '@/components/ui-section/PostCard';
import type { PostDetailFranchiseItem } from '@/components/templates/PostDetail/PostDetail.types';
import { messages } from './i18n';

type Props = {
  franchises: PostDetailFranchiseItem[]
}

export const PostDetailFranchises = ({ franchises }: Props) => {
  const locale = useLocale();
  const validFranchises = franchises.filter((f) => f.posts.length > 0);
  if (validFranchises.length === 0) return null;

  return (
    <section className='postDetailFranchises'>
      <h2 className='postDetailFranchises__sectionHeading'>
        {t(messages, ['section', 'heading'], locale)}
      </h2>
      {validFranchises.map((franchise) => (
        <div key={franchise.id} className='postDetailFranchises__group'>
          <h3 className='postDetailFranchises__franchiseHeading'>
            <Link href={`/franchise/${franchise.slug}`}>
              {franchise.title}
            </Link>
          </h3>
          <PostCardGrid posts={franchise.posts} columnNum={3} postCardKind='imgTop' />
        </div>
      ))}
    </section>
  );
};
