'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { CloseIcon, PlayIcon } from '@/assets/icons';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { Post } from '@/types/post';

export type HomeShortsProps = {
  title: string;
  posts: Post[];
};

const FALLBACK_IMAGE = '/images/mock-image.webp';

/** ショート動画モーダル用の YouTube 埋め込み URL を組み立てる */
const buildEmbedUrl = (videoId: string): string =>
  `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;

export const HomeShorts = ({ title, posts }: HomeShortsProps) => {
  const locale = useLocale();
  const [activePost, setActivePost] = useState<Post | null>(null);

  const closeModal = useCallback(() => setActivePost(null), []);

  useEffect(() => {
    if (!activePost) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [activePost, closeModal]);

  const items = posts.filter((p) => p.shortVideoId !== undefined);
  if (items.length === 0) return null;

  return (
    <section data-component='HomeShorts' className='homeShorts'>
      <h2 className='homeShorts__title'>{title}</h2>

      <div className='homeShorts__track'>
        {items.map((post) => (
          <button
            key={post.id}
            type='button'
            className='homeShorts__card'
            onClick={() => setActivePost(post)}
            aria-haspopup='dialog'
            aria-label={`${t(messages, ['card', 'play'], locale)}: ${post.title}`}
          >
            <span className='homeShorts__thumb'>
              <Image
                src={post.image ?? FALLBACK_IMAGE}
                alt=''
                fill
                sizes='(min-width: 768px) 160px, 128px'
                className='homeShorts__thumbImg'
              />
              <span className='homeShorts__playBadge' aria-hidden='true'>
                <PlayIcon width='20' height='20' />
              </span>
            </span>
            <span className='homeShorts__cardTitle'>{post.title}</span>
          </button>
        ))}
      </div>

      {activePost?.shortVideoId !== undefined && (
        <div
          className='homeShorts__modal'
          role='dialog'
          aria-modal='true'
          aria-label={activePost.title}
          onClick={closeModal}
        >
          <div className='homeShorts__modalInner' onClick={(e) => e.stopPropagation()}>
            <button
              type='button'
              className='homeShorts__modalClose'
              onClick={closeModal}
              aria-label={t(messages, ['modal', 'close'], locale)}
            >
              <CloseIcon width='24' height='24' />
            </button>
            <div className='homeShorts__player'>
              <iframe
                className='homeShorts__iframe'
                src={buildEmbedUrl(activePost.shortVideoId)}
                title={activePost.title}
                allow='autoplay; encrypted-media; picture-in-picture'
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
