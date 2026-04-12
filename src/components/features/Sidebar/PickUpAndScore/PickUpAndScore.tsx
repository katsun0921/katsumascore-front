'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getRankingIcon } from '@/components/ui/Score/getRankingIcon'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import './PickUpAndScore.scss'

export type PickUpPost = {
  slug: string
  title: string
  thumbnailUrl?: string
  score?: number
}

export type PickUpAndScoreProps = {
  pickupPosts: PickUpPost[]
  highScorePosts: PickUpPost[]
}

type Tab = 'pickup' | 'highscore'

// ── 各記事行の共通UI
const PostRow = ({ post, locale }: { post: PickUpPost; locale: string }) => {
  const rank = post.score !== undefined ? getRankingIcon(post.score) : null
  const altText = t(messages, ['thumbnail', 'alt'], locale as 'ja' | 'en')

  return (
    <li className='sidebar-picks__item'>
      <Link href={post.slug} className='sidebar-picks__link'>
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
            <img
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
  )
}

export const PickUpAndScore = ({
  pickupPosts,
  highScorePosts,
}: PickUpAndScoreProps) => {
  const locale = useLocale()

  // PICK UP が空なら HIGH SCORE をデフォルトタブにする
  const defaultTab: Tab = pickupPosts.length > 0 ? 'pickup' : 'highscore'
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  // 両方空なら非表示
  if (pickupPosts.length === 0 && highScorePosts.length === 0) return null

  const showPickupTab    = pickupPosts.length > 0
  const showHighscoreTab = highScorePosts.length > 0
  const currentPosts     = activeTab === 'pickup' ? pickupPosts : highScorePosts

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
          <PostRow key={post.slug} post={post} locale={locale} />
        ))}
      </ul>
    </div>
  )
}
