'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import { getRankingIcon } from '@/components/features/ScoreWithRank/getRankingIcon';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
export type PickUpPost = {
  slug: string
  title: string
  thumbnailUrl?: string
  score?: number
}

export type PickUpAndScoreProps = {
  pickupPosts: PickUpPost[]
  highScorePosts: PickUpPost[]
  /** CSR フェッチ中は true。スケルトンを表示してレイアウトシフトを防ぐ */
  highScoreLoading?: boolean
}

type Tab = 'pickup' | 'highscore'

// ── 各記事行の共通UI
const PostRow = ({ post }: { post: PickUpPost }) => {
  const locale = useLocale();
  const rank = post.score !== undefined ? getRankingIcon(post.score) : null;
  const altText = t(messages, ['thumbnail', 'alt'], locale);

  return (
    <li className='sidebar-picks__item'>
      <Link href={post.slug} locale={linkLocaleForHref(post.slug)} className='sidebar-picks__link'>
        {/* サムネイル */}
        <div className='sidebar-picks__thumb'>
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt={altText}
              width={64}
              height={64}
              className='sidebar-picks__thumb-img'
            />
          ) : (
            <div className='sidebar-picks__thumb-fallback' aria-hidden='true' />
          )}
        </div>

        {/* テキスト + スコアアイコン */}
        <div className='sidebar-picks__body'>
          <span className='sidebar-picks__title'>{post.title}</span>
          {rank && (
            <Image
              src={rank.src}
              alt={`rank ${rank.label}`}
              width={20}
              height={20}
              className='sidebar-picks__rank'
            />
          )}
        </div>
      </Link>
    </li>
  );
};

const SKELETON_COUNT = 5;

const PickUpAndScoreSkeleton = () => (
  <div className='sidebar-picks'>
    <div className='sidebar-picks__skeleton-tab' aria-hidden='true' />
    <ul className='sidebar-picks__skeleton-list'>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <li key={i} className='sidebar-picks__skeleton-item'>
          <div className='sidebar-picks__skeleton-thumb' />
          <div className='sidebar-picks__skeleton-body'>
            <div className='sidebar-picks__skeleton-line sidebar-picks__skeleton-line--long' />
            <div className='sidebar-picks__skeleton-line sidebar-picks__skeleton-line--short' />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export const PickUpAndScore = ({
  pickupPosts,
  highScorePosts,
  highScoreLoading = false,
}: PickUpAndScoreProps) => {
  const locale = useLocale();

  // PICK UP が空なら HIGH SCORE をデフォルトタブにする
  const defaultTab: Tab = pickupPosts.length > 0 ? 'pickup' : 'highscore';
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  // ローディング中はスケルトンを表示（レイアウトシフト防止）
  if (highScoreLoading && pickupPosts.length === 0) return <PickUpAndScoreSkeleton />;

  // 両方空なら非表示
  if (pickupPosts.length === 0 && highScorePosts.length === 0) return null;

  const showPickupTab    = pickupPosts.length > 0;
  const showHighscoreTab = highScorePosts.length > 0;
  const currentPosts     = activeTab === 'pickup' ? pickupPosts : highScorePosts;

  return (
    <div className='sidebar-picks'>
      {/* タブ */}
      <div className='sidebar-picks__tabs' role='tablist'>
        {showPickupTab && (
          <button
            role='tab'
            aria-selected={activeTab === 'pickup'}
            className={[
              'sidebar-picks__tab',
              activeTab === 'pickup' ? 'sidebar-picks__tab--active' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => setActiveTab('pickup')}
          >
            {t(messages, ['tab', 'pickup'], locale)}
          </button>
        )}
        {showHighscoreTab && (
          <button
            role='tab'
            aria-selected={activeTab === 'highscore'}
            className={[
              'sidebar-picks__tab',
              activeTab === 'highscore' ? 'sidebar-picks__tab--active' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => setActiveTab('highscore')}
          >
            {t(messages, ['tab', 'highscore'], locale)}
          </button>
        )}
      </div>

      {/* リスト */}
      <ul className='sidebar-picks__list'>
        {currentPosts.slice(0, 5).map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}
      </ul>
    </div>
  );
};
