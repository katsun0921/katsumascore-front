import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/components/features/Post/types/post';
import './HomeRanking.scss';

export type HomeRankingProps = {
  posts: Post[];
  seeAllHref?: string;
};

const HexScoreSmall = ({ score, isTop }: { score: number; isTop: boolean }) => {
  const color = isTop ? 'var(--color-score-border)' : 'var(--color-score-rank-s-text)';
  return (
    <svg
      width='30'
      height='32'
      viewBox='0 0 28 30'
      aria-label={`スコア ${score}`}
      className='homeRankingItem__hexScore'
    >
      <polygon
        points='14,1 27,8 27,22 14,29 1,22 1,8'
        fill='var(--color-score-bg)'
        stroke={color}
        strokeWidth='1'
      />
      <text
        x='14'
        y='18'
        textAnchor='middle'
        fill={color}
        fontSize='8'
        fontWeight='700'
        fontFamily='var(--font-ui)'
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
};

export const HomeRanking = ({ posts, seeAllHref }: HomeRankingProps) => {
  return (
    <section className='homeRanking'>
      <div className='homeRanking__header'>
        <div>
          <p className='homeRanking__badge'>KATSUMASCORE</p>
          <h2 className='homeRanking__title'>TOP 10 ランキング</h2>
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} className='homeRanking__seeAll'>
            すべて見る →
          </Link>
        )}
      </div>

      <ol className='homeRanking__list'>
        {posts.map((post, index) => {
          const rank = index + 1;
          const isTop = rank === 1;
          const isTop3 = rank <= 3;
          return (
            <li key={post.id} className={`homeRankingItem${isTop ? ' homeRankingItem--top' : ''}`}>
              <Link href={post.slug} className='homeRankingItem__inner'>
                <span
                  className={`homeRankingItem__rank${isTop3 ? ` homeRankingItem__rank--top${rank}` : ''}`}
                >
                  {rank}
                </span>
                <div className='homeRankingItem__thumb'>
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={`${post.title}のサムネイル`}
                      fill
                      sizes='56px'
                      className='homeRankingItem__thumbImg'
                    />
                  ) : (
                    <span className='homeRankingItem__thumbFallback' aria-hidden='true' />
                  )}
                </div>
                <div className='homeRankingItem__info'>
                  <p className='homeRankingItem__name'>{post.title}</p>
                  <p className='homeRankingItem__meta'>
                    {[post.category, post.year].filter(Boolean).join(' ・ ')}
                  </p>
                </div>
                {post.score !== undefined && (
                  <HexScoreSmall score={post.score} isTop={isTop} />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
