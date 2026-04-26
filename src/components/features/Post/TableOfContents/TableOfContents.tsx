'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import type { TocItem } from '@/lib/toc'
import { messages } from './i18n'
export type TableOfContentsProps = {
  items: TocItem[]
}

export const TableOfContents = ({ items }: TableOfContentsProps) => {
  const locale = useLocale()
  const [activeId, setActiveId] = useState<string>('')
  const [isContentEnded, setIsContentEnded] = useState(false)
  const tocRef = useRef<HTMLElement>(null)
  const tocOffsetRef = useRef<number | null>(null)
  const [isTocAtTop, setIsTocAtTop] = useState(false)

  useEffect(() => {
    const toc = tocRef.current
    if (!toc) return
    const win = toc.ownerDocument.defaultView
    if (!win) return

    tocOffsetRef.current = toc.getBoundingClientRect().top + win.scrollY

    const onScroll = () => {
      if (tocOffsetRef.current === null) return
      setIsTocAtTop(win.scrollY >= tocOffsetRef.current)
    }

    const onResize = () => {
      // stickyを外さずに元のDOM位置を再計算する
      // tocがstickyの場合 getBoundingClientRect().top は 0 になるため
      // 親要素の位置から算出する
      const parent = toc.parentElement
      if (!parent) return
      const parentRect = parent.getBoundingClientRect()
      tocOffsetRef.current = parentRect.top + win.scrollY
      setIsTocAtTop(win.scrollY >= tocOffsetRef.current)
    }

    win.addEventListener('scroll', onScroll, { passive: true })
    win.addEventListener('resize', onResize, { passive: true })
    return () => {
      win.removeEventListener('scroll', onScroll)
      win.removeEventListener('resize', onResize)
    }
  }, [])

  // .p-content の bottom が viewport 上端を抜けたら sticky を解除する
  useEffect(() => {
    const content = document.querySelector('.p-content')
    if (!content) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isPast = !entry.isIntersecting && entry.boundingClientRect.bottom < 0
        setIsContentEnded(isPast)
      },
      { threshold: 0 }
    )

    observer.observe(content)
    return () => observer.disconnect()
  }, [])

// アクティブ制御（画面中央付近で判定・1つだけ）
  useEffect(() => {
    if (items.length === 0) return

    const headings = Array.from(document.querySelectorAll<HTMLElement>('.p-content h2, .p-content h3, .p-content h4'))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    )

    headings.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <>
      <nav
        ref={tocRef}
        className={['toc', isTocAtTop && !isContentEnded ? 'toc--sticky' : ''].join(' ')}
        aria-label={t(messages, ['heading', 'label'], locale)}
      >
        <p className='toc__heading'>{t(messages, ['heading', 'label'], locale)}</p>
        <ol className='toc__list'>
          {items.map((item) => (
            <li
              key={item.id}
              className={[
                'toc__item',
                `toc__item--level-${item.level}`,
                activeId === item.id ? 'toc__item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <a
                href={`#${item.id}`}
                aria-current={activeId === item.id ? 'true' : undefined}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
