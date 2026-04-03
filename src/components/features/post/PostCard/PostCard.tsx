import Image from 'next/image';
import Link from 'next/link';
import type { PostCardProps } from './PostCard.types';
import styles from './PostCard.module.scss';

const getPostHref = (slug: string) => {
  if (slug.startsWith('/')) {
    return slug;
  }

  return `/${slug}`;
};

const getScoreLabel = (score?: number) => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return null;
  }

  const normalizedScore = Math.max(0, Math.min(5, score));

  return Number.isInteger(normalizedScore)
    ? String(normalizedScore)
    : normalizedScore.toFixed(1);
};

const PostCardSkeleton = ({ variant }: Pick<PostCardProps, 'variant'>) => {
  return (
    <article
      className={[styles.card, variant === 'compact' ? styles.compact : ''].filter(Boolean).join(' ')}
      aria-busy='true'
    >
      <div className={styles.linkSurface}>
        <div className={[styles.media, styles.skeleton].join(' ')} />
        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={[styles.skeleton, styles.skeletonChip].join(' ')} />
            <span className={[styles.skeleton, styles.skeletonDate].join(' ')} />
          </div>
          <span className={[styles.skeleton, styles.skeletonTitle].join(' ')} />
          <span className={[styles.skeleton, styles.skeletonTitleShort].join(' ')} />
          {variant !== 'compact' && (
            <>
              <span className={[styles.skeleton, styles.skeletonExcerpt].join(' ')} />
              <span className={[styles.skeleton, styles.skeletonExcerptShort].join(' ')} />
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export const PostCard = ({
  post,
  variant = 'default',
  isLoading = false,
}: PostCardProps) => {
  if (isLoading) {
    return <PostCardSkeleton variant={variant} />;
  }

  const href = getPostHref(post.slug);
  const scoreLabel = getScoreLabel(post.score);
  const imageAlt = `${post.title}のサムネイル画像`;

  return (
    <article className={[styles.card, variant === 'compact' ? styles.compact : ''].filter(Boolean).join(' ')}>
      <Link
        href={href}
        className={styles.linkSurface}
        aria-label={`${post.title}の記事詳細へ移動`}
      >
        <div className={styles.media}>
          {post.image ? (
            <Image
              src={post.image}
              alt={imageAlt}
              fill
              sizes={variant === 'compact' ? '(max-width: 768px) 100vw, 240px' : '(max-width: 768px) 100vw, 540px'}
              className={styles.image}
            />
          ) : (
            <div
              className={styles.fallback}
              role='img'
              aria-label={`${post.title}の画像はありません`}
            >
              <span className={styles.fallbackLabel}>No Image</span>
            </div>
          )}
          {scoreLabel && (
            <div className={styles.score} aria-label={`スコア ${scoreLabel}`}>
              <span>{scoreLabel}</span>
            </div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.category}>{post.category}</span>
            <time className={styles.date} dateTime={post.publishedAt}>
              {post.publishedAt}
            </time>
          </div>
          <h3 className={styles.title}>{post.title}</h3>
          {variant !== 'compact' && <p className={styles.excerpt}>{post.excerpt}</p>}
        </div>
      </Link>
    </article>
  );
};
