import { PostCardTop } from '@/components/ui-section/PostCard/PostCardTop';
import { PostCardLeft } from '@/components/ui-section/PostCard/PostCardLeft';
import { PostCardSkeleton } from '@/components/ui-parts/PostCard/PostCardSkeleton';
import type { PostListProps } from './PostList.types';
import styles from './PostList.module.scss';

const SKELETON_COUNT = 4;

export const PostList = ({ posts, isLoading = false, variant = 'grid' }: PostListProps) => {
  const items = isLoading
    ? Array.from({ length: SKELETON_COUNT }, (_, index) => `loading-${index}`)
    : posts;

  if (!isLoading && posts.length === 0) {
    return (
      <section className={styles.empty} aria-live='polite'>
        <p className={styles.emptyTitle}>記事がまだありません</p>
        <p className={styles.emptyText}>
          公開された記事がここに表示されます。しばらくしてからもう一度ご確認ください。
        </p>
      </section>
    );
  }

  const listClass = [styles.list, variant === 'grid' ? styles.gridVariant : styles.rowVariant].join(' ');

  return (
    <section aria-busy={isLoading} aria-live='polite'>
      <ul className={listClass}>
        {items.map((item) => (
          <li className={styles.item} key={typeof item === 'string' ? item : item.id}>
            {typeof item === 'string' ? (
              <PostCardSkeleton />
            ) : variant === 'row' ? (
              <PostCardLeft post={item} />
            ) : (
              <PostCardTop post={item} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
