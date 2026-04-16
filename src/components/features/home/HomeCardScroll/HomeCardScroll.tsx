import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/components/features/Post/types/post';
import { type VodService, VOD_COLOR_VAR } from '@/lib/vod';
import './HomeCardScroll.scss';

export type HomeCardScrollProps = {
  title?: string;
  posts: Post[];
  seeAllHref?: string;
  icon?: 'star' | null;
};

const HexScoreCard = ({ score }: { score: number }) => {
  const isHigh = score >= 3.5;
  const color = isHigh ? 'var(--color-score-border)' : 'var(--color-score-rank-s-text)';
  return (
    <svg
      width='24'
      height='26'
      viewBox='0 0 24 26'
      aria-label={`スコア ${score}`}
      className='homeScrollCard__hexScore'
    >
      <polygon
        points='12,1 23,7 23,19 12,25 1,19 1,7'
        fill='rgba(20,8,46,0.8)'
        stroke={color}
        strokeWidth='1'
      />
      <text
        x='12'
        y='16'
        textAnchor='middle'
        fill={color}
        fontSize='7'
        fontWeight='700'
        fontFamily='var(--font-ui)'
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
};

export const HomeCardScroll = ({ title, posts, seeAllHref, icon }: HomeCardScrollProps) => {
  return (
    <section className='homeCardScroll'>
      {(title || seeAllHref) && (
        <div className='homeCardScroll__header'>
          {title && (
            <div className='homeCardScroll__titleRow'>
              {icon === 'star' && (
                <svg width='14' height='14' viewBox='0 0 14 14' aria-hidden='true'>
                  <polygon
                    points='7,1 9,5 13,5.5 10,8.5 11,12.5 7,10.5 3,12.5 4,8.5 1,5.5 5,5'
                    fill='var(--color-score-border)'
                    opacity='0.7'
                  />
                </svg>
              )}
              <h2 className='homeCardScroll__title'>{title}</h2>
            </div>
          )}
          {seeAllHref && (
            <Link href={seeAllHref} className='homeCardScroll__seeAll'>
              すべて見る →
            </Link>
          )}
        </div>
      )}

      <div className='homeCardScroll__track'>
        {posts.map((post) => (
          <Link key={post.id} href={post.slug} className='homeScrollCard'>
            <div className='homeScrollCard__thumb'>
              {post.image ? (
                <Image
                  src={post.image}
                  alt={`${post.title}のサムネイル`}
                  fill
                  sizes='160px'
                  className='homeScrollCard__thumbImg'
                />
              ) : (
                <span className='homeScrollCard__thumbFallback' aria-hidden='true' />
              )}
              {post.score !== undefined && <HexScoreCard score={post.score} />}
              {post.vods && post.vods.length > 0 && (
                <div className='homeScrollCard__vods'>
                  {(post.vods as VodService[]).slice(0, 3).map((vod) => (
                    <span
                      key={vod}
                      className='homeScrollCard__vodDot'
                      style={{ background: VOD_COLOR_VAR[vod] }}
                      aria-label={vod}
                    />
                  ))}
                </div>
              )}
            </div>
            <p className='homeScrollCard__title'>{post.title}</p>
            {post.category && <p className='homeScrollCard__meta'>{post.category}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
};
