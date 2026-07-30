import { PostCardGrid } from '@/components/ui-section/PostCard';
import type { Post } from '@/types/post';
import type { PostType } from '@/libs/route';
import styles from './FranchisePostList.module.scss';

type PostGroup = {
  type: PostType;
  label: string;
  posts: Post[];
};

type FranchisePostListProps = {
  posts: Post[];
  heading: string;
  showScore: boolean;
  scoreHeading: string;
  typeLabels: Record<PostType, string>;
};

export const FranchisePostList = ({
  posts,
  heading,
  showScore,
  scoreHeading,
  typeLabels,
}: FranchisePostListProps) => {
  if (posts.length === 0) return null;

  const groups: PostGroup[] = (['movie', 'anime', 'drama'] as PostType[]).flatMap((type) => {
    const filtered = posts.filter((p) => p.type === type);
    return filtered.length > 0 ? [{ type, label: typeLabels[type], posts: filtered }] : [];
  });

  const ungrouped = posts.filter((p) => !p.type || !(['movie', 'anime', 'drama'] as PostType[]).includes(p.type));

  const scoredPosts = showScore
    ? [...posts].filter((p) => p.score !== undefined).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    : [];

  return (
    <>
      <section data-component='FranchisePostList' className={styles.franchisePostList}>
        <h2 className={styles.franchisePostList__heading}>{heading}</h2>
        {groups.map((group) => (
          <div key={group.type} className={styles.franchisePostList__group}>
            <h3 className={styles.franchisePostList__subheading}>{group.label}</h3>
            <PostCardGrid posts={group.posts} columnNum={3} />
          </div>
        ))}
        {ungrouped.length > 0 && (
          <div className={styles.franchisePostList__group}>
            <PostCardGrid posts={ungrouped} columnNum={3} />
          </div>
        )}
      </section>

      {showScore && scoredPosts.length > 0 && (
        <section data-component='FranchisePostList' className={styles.franchiseScoreRanking}>
          <h2 className={styles.franchiseScoreRanking__heading}>{scoreHeading}</h2>
          <ol className={styles.franchiseScoreRanking__list}>
            {scoredPosts.map((post, i) => (
              <li key={post.id} className={styles.franchiseScoreRanking__item}>
                <span className={styles.franchiseScoreRanking__rank}>{i + 1}</span>
                <span className={styles.franchiseScoreRanking__title}>{post.title}</span>
                <span className={styles.franchiseScoreRanking__score}>{post.score}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
};
