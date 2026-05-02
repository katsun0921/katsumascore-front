'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { TocItem } from '@/libs/toc';
import { messages } from './i18n';
export type TableOfContentsProps = {
  items: TocItem[]
}

export const TableOfContents = ({ items }: TableOfContentsProps) => {
  const locale = useLocale();
  const [activeId, setActiveId] = useState<string>('');
  const [isFixed, setIsFixed] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const preFixedNavHeightRef = useRef(0);
  const contentSelector = '#js-content';
  const getFixedBarHeight = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return 60;
    const rawHeight = getComputedStyle(nav).getPropertyValue('--toc-fixed-bar-height');
    const height = Number.parseFloat(rawHeight);
    if (Number.isFinite(height)) return height;
    return 60;
  }, []);

  useEffect(() => {
    const content = document.querySelector<HTMLElement>(contentSelector);
    if (!content) return;
    const win = content.ownerDocument.defaultView;
    if (!win) return;

    const onScroll = () => {
      const fixedBarHeight = getFixedBarHeight();
      const rect = content.getBoundingClientRect();
      setIsFixed(rect.top <= fixedBarHeight && rect.bottom > fixedBarHeight);
    };

    onScroll();
    win.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      win.removeEventListener('scroll', onScroll);
    };
  }, [getFixedBarHeight]);

  // toc--fixed 時は position:fixed 適用前の nav 高さを placeholder で維持する
  useLayoutEffect(() => {
    const placeholder = placeholderRef.current;
    const nav = navRef.current;
    if (!placeholder || !nav) return;

    if (!isFixed) {
      // fixed 解除直後: placeholder をまだクリアせず nav の自然な高さを計測してからクリア
      placeholder.style.height = '';
      const h = nav.offsetHeight;
      preFixedNavHeightRef.current = h;
    } else {
      const stored = preFixedNavHeightRef.current;
      if (stored > 0) {
        placeholder.style.height = `${stored}px`;
      }
    }

    const syncResize = () => {
      if (isFixed) return;
      placeholder.style.height = '';
      const h = nav.offsetHeight;
      preFixedNavHeightRef.current = h;
    };

    const win = placeholder.ownerDocument.defaultView;
    if (!win) return;
    win.addEventListener('resize', syncResize, { passive: true });
    return () => {
      win.removeEventListener('resize', syncResize);
    };
  }, [isFixed, items]);

  // toc--fixed 時にアクティブアイテム分だけリスト全体を左へ移動する
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (!isFixed) {
      list.style.setProperty('--toc-active-offset', '0px');
      return;
    }
    const activeItem = list.querySelector<HTMLElement>('.toc__item--active');
    if (!activeItem) {
      list.style.setProperty('--toc-active-offset', '0px');
      return;
    }
    list.style.setProperty('--toc-active-offset', `${activeItem.offsetLeft}px`);
  }, [activeId, isFixed]);

// アクティブ制御（画面中央付近で判定・1つだけ）
  useEffect(() => {
    if (items.length === 0) return;

    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(`${contentSelector} h2, ${contentSelector} h3, ${contentSelector} h4`),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-30% 0px -15% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    headings.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <>
      <div ref={placeholderRef} className='toc__placeholder'>
      <nav
        ref={navRef}
        className={['toc', isFixed ? 'toc--fixed' : ''].join(' ')}
        aria-label={t(messages, ['heading', 'label'], locale)}
      >
        <div ref={innerRef} className='toc__inner'>
          <p className='toc__heading'>{t(messages, ['heading', 'label'], locale)}</p>
          <ol ref={listRef} className='toc__list'>
            {items.map((item) => (
              <li
                key={item.id}
                className={[
                  'toc__item',
                  `toc__item--level-${item.level}`,
                  isFixed && activeId === item.id ? 'toc__item--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <a
                  href={`#${item.id}`}
                  aria-current={isFixed && activeId === item.id ? 'true' : undefined}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
      </div>
    </>
  );
};
