/**
 * Storybook 専用：サヨを TOP／リストに置いた見え方を確かめる枠。本番からは import しない。
 * 架空の SayoClient（sayoMockClient）を渡し、通信せずに通しで動かす。
 */
import { useMemo } from 'react';
import { HomeCard } from '@/components/ui-home/HomeCard';
import { PostCardImgLeft } from '@/components/ui-section/PostCard/PostCardImgLeft';
import { PostCardImgTop } from '@/components/ui-section/PostCard/PostCardImgTop';
import { SayoProvider } from '@/components/features/sayo/SayoProvider';
import type { SayoInitialState } from '@/components/features/sayo/SayoProvider';
import { SayoEntry } from '@/components/features/sayo/SayoEntry';
import { SayoCardAction } from '@/components/features/sayo/SayoCardAction';
import { sayoMockArticles, sayoMockChips } from '@/mocks/sayo';
import type { Post } from '@/types/post';
import type { SayoArticle } from '@/types/sayo';
import { createSayoMockClient } from './sayoMockClient';
import type { SayoMockOptions } from './sayoMockClient';

export type SayoStoryFrameProps = {
  view: 'top' | 'list';
  options?: SayoMockOptions;
  initial?: SayoInitialState;
};

const toPost = (a: SayoArticle): Post => ({
  id: String(a.id), slug: a.href, title: a.title, excerpt: `${a.moodTags.join('・')}の作品。`, image: a.image,
  publishedAt: '2026-10-20', category: a.category, score: a.score,
});

const chips = sayoMockChips.map((c) => c.label);

export const SayoStoryFrame = ({ view, options, initial }: SayoStoryFrameProps) => {
  const client = useMemo(() => createSayoMockClient(options), [options]);
  const ids = sayoMockArticles.map((a) => a.id);
  const isList = view === 'list';
  const category = isList ? '映画' : undefined;
  const pool = isList ? sayoMockArticles.filter((a) => a.category === '映画') : sayoMockArticles;
  const listIds = pool.map((a) => a.id);
  const [lead, ...rest] = pool;
  return (
    <SayoProvider client={client} chips={chips} category={category} initialRemaining={options?.remaining} initial={initial}>
      {isList ? (
        <div className='min-h-screen bg-[var(--color-bg)]'>
          <div className='bg-[var(--color-secondary)] px-4 py-8 text-[color:var(--color-text-inverse)]'>
            <p className='text-[length:var(--font-size-caption)] text-[color:var(--color-accent-strong)]'>MOVIE</p>
            <h1 className='text-[length:var(--font-size-h1)] font-bold'>映画</h1>
          </div>
          <div className='mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8'>
            <SayoEntry />
            <PostCardImgLeft post={toPost(lead)} action={<SayoCardAction articleId={lead.id} title={lead.title} groupIds={listIds} size='long' />} />
            <div className='grid grid-cols-2 gap-3 lg:grid-cols-3'>
              {rest.map((a) => (
                <PostCardImgTop key={a.id} post={toPost(a)} action={<SayoCardAction articleId={a.id} title={a.title} groupIds={listIds} />} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='min-h-screen bg-[var(--color-bg-dark)] py-6 text-[color:var(--color-text-inverse)]'>
          <div className='px-4 pb-4'>
            <SayoEntry />
          </div>
          <h2 className='px-4 pb-3 text-[length:var(--font-size-h3)] font-bold'>最新レビュー</h2>
          <div className='flex gap-3 overflow-x-auto px-4 pb-2'>
            {sayoMockArticles.map((a) => (
              <HomeCard key={a.id} post={toPost(a)} action={<SayoCardAction articleId={a.id} title={a.title} groupIds={ids} />} />
            ))}
          </div>
        </div>
      )}
    </SayoProvider>
  );
};
