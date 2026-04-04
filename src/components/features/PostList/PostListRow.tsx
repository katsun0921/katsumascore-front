import { PostCard } from '@/components/features/PostCard/PostCard';
import type { PostListProps } from './PostList.types';
import styles from './PostList.module.scss';

const SKELETON_COUNT = 4;

export const PostListRow = ({ posts, isLoading = false }: PostListProps) => {
  const items = isLoading ? Array.from({ length: SKELETON_COUNT }, (_, index) => `loading-${index}`) : posts;

  if (!isLoading && posts.length === 0) {
    return (
      <section className={styles.empty} aria-live='polite'>
        <h2 className={styles.emptyTitle}>記事がまだありません</h2>
        <p className={styles.emptyText}>
          公開された記事がここに表示されます。しばらくしてからもう一度ご確認ください。
        </p>
      </section>
    );
  }

  return (
    <section aria-busy={isLoading} aria-live='polite'>
      <ul className={[styles.list, styles.listVariant].join(' ')}>
        {items.map((item) => (
          <li className={styles.item} key={typeof item === 'string' ? item : item.id}>
            {typeof item === 'string' ? (
              <PostCard isLoading />
            ) : (
              <PostCard post={item} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
